import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Globe, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateFileData, CreateWebsiteData, FileUploadResponse, WebsiteResponse } from '@/hooks/useFiles';

interface FileUploadDialogProps {
  onFileUpload: (data: CreateFileData) => Promise<FileUploadResponse>;
  onWebsiteSubmit: (data: CreateWebsiteData) => Promise<WebsiteResponse>;
}

const FileUploadDialog = ({ onFileUpload, onWebsiteSubmit }: FileUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // File upload form state
  const [fileForm, setFileForm] = useState<CreateFileData>({
    FileName: '',
    FileDescription: '',
    FileType: '',
    Tags: [],
  });
  
  // Website form state
  const [websiteForm, setWebsiteForm] = useState<CreateWebsiteData>({
    WebsiteUrl: '',
  });

  const [tagsInput, setTagsInput] = useState('');

  const fileTypes = [
    { value: 'document', label: 'Document' },
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
    { value: 'image', label: 'Image' },
  ];

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFileForm(prev => ({ 
      ...prev, 
      FileName: file.name.replace(/\.[^/.]+$/, "") // Remove extension
    }));
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileForm(prev => ({ ...prev, FileName: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const uploadToS3 = async (presignedUrl: string, file: File) => {
    console.log('🚀 Starting S3 upload with corrected headers');
    console.log('📁 File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    console.log('🔗 Presigned URL:', presignedUrl);

    try {
      // Use fetch() with ONLY the Content-Type header that matches the presigned URL signature
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type, // This MUST match what the backend used to generate the signature
        },
        body: file,
      });

      console.log('📥 S3 Response status:', response.status);
      console.log('📥 S3 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ S3 Error Response:', errorText);
        throw new Error(`S3 upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('✅ S3 upload successful with fetch()');
      setUploadProgress(100);
      
    } catch (error) {
      console.error('❌ Fetch upload failed, trying XMLHttpRequest fallback:', error);
      
      // Fallback to XMLHttpRequest with progress tracking
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          console.log('📥 XMLHttpRequest Response status:', xhr.status);
          console.log('📥 XMLHttpRequest Response:', xhr.responseText);
          
          if (xhr.status === 200) {
            console.log('✅ XMLHttpRequest upload successful');
            resolve();
          } else {
            console.error('❌ XMLHttpRequest upload failed:', xhr.responseText);
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => {
          console.error('❌ XMLHttpRequest network error');
          reject(new Error('Upload failed due to network error'));
        };

        console.log('🔄 Trying XMLHttpRequest with Content-Type header...');
        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type); // Only set Content-Type header
        xhr.send(file);
      });
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileForm.FileName.trim() || !fileForm.FileType || !selectedFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Get presigned URL from backend
      const response = await onFileUpload({ ...fileForm, Tags: tags });
      
      // Upload file to S3 using presigned URL
      await uploadToS3(response.PresignedUrl, selectedFile);
      
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
      
      // Reset form
      setFileForm({ FileName: '', FileDescription: '', FileType: '', Tags: [] });
      setTagsInput('');
      setSelectedFile(null);
      setUploadProgress(0);
      setOpen(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleWebsiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteForm.WebsiteUrl.trim()) return;

    setIsLoading(true);
    try {
      await onWebsiteSubmit(websiteForm);
      
      // Reset form
      setWebsiteForm({ WebsiteUrl: '' });
      setOpen(false);
    } catch (error) {
      console.error('Website submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="file" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Add Website
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file">
            <form onSubmit={handleFileSubmit} className="space-y-4">
              {/* File Drop Zone */}
              <div className="space-y-2">
                <Label>Select File</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleFileRemove}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Drag and drop your file here</p>
                        <p className="text-xs text-gray-500">or</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2"
                        >
                          Choose File
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {isLoading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  value={fileForm.FileName}
                  onChange={(e) => setFileForm(prev => ({ ...prev, FileName: e.target.value }))}
                  placeholder="Enter file name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <Select
                  value={fileForm.FileType}
                  onValueChange={(value) => setFileForm(prev => ({ ...prev, FileType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fileDescription">Description</Label>
                <Textarea
                  id="fileDescription"
                  value={fileForm.FileDescription}
                  onChange={(e) => setFileForm(prev => ({ ...prev, FileDescription: e.target.value }))}
                  placeholder="Enter file description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !selectedFile} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Uploading...' : 'Upload File'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="website">
            <form onSubmit={handleWebsiteSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteForm.WebsiteUrl}
                  onChange={(e) => setWebsiteForm(prev => ({ ...prev, WebsiteUrl: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? 'Adding...' : 'Add Website'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;
