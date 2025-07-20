
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  ExternalLink
} from 'lucide-react';
import { useFiles, FileItem } from '@/hooks/useFiles';
import FileUploadDialog from './FileUploadDialog';

interface SpaceFilesProps {
  spaceId: string;
}

const SpaceFiles: React.FC<SpaceFilesProps> = ({ spaceId }) => {
  const { files, loading, error, uploadFile, submitWebsite } = useFiles(spaceId);

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
    
    if (fileType === 'website' || item.URL?.startsWith('http')) {
      return <Globe className="h-5 w-5 text-cyan-600" />;
    }
    
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const handleDownload = (item: FileItem) => {
    if (item.URL) {
      window.open(item.URL, '_blank');
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
                <TableRow key={item.FileId} className="hover:bg-gray-50">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {item.URL && (
                          <DropdownMenuItem onClick={() => handleDownload(item)}>
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
                        )}
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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
    </div>
  );
};

export default SpaceFiles;
