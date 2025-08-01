
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  File, 
  Folder, 
  Image, 
  FileText, 
  Video, 
  Music, 
  Archive, 
  MoreVertical,
  Download,
  Share,
  Trash2,
  Edit,
  Globe,
  ExternalLink,
  Eye,
  FileType,
  Plus
} from 'lucide-react';
import { useFiles, FileItem } from '@/hooks/useFiles';
import FileUploadDialog from './FileUploadDialog';
import FileDetailDialog from './FileDetailDialog';
import EditFileDialog from './EditFileDialog';

import { useAuth } from '@/hooks/useAuth';

interface SpaceFilesProps {
  spaceId: string;
  space?: {
    SpaceId: string;
    SpaceName: string;
    SpaceDescription?: string;
    SpaceAdmin?: string;
  };
}

const SpaceFiles: React.FC<SpaceFilesProps> = ({ spaceId, space }) => {
  const { files, loading, error, uploadFile, submitWebsite, updateFile, deleteFile } = useFiles(spaceId);
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

  const getFileIcon = (item: FileItem) => {
    const fileType = item.FileType?.toLowerCase();
    
    if (fileType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileType)) {
      return <Image className="h-12 w-12 text-green-600" />;
    }
    
    if (fileType?.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(fileType)) {
      return <Video className="h-12 w-12 text-purple-600" />;
    }
    
    if (fileType?.includes('audio') || ['mp3', 'wav', 'flac', 'aac'].includes(fileType)) {
      return <Music className="h-12 w-12 text-orange-600" />;
    }
    
    if (fileType === 'pdf') {
      return <File className="h-12 w-12 text-red-600" />;
    }
    
    if (['doc', 'docx', 'txt', 'rtf'].includes(fileType)) {
      return <FileText className="h-12 w-12 text-blue-600" />;
    }
    
    if (['zip', 'rar', '7z', 'tar'].includes(fileType)) {
      return <Archive className="h-12 w-12 text-yellow-600" />;
    }
    
    if (fileType === 'website') {
      return <Globe className="h-12 w-12 text-cyan-600" />;
    }
    
    return <File className="h-12 w-12 text-gray-600" />;
  };

  const handleFileClick = (file: FileItem) => {
    // Navigate to the new file viewer page
    window.location.href = `/dashboard/spaces/${spaceId}/files/${file.FileId}`;
  };

  const handleDownload = (item: FileItem) => {
    // For now, we'll show a message that download functionality needs to be implemented
    // The actual download would likely need a separate API endpoint to get signed URLs
    console.log('Download requested for file:', item.FileName);
  };

  // Check if user can edit/delete files (System Admin, Space Admin, or file creator)
  const canModifyFile = (file: FileItem) => {
    if (!user) return false;
    
    // System Admin can modify any file
    if (user.role === 'SystemAdmin') return true;
    
    // Space Admin can modify any file in their space
    if (space?.SpaceAdmin === user.username) return true;
    
    // File creator can modify their own files
    if (file.CreatedBy === user.username) return true;
    
    return false;
  };

  const handleEdit = (file: FileItem) => {
    setSelectedFile(file);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (file: FileItem) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      await deleteFile(fileToDelete.FileId);
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200',
      'bg-sky-100 text-sky-800 border-sky-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Files</h2>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Files</h2>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-red-500">Error loading files: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Files</h2>
        <FileUploadDialog 
          onFileUpload={uploadFile}
          onWebsiteSubmit={submitWebsite}
        />
      </div>

      {files.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No files uploaded yet. Start by uploading your first file or adding a website.</p>
        </div>
      ) : (
        /* Thumbnail Grid Layout */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((item, index) => (
            <div
              key={item.FileId}
              className="group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] animate-fade-in-up"
              onClick={() => handleFileClick(item)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-gray-50 rounded-t-lg flex items-center justify-center p-4">
                {getFileIcon(item)}
              </div>
              
              {/* File Info */}
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 truncate" title={item.FileName}>
                  {item.FileName}
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {item.FileType || 'Unknown'}
                </div>
                
                {/* Status Badge */}
                <div className="mt-2">
                  <Badge className={`text-xs ${getStatusColor(item.FileStatus)}`}>
                    {item.FileStatus || 'Unknown'}
                  </Badge>
                </div>
                
                {/* Tags */}
                {item.Tags && item.Tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.Tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} className={`text-xs border ${getTagColor(index)}`}>
                        {tag}
                      </Badge>
                    ))}
                    {item.Tags.length > 2 && (
                      <Badge className="text-xs bg-gray-100 text-gray-600">
                        +{item.Tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 bg-white/80 backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileClick(item);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                    >
                      {item.FileType === 'website' ? (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Link
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </DropdownMenuItem>
                    {canModifyFile(item) && (
                      <>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="text-sm text-muted-foreground">
            Showing {files.length} files
          </div>
        </div>
      )}

      {/* File Detail Dialog */}
      {selectedFile && (
        <FileDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false);
            setSelectedFile(null);
          }}
          fileId={selectedFile.FileId}
          fileName={selectedFile.FileName}
          fileType={selectedFile.FileType}
          spaceId={spaceId}
        />
      )}

      {/* Edit File Dialog */}
      {selectedFile && (
        <EditFileDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedFile(null);
          }}
          file={selectedFile}
          onUpdate={updateFile}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.FileName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SpaceFiles;
