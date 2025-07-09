
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  Plus
} from 'lucide-react';

interface SpaceFilesProps {
  spaceId: string;
}

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other';
  size?: string;
  lastModified: string;
  owner: string;
}

// Mock data for demonstration
const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Project Documents',
    type: 'folder',
    lastModified: '2 days ago',
    owner: 'John Doe',
  },
  {
    id: '2',
    name: 'Meeting Notes.docx',
    type: 'file',
    fileType: 'document',
    size: '2.5 MB',
    lastModified: '1 hour ago',
    owner: 'Jane Smith',
  },
  {
    id: '3',
    name: 'Presentation.pdf',
    type: 'file',
    fileType: 'document',
    size: '5.8 MB',
    lastModified: '3 hours ago',
    owner: 'John Doe',
  },
  {
    id: '4',
    name: 'Screenshots',
    type: 'folder',
    lastModified: '1 day ago',
    owner: 'Jane Smith',
  },
  {
    id: '5',
    name: 'demo-video.mp4',
    type: 'file',
    fileType: 'video',
    size: '45.2 MB',
    lastModified: '2 days ago',
    owner: 'John Doe',
  },
];

const SpaceFiles: React.FC<SpaceFilesProps> = ({ spaceId }) => {
  const [files] = useState<FileItem[]>(mockFiles);

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder className="h-5 w-5 text-blue-600" />;
    }
    
    switch (item.fileType) {
      case 'image':
        return <Image className="h-5 w-5 text-green-600" />;
      case 'document':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-600" />;
      case 'audio':
        return <Music className="h-5 w-5 text-orange-600" />;
      case 'archive':
        return <Archive className="h-5 w-5 text-yellow-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 font-lexend">Files</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 font-lexend flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-lexend">Name</TableHead>
              <TableHead className="font-lexend">Owner</TableHead>
              <TableHead className="font-lexend">Last Modified</TableHead>
              <TableHead className="font-lexend">Size</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 cursor-pointer">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {getFileIcon(item)}
                    <span className="font-lexend">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-lexend text-gray-600">{item.owner}</TableCell>
                <TableCell className="font-lexend text-gray-600">{item.lastModified}</TableCell>
                <TableCell className="font-lexend text-gray-600">{item.size || '—'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
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
    </div>
  );
};

export default SpaceFiles;
