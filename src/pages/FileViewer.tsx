import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Download, Share, Edit, Trash2, Calendar, User, FileText, Eye, List, MessageSquare } from 'lucide-react';
import { PDFViewer } from '@/components/PDFViewer';
import { useFiles, FileItem, FileDetails } from '@/hooks/useFiles';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import EditFileDialog from '@/components/EditFileDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


const FileViewer = () => {
  const { spaceId, fileId } = useParams<{ spaceId: string; fileId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { files, getFileDetails, updateFile, deleteFile } = useFiles(spaceId || '');
  
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isActionItemsOpen, setIsActionItemsOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [actionItemsContent, setActionItemsContent] = useState('');
  const [transcriptContent, setTranscriptContent] = useState('');

  useEffect(() => {
    if (fileId) {
      fetchFileDetails();
    }
  }, [fileId, files]);

  const fetchFileDetails = async () => {
    if (!fileId) return;
    
    try {
      setLoading(true);
      
      // First, find the file in the files list to get its type
      const fileItem = files.find(file => file.FileId === fileId);
      if (!fileItem) {
        throw new Error('File not found in space');
      }
      
      // Now fetch detailed information with the correct file type
      const details = await getFileDetails(fileId, fileItem.FileType);
      setFileDetails(details);
    } catch (error) {
      console.error('Error fetching file details:', error);
      toast({
        title: "Error",
        description: "Failed to load file details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (fileDetails?.PresignedUrl) {
      window.open(fileDetails.PresignedUrl, '_blank');
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!fileId) return;
    
    try {
      await deleteFile(fileId);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      navigate(`/dashboard/spaces/${spaceId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
  };

  const canModifyFile = () => {
    if (!user || !fileDetails) return false;
    return user.role === 'SystemAdmin' || fileDetails.CreatedBy === user.username;
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200'
    ];
    return colors[index % colors.length];
  };

  const fetchContent = async (url: string): Promise<string> => {
    try {
      setContentLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch content');
      return await response.text();
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
      return '';
    } finally {
      setContentLoading(false);
    }
  };

  const handleSummary = async () => {
    if (!fileDetails) return;
    
    setIsSummaryOpen(true);
    
    if (!summaryContent && (fileDetails.BdaSummaryS3KeyUrl || fileDetails.DocSummaryUrl)) {
      const url = fileDetails.BdaSummaryS3KeyUrl || fileDetails.DocSummaryUrl;
      const content = await fetchContent(url!);
      setSummaryContent(content);
    }
  };

  const handleActionItems = async () => {
    if (!fileDetails) return;
    
    setIsActionItemsOpen(true);
    
    if (!actionItemsContent && fileDetails.ActionItemsUrl) {
      const content = await fetchContent(fileDetails.ActionItemsUrl);
      setActionItemsContent(content);
    }
  };

  const handleTranscript = async () => {
    if (!fileDetails) return;
    
    setIsTranscriptOpen(true);
    
    if (!transcriptContent && fileDetails.BdaTranscriptS3KeyUrl) {
      const content = await fetchContent(fileDetails.BdaTranscriptS3KeyUrl);
      setTranscriptContent(content);
    }
  };

  // Utility function to get file extension
  const getFileExtension = (fileName: string): string => {
    return fileName.toLowerCase().split('.').pop() || '';
  };

  // Audio file extensions
  const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma'];
  
  // Video file extensions
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  
  // Image file extensions
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];

  const isVideoOrAudio = (fileType: string, fileName: string) => {
    const extension = getFileExtension(fileName);
    return fileType?.toLowerCase().includes('video') || 
           fileType?.toLowerCase().includes('audio') ||
           videoExtensions.includes(extension) ||
           audioExtensions.includes(extension);
  };

  const isDocumentOrImage = (fileType: string, fileName: string) => {
    const extension = getFileExtension(fileName);
    return fileType?.toLowerCase().includes('document') || 
           fileType?.toLowerCase().includes('image') ||
           extension === 'pdf' ||
           imageExtensions.includes(extension);
  };

  const renderAIContentButtons = () => {
    if (!fileDetails) return null;

    const fileType = fileDetails.FileType?.toLowerCase();
    const fileName = fileDetails.FileName || '';

    if (isVideoOrAudio(fileType, fileName)) {
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleSummary}>
            <FileText className="h-4 w-4 mr-2" />
            Summary
          </Button>
          <Button variant="outline" size="sm" onClick={handleActionItems}>
            <List className="h-4 w-4 mr-2" />
            Action Items
          </Button>
          <Button variant="outline" size="sm" onClick={handleTranscript}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Transcript
          </Button>
        </div>
      );
    }

    if (isDocumentOrImage(fileType, fileName)) {
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleSummary}>
            <FileText className="h-4 w-4 mr-2" />
            Summary
          </Button>
        </div>
      );
    }

    return null;
  };

  const renderFilePreview = () => {
    if (!fileDetails) return null;

    const fileType = fileDetails.FileType?.toLowerCase();
    const fileName = fileDetails.FileName || '';
    const extension = getFileExtension(fileName);
    
    console.log('File preview debug:', { fileType, fileName, extension });

    // Image preview
    if (fileType?.includes('image') || imageExtensions.includes(extension)) {
      return (
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          {fileDetails.PresignedUrl ? (
            <img 
              src={fileDetails.PresignedUrl} 
              alt={fileDetails.FileName}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-gray-500">Image preview not available</div>
          )}
        </div>
      );
    }

    // PDF preview - check both type and extension
    if (fileType === 'pdf' || fileType === 'document' || extension === 'pdf') {
      return (
        <div className="w-full h-96">
          {fileDetails.PresignedUrl ? (
            <PDFViewer 
              url={fileDetails.PresignedUrl} 
              className="w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 bg-gray-100 rounded-lg">
              PDF preview not available
            </div>
          )}
        </div>
      );
    }

    // Video preview
    if (fileType?.includes('video') || videoExtensions.includes(extension)) {
      return (
        <div className="w-full h-96 bg-gray-100 rounded-lg">
          {fileDetails.PresignedUrl ? (
            <video 
              controls 
              className="w-full h-full rounded-lg"
              src={fileDetails.PresignedUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Video preview not available
            </div>
          )}
        </div>
      );
    }

    // Audio preview
    if (fileType?.includes('audio') || audioExtensions.includes(extension)) {
      return (
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          {fileDetails.PresignedUrl ? (
            <audio controls className="w-full max-w-md">
              <source src={fileDetails.PresignedUrl} type={`audio/${fileType}`} />
              Your browser does not support the audio tag.
            </audio>
          ) : (
            <div className="text-gray-500">Audio preview not available</div>
          )}
        </div>
      );
    }

    // Website preview
    if (fileType === 'website') {
      return (
        <div className="w-full h-96 bg-gray-100 rounded-lg">
          {fileDetails.PresignedUrl ? (
            <iframe
              src={fileDetails.PresignedUrl}
              className="w-full h-full rounded-lg"
              title={fileDetails.FileName}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Website preview not available
            </div>
          )}
        </div>
      );
    }

    // Default file preview
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FileText className="h-16 w-16 mx-auto mb-4" />
          <p>Preview not available for this file type</p>
          <p className="text-sm mt-2">Use the download button to view the file</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (!fileDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">File not found</p>
          <Button 
            onClick={() => navigate(`/dashboard/spaces/${spaceId}`)}
            className="mt-4"
          >
            Back to Space
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/dashboard/spaces/${spaceId}`)}
          className="flex items-center gap-2 hover-scale transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Space
        </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{fileDetails.FileName}</h1>
              <p className="text-gray-600">{fileDetails.FileType}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            {canModifyFile() && (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Preview - Left Pane */}
        <div className="w-[60%] p-6">
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                File Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderFilePreview()}
              {renderAIContentButtons()}
            </CardContent>
          </Card>
        </div>

        {/* File Details - Right Pane */}
        <div className="w-[40%] p-6 space-y-6">
          {/* Basic Information */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>File Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">File Name</label>
                <p className="text-gray-900">{fileDetails.FileName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">File Type</label>
                <p className="text-gray-900">{fileDetails.FileType}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <Badge className={
                    fileDetails.FileStatus?.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                    fileDetails.FileStatus?.toLowerCase() === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {fileDetails.FileStatus}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {new Date(fileDetails.CreatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Created By</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{fileDetails.CreatedBy}</span>
                </div>
              </div>
              
              {(fileDetails.FileDescription || fileDetails.Description) && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 mt-1">{fileDetails.FileDescription || fileDetails.Description}</p>
                </div>
              )}
              
              {fileDetails.Tags && fileDetails.Tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {fileDetails.Tags.map((tag, index) => (
                      <Badge key={index} className={`text-xs border ${getTagColor(index)}`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI-Generated Content */}
          {(fileDetails.DocSummary || fileDetails.ActionItems) && (
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fileDetails.DocSummary && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Summary</label>
                    <p className="text-gray-900 mt-1 text-sm">{fileDetails.DocSummary}</p>
                  </div>
                )}
                
                {fileDetails.ActionItems && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Action Items</label>
                    <p className="text-gray-900 mt-1 text-sm">{fileDetails.ActionItems}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {fileDetails && (
        <EditFileDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          file={{
            ...fileDetails,
            FilePath: fileDetails.FilePath,
            FileDescription: fileDetails.FileDescription || fileDetails.Description || ''
          } as FileItem}
          onUpdate={updateFile}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileDetails?.FileName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Summary Dialog */}
      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Summary</DialogTitle>
          </DialogHeader>
          {contentLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap p-4 text-sm">
              {summaryContent || fileDetails?.DocSummary || 'No summary available'}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Items Dialog */}
      <Dialog open={isActionItemsOpen} onOpenChange={setIsActionItemsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Action Items</DialogTitle>
          </DialogHeader>
          {contentLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap p-4 text-sm">
              {actionItemsContent || fileDetails?.ActionItems || 'No action items available'}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transcript Dialog */}
      <Dialog open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Transcript</DialogTitle>
          </DialogHeader>
          {contentLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap p-4 text-sm">
              {transcriptContent || 'No transcript available'}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileViewer;