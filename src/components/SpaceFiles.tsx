
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
  Eye
} from 'lucide-react';
import { useFiles, FileItem } from '@/hooks/useFiles';
import FileUploadDialog from './FileUploadDialog';
import FileDetailDialog from './FileDetailDialog';
import EditFileDialog from './EditFileDialog';

interface SpaceFilesProps {
  spaceId: string;
}

const SpaceFiles: React.FC<SpaceFilesProps> = ({ spaceId }) => {
  const { files, loading, error, uploadFile, submitWebsite, updateFile, deleteFile } = useFiles(spaceId);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

  const getFileIcon = (item: FileItem) => {
    const fileType = item.FileType?.toLowerCase();
    
    if (fileType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileType)) {
      return <Image className="h-5 w-5 text-green-600" />;
    }
    
    if (fileType?.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(fileType)) {
      return <Video className="h-5 w-5 text-purple-600" />;
    }
    
    if (fileType?.includes('audio') || ['mp3', 'wav', 'flac', 'aac'].includes(fileType)) {
      return <Music className="h-5 w-5 text-orange-600" />;
    }
    
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(fileType)) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    
    if (['zip', 'rar', '7z', 'tar'].includes(fileType)) {
      return <Archive className="h-5 w-5 text-yellow-600" />;
    }
    
    if (fileType === 'website') {
      return <Globe className="h-5 w-5 text-cyan-600" />;
    }
    
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
    setIsDetailDialogOpen(true);
  };

  const handleDownload = (item: FileItem) => {
    // For now, we'll show a message that download functionality needs to be implemented
    // The actual download would likely need a separate API endpoint to get signed URLs
    console.log('Download requested for file:', item.FileName);
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Files</h2>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((item) => (
                <TableRow 
                  key={item.FileId} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleFileClick(item)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {getFileIcon(item)}
                      <div>
                        <div className="font-medium">{item.FileName}</div>
                        {item.FileDescription && (
                          <div className="text-sm text-gray-500">{item.FileDescription}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.FileType || '—'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.FileStatus)}>
                      {item.FileStatus || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.Tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
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
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
