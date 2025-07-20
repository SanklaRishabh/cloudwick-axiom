
import React, { useState } from 'react';
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
import { Plus, Upload, Globe } from 'lucide-react';
import { CreateFileData, CreateWebsiteData, FileUploadResponse, WebsiteResponse } from '@/hooks/useFiles';

interface FileUploadDialogProps {
  onFileUpload: (data: CreateFileData) => Promise<FileUploadResponse>;
  onWebsiteSubmit: (data: CreateWebsiteData) => Promise<WebsiteResponse>;
}

const FileUploadDialog = ({ onFileUpload, onWebsiteSubmit }: FileUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileForm.FileName.trim()) return;

    setIsLoading(true);
    try {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      await onFileUpload({ ...fileForm, Tags: tags });
      
      // Reset form
      setFileForm({ FileName: '', FileDescription: '', FileType: '', Tags: [] });
      setTagsInput('');
      setOpen(false);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsLoading(false);
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
                <Input
                  id="fileType"
                  value={fileForm.FileType}
                  onChange={(e) => setFileForm(prev => ({ ...prev, FileType: e.target.value }))}
                  placeholder="e.g., pdf, docx, xlsx"
                />
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
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
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
