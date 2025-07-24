import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Download, Edit, Trash2, Calendar, User, FileText, Eye, List, MessageSquare, MoreVertical, Search } from 'lucide-react';
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
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [activeAITab, setActiveAITab] = useState('summary');
  const [summarySearch, setSummarySearch] = useState('');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [actionItemsContent, setActionItemsContent] = useState('');
  const [transcriptContent, setTranscriptContent] = useState('');

  useEffect(() => {
    if (fileId && files.length > 0) {
      fetchFileDetails();
    } else if (fileId && files.length === 0) {
      // Files are still loading, wait for them
      setLoading(true);
    }
  }, [fileId, files]);

  const fetchFileDetails = async () => {
    if (!fileId) return;
    
    try {
      setLoading(true);
      setHasAttemptedFetch(true);
      
      // First, find the file in the files list to get its type
      const fileItem = files.find(file => file.FileId === fileId);
      if (!fileItem) {
        console.error('File not found in files list. Available files:', files.map(f => f.FileId));
        throw new Error('File not found in space');
      }
      
      console.log('Found file in list:', fileItem);
      
      // Now fetch detailed information with the correct file type
      const details = await getFileDetails(fileId, fileItem.FileType);
      console.log('Fetched file details:', details);
      
      // Ensure state updates happen in correct order
      await new Promise(resolve => {
        setFileDetails(details);
        resolve(void 0);
      });
      
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

  const loadAIContent = async () => {
    if (!fileDetails) return;
    
    // Load summary content
    if (!summaryContent && (fileDetails.BdaSummaryS3KeyUrl || fileDetails.DocSummaryUrl)) {
      const url = fileDetails.BdaSummaryS3KeyUrl || fileDetails.DocSummaryUrl;
      const content = await fetchContent(url!);
      setSummaryContent(content);
    }

    // Load action items content
    if (!actionItemsContent && fileDetails.ActionItemsUrl) {
      const content = await fetchContent(fileDetails.ActionItemsUrl);
      setActionItemsContent(content);
    }

    // Load transcript content
    if (!transcriptContent && fileDetails.BdaTranscriptS3KeyUrl) {
      const content = await fetchContent(fileDetails.BdaTranscriptS3KeyUrl);
      setTranscriptContent(content);
    }
  };

  const parseTranscript = (transcript: string) => {
    if (!transcript) return [];
    
    // Split by lines and parse speaker format
    const lines = transcript.split('\n').filter(line => line.trim());
    const messages: { speaker: string; text: string; timestamp?: string }[] = [];
    
    for (const line of lines) {
      // Look for patterns like "Speaker: text" or "Name (timestamp): text"
      const speakerMatch = line.match(/^([^:]+?)(?:\s*\(([^)]+)\))?\s*:\s*(.+)$/);
      if (speakerMatch) {
        messages.push({
          speaker: speakerMatch[1].trim(),
          timestamp: speakerMatch[2],
          text: speakerMatch[3].trim()
        });
      } else if (line.trim()) {
        // If no speaker pattern found, add as continuation of previous message or unknown speaker
        if (messages.length > 0) {
          messages[messages.length - 1].text += ' ' + line.trim();
        } else {
          messages.push({
            speaker: 'Unknown',
            text: line.trim()
          });
        }
      }
    }
    
    return messages;
  };

  const filterContent = (content: string, searchTerm: string) => {
    if (!searchTerm) return content;
    
    // Highlight search terms in content
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return content.replace(regex, '<mark>$1</mark>');
  };

  const filterTranscriptMessages = (messages: any[], searchTerm: string) => {
    if (!searchTerm) return messages;
    
    return messages.filter(message => 
      message.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  const hasAIContent = () => {
    if (!fileDetails) return false;
    
    const fileType = fileDetails.FileType?.toLowerCase();
    const fileName = fileDetails.FileName || '';
    
    return isVideoOrAudio(fileType, fileName) || isDocumentOrImage(fileType, fileName);
  };

  const renderAIAnalysisTab = () => {
    const fileType = fileDetails?.FileType?.toLowerCase();
    const fileName = fileDetails?.FileName || '';
    const transcriptMessages = parseTranscript(transcriptContent);
    const filteredTranscriptMessages = filterTranscriptMessages(transcriptMessages, transcriptSearch);
    
    return (
      <div className="h-full flex flex-col">
        <Tabs value={activeAITab} onValueChange={setActiveAITab} className="flex-1 flex flex-col">
          <div className="px-6 pt-6 pb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                AI Summary
              </TabsTrigger>
              {isVideoOrAudio(fileType!, fileName) && (
                <TabsTrigger value="action-items" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Action Items
                </TabsTrigger>
              )}
              {isVideoOrAudio(fileType!, fileName) && (
                <TabsTrigger value="transcript" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Transcript
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          {/* AI Summary Tab */}
          <TabsContent value="summary" className="flex-1 px-6 pb-6 mt-0 flex flex-col">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search in summary..."
                  value={summarySearch}
                  onChange={(e) => setSummarySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Card className="flex-1">
              <CardContent className="p-6">
                {contentLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : summaryContent || fileDetails?.DocSummary ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>
                      {filterContent(summaryContent || fileDetails?.DocSummary || '', summarySearch)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500">No summary available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Items Tab */}
          {isVideoOrAudio(fileType!, fileName) && (
            <TabsContent value="action-items" className="flex-1 px-6 pb-6 mt-0">
              <Card className="h-full">
                <CardContent className="p-6">
                  {contentLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : actionItemsContent || fileDetails?.ActionItems ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {actionItemsContent || fileDetails?.ActionItems || ''}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500">No action items available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Transcript Tab */}
          {isVideoOrAudio(fileType!, fileName) && (
            <TabsContent value="transcript" className="flex-1 px-6 pb-6 mt-0 flex flex-col">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search in transcript..."
                    value={transcriptSearch}
                    onChange={(e) => setTranscriptSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Card className="flex-1">
                <CardContent className="p-6">
                  {contentLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : transcriptContent ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredTranscriptMessages.map((message, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                              {message.speaker.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg p-3">
                              <div className="font-medium text-sm text-gray-900 mb-1">
                                {message.speaker}
                                {message.timestamp && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    {message.timestamp}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-800 text-sm">{message.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredTranscriptMessages.length === 0 && transcriptSearch && (
                        <p className="text-gray-500 text-center">No results found for "{transcriptSearch}"</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No transcript available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    );
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

  if (!fileDetails && hasAttemptedFetch && !loading) {
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
            {canModifyFile() && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Content - Left Pane */}
        <div className="w-[60%] p-6">
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-0 h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-6 pt-6 pb-0">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Preview & Info
                    </TabsTrigger>
                    {hasAIContent() && (
                      <TabsTrigger value="ai-analysis" className="flex items-center gap-2" onClick={loadAIContent}>
                        <MessageSquare className="h-4 w-4" />
                        AI Analysis
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
                
                <TabsContent value="preview" className="flex-1 mt-0 overflow-auto">
                  <div className="p-6 space-y-6">
                    {/* File Preview */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">File Preview</h3>
                      {renderFilePreview()}
                    </div>
                  </div>
                </TabsContent>
                
                {hasAIContent() && (
                  <TabsContent value="ai-analysis" className="flex-1 mt-0">
                    {renderAIAnalysisTab()}
                  </TabsContent>
                )}
              </Tabs>
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

    </div>
  );
};

export default FileViewer;