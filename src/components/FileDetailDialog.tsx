
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  File, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Globe,
  Download,
  Eye,
  FileType,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { FileDetails, useFiles } from '@/hooks/useFiles';
import { useToast } from '@/hooks/use-toast';

interface FileDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
  fileType: string;
  spaceId: string;
}

const FileDetailDialog: React.FC<FileDetailDialogProps> = ({
  isOpen,
  onClose,
  fileId,
  fileName,
  fileType,
  spaceId
}) => {
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { getFileDetails } = useFiles(spaceId);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && fileId) {
      fetchFileDetails();
    }
  }, [isOpen, fileId]);

  const fetchFileDetails = async () => {
    try {
      setLoading(true);
      const details = await getFileDetails(fileId, fileType);
      setFileDetails(details);
    } catch (error) {
      console.error('Error fetching file details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    const type = fileType?.toLowerCase();
    
    if (type?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(type)) {
      return <Image className="h-8 w-8 text-green-600" />;
    }
    
    if (type?.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(type)) {
      return <Video className="h-8 w-8 text-purple-600" />;
    }
    
    if (type?.includes('audio') || ['mp3', 'wav', 'flac', 'aac'].includes(type)) {
      return <Music className="h-8 w-8 text-orange-600" />;
    }
    
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(type)) {
      return <FileText className="h-8 w-8 text-blue-600" />;
    }
    
    if (type === 'website') {
      return <Globe className="h-8 w-8 text-cyan-600" />;
    }
    
    return <File className="h-8 w-8 text-gray-600" />;
  };

  const isVideoOrAudio = () => {
    const type = fileType?.toLowerCase();
    return type?.includes('video') || type?.includes('audio') || 
           ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mp3', 'wav', 'flac', 'aac'].includes(type);
  };

  const isDocumentOrImage = () => {
    const type = fileType?.toLowerCase();
    return type?.includes('image') || ['pdf', 'doc', 'docx', 'txt', 'rtf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(type);
  };

  const handleDownload = () => {
    if (fileDetails?.PresignedUrl) {
      const link = document.createElement('a');
      link.href = fileDetails.PresignedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewSummary = () => {
    if (fileDetails?.BdaSummaryS3KeyUrl) {
      window.open(fileDetails.BdaSummaryS3KeyUrl, '_blank');
    } else if (fileDetails?.DocSummaryUrl) {
      window.open(fileDetails.DocSummaryUrl, '_blank');
    } else {
      toast({
        title: "Summary not available",
        description: "Summary is still being processed or not available for this file.",
        variant: "destructive",
      });
    }
  };

  const handleViewActionItems = () => {
    if (fileDetails?.ActionItemsUrl) {
      window.open(fileDetails.ActionItemsUrl, '_blank');
    } else {
      toast({
        title: "Action items not available",
        description: "Action items are still being processed or not available for this file.",
        variant: "destructive",
      });
    }
  };

  const handleViewTranscript = () => {
    if (fileDetails?.BdaTranscriptS3KeyUrl) {
      window.open(fileDetails.BdaTranscriptS3KeyUrl, '_blank');
    } else {
      toast({
        title: "Transcript not available",
        description: "Transcript is still being processed or not available for this file.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getFileIcon()}
            <span className="truncate">{fileName}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading file details...</p>
          </div>
        ) : fileDetails ? (
          <div className="space-y-6">
            {/* File Preview */}
            {fileDetails.PresignedUrl && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">File Preview</h3>
                {fileType?.includes('image') && (
                  <div className="flex justify-center">
                    <img 
                      src={fileDetails.PresignedUrl} 
                      alt={fileName}
                      className="max-w-full max-h-96 object-contain rounded-lg border"
                    />
                  </div>
                )}
                {fileType?.includes('video') && (
                  <video 
                    controls 
                    className="w-full max-h-96 rounded-lg"
                    src={fileDetails.PresignedUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                {fileType?.includes('audio') && (
                  <audio 
                    controls 
                    className="w-full"
                    src={fileDetails.PresignedUrl}
                  >
                    Your browser does not support the audio tag.
                  </audio>
                )}
                {fileType === 'website' && fileDetails.OriginalUrl && (
                  <div className="text-center">
                    <a 
                      href={fileDetails.OriginalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Visit Website: {fileDetails.OriginalUrl}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>

                {/* Video/Audio specific buttons */}
                {isVideoOrAudio() && (
                  <>
                    <Button onClick={handleViewSummary} variant="outline" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Summary
                    </Button>
                    <Button onClick={handleViewActionItems} variant="outline" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Action Items
                    </Button>
                    <Button onClick={handleViewTranscript} variant="outline" className="flex items-center gap-2">
                      <FileType className="h-4 w-4" />
                      Transcript
                    </Button>
                  </>
                )}

                {/* Document/Image specific buttons */}
                {isDocumentOrImage() && (
                  <Button onClick={handleViewSummary} variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Summary
                  </Button>
                )}
              </div>
            </div>

            {/* File Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">File Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileType className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium">{fileDetails.FileType}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium">
                      {new Date(fileDetails.CreatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Created by:</span>
                    <span className="text-sm font-medium">{fileDetails.CreatedBy}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={
                      fileDetails.FileStatus?.toLowerCase() === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : fileDetails.FileStatus?.toLowerCase() === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {fileDetails.FileStatus}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {fileDetails.FileDescription && (
                    <div>
                      <span className="text-sm text-gray-600">Description:</span>
                      <p className="text-sm font-medium mt-1">{fileDetails.FileDescription}</p>
                    </div>
                  )}

                  {fileDetails.Tags && fileDetails.Tags.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Tags:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {fileDetails.Tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Failed to load file details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileDetailDialog;
