import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Download, Edit, Trash2, Calendar, User, FileText, Eye, List, MessageSquare, MoreVertical, Search } from 'lucide-react';
import { PDFViewer } from '@/components/PDFViewer';
import { useFiles, FileItem, FileDetails } from '@/hooks/useFiles';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import EditFileDialog from '@/components/EditFileDialog';


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
      'bg-emerald-light text-green border-emerald-light',
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-teal-light text-teal border-teal-light',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-green-light text-green border-green-light',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-orange-100 text-orange-800 border-orange-200'
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

  // Custom ReactMarkdown components to control styling
  const markdownComponents = {
    p: ({ children }: any) => <p className="text-foreground font-normal leading-relaxed mb-4">{children}</p>,
    ul: ({ children }: any) => <ul className="text-foreground font-normal list-disc list-inside mb-4 space-y-2">{children}</ul>,
    ol: ({ children }: any) => <ol className="text-foreground font-normal list-decimal list-inside mb-4 space-y-2">{children}</ol>,
    li: ({ children }: any) => <li className="text-foreground font-normal">{children}</li>,
    h1: ({ children }: any) => <h1 className="text-2xl font-semibold text-foreground mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-semibold text-foreground mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-semibold text-foreground mb-2">{children}</h3>,
    strong: ({ children }: any) => <span className="font-medium text-foreground">{children}</span>,
    em: ({ children }: any) => <em className="italic text-foreground">{children}</em>,
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
            <TabsList className="grid w-full grid-cols-3 bg-gradient-teal/10 p-1">
              <TabsTrigger 
                value="summary" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <FileText className="h-4 w-4" />
                AI Summary
              </TabsTrigger>
              {isVideoOrAudio(fileType!, fileName) && (
                <TabsTrigger 
                  value="action-items" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <List className="h-4 w-4" />
                  Action Items
                </TabsTrigger>
              )}
              {isVideoOrAudio(fileType!, fileName) && (
                <TabsTrigger 
                  value="transcript" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <MessageSquare className="h-4 w-4" />
                  Transcript
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          {/* AI Summary Tab */}
          <TabsContent value="summary" className="flex-1 px-6 pb-6 mt-0 flex flex-col">
            <div className="mb-4 max-w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in summary..."
                  value={summarySearch}
                  onChange={(e) => setSummarySearch(e.target.value)}
                  className="pl-10 w-full border-emerald/20 focus:border-emerald focus:ring-emerald/20"
                />
              </div>
            </div>
            <Card className="flex-1 card-enhanced border-emerald/20">
              <CardContent className="p-6">
                {contentLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
                  </div>
                ) : summaryContent || fileDetails?.DocSummary ? (
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: filterContent(summaryContent || fileDetails?.DocSummary || '', summarySearch) 
                    }} />
                  </div>
                ) : (
                  <p className="text-muted-foreground">No summary available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Items Tab */}
          {isVideoOrAudio(fileType!, fileName) && (
            <TabsContent value="action-items" className="flex-1 px-6 pb-6 mt-0">
              <Card className="h-full card-enhanced border-teal/20">
                <CardContent className="p-6">
                  {contentLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
                    </div>
                  ) : actionItemsContent || fileDetails?.ActionItems ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown components={markdownComponents}>
                        {actionItemsContent || fileDetails?.ActionItems || ''}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No action items available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Transcript Tab */}
          {isVideoOrAudio(fileType!, fileName) && (
            <TabsContent value="transcript" className="flex-1 px-6 pb-6 mt-0 flex flex-col">
              <div className="mb-4 max-w-full">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search in transcript..."
                    value={transcriptSearch}
                    onChange={(e) => setTranscriptSearch(e.target.value)}
                    className="pl-10 w-full border-teal/20 focus:border-teal focus:ring-teal/20"
                  />
                </div>
              </div>
              <Card className="flex-1 card-enhanced border-teal/20">
                <CardContent className="p-6">
                  {contentLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
                    </div>
                  ) : transcriptContent ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredTranscriptMessages.map((message, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-teal flex items-center justify-center text-white text-sm font-medium shadow-md">
                              {message.speaker.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="bg-muted/50 rounded-lg p-3 border border-teal/10">
                              <div className="font-semibold text-sm text-foreground mb-1">
                                {message.speaker}
                                {message.timestamp && (
                                  <span className="text-xs text-muted-foreground ml-2 font-normal">
                                    {message.timestamp}
                                  </span>
                                )}
                              </div>
                              <p className="text-foreground text-sm font-normal">{message.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredTranscriptMessages.length === 0 && transcriptSearch && (
                        <p className="text-muted-foreground text-center">No results found for "{transcriptSearch}"</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No transcript available</p>
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
    <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-purple-50/50">
      <div className="h-full flex flex-col">
        {/* Modern Header with Glass Effect */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/90 to-white/80 backdrop-blur-lg border-b border-white/20"></div>
          <div className="relative flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/dashboard/spaces/${spaceId}`)}
                className="gap-2 hover:bg-white/50 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Space
              </Button>
              <Separator orientation="vertical" className="h-6 bg-gradient-to-b from-purple-400 to-pink-400" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-700 via-slate-700 to-teal-700 bg-clip-text text-transparent">
                  {fileDetails.FileName}
                </h1>
                <p className="text-sm text-muted-foreground font-medium">{fileDetails.FileType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                size="sm" 
                onClick={handleDownload}
                className="btn-gradient gap-2 px-4 py-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              {canModifyFile() && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEdit}
                    className="gap-2 border-purple-200 bg-white/50 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 border-red-200 bg-white/50 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="card-glass">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Delete File</AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          Are you sure you want to delete this file? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="hover:bg-gray-50">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Main Content with Modern Design */}
        <div className="flex-1 overflow-hidden p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col tabs-modern">
            <div className="mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg">
                <TabsTrigger 
                  value="preview" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger 
                  value="ai-analysis" 
                  disabled={!hasAIContent()}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Analysis
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="preview" className="h-full m-0">
                <div className="h-full overflow-auto space-y-8">
                  {/* File Preview with Enhanced Card */}
                  <Card className="card-enhanced overflow-hidden">
                    <CardContent className="p-8">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                          File Preview
                        </h3>
                        <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                      </div>
                      {renderFilePreview()}
                    </CardContent>
                  </Card>
                  
                  {/* File Information with Glass Effect */}
                  <Card className="card-glass">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        File Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">File Name</Label>
                          <p className="text-base font-medium">{fileDetails.FileName}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">File Type</Label>
                          <p className="text-base font-medium">{fileDetails.FileType}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
                          <div>
                            <Badge className={`
                              px-3 py-1 font-medium rounded-full
                              ${fileDetails.FileStatus?.toLowerCase() === 'active' 
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' :
                                fileDetails.FileStatus?.toLowerCase() === 'processing' 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' :
                                'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg'
                              }
                            `}>
                              {fileDetails.FileStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Created Date</Label>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <p className="text-base font-medium">{new Date(fileDetails.CreatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Created By</Label>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-pink-500" />
                            <p className="text-base font-medium">{fileDetails.CreatedBy}</p>
                          </div>
                        </div>
                      </div>
                      
                      {(fileDetails.FileDescription || fileDetails.Description) && (
                        <div className="space-y-2 border-t pt-4">
                          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
                          <p className="text-base leading-relaxed bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-lg border border-slate-200">
                            {fileDetails.FileDescription || fileDetails.Description}
                          </p>
                        </div>
                      )}
                      
                      {fileDetails.Tags && fileDetails.Tags.length > 0 && (
                        <div className="space-y-3 border-t pt-4">
                          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tags</Label>
                          <div className="flex flex-wrap gap-2">
                            {fileDetails.Tags.map((tag, index) => (
                              <Badge 
                                key={index} 
                                className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 rounded-full font-medium hover:scale-105 transition-transform duration-200"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {hasAIContent() && (
                <TabsContent value="ai-analysis" className="flex-1 mt-0" onClick={loadAIContent}>
                  <Card className="h-full card-enhanced">
                    <CardContent className="p-0 h-full">
                      {renderAIAnalysisTab()}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog with Enhanced Styling */}
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
    </div>
  );
};

export default FileViewer;