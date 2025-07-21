import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Paperclip, ChevronRight, FolderOpen, File, Check } from 'lucide-react';
import { useSpaces } from '@/hooks/useSpaces';
import { useFiles } from '@/hooks/useFiles';

interface AttachMenuProps {
  onAttach: (attachment: { type: 'space' | 'file'; spaceId: string; spaceName: string; fileName?: string }) => void;
  currentAttachment?: { type: 'space' | 'file'; spaceId: string; spaceName: string; fileName?: string };
}

export const AttachMenu: React.FC<AttachMenuProps> = ({ onAttach, currentAttachment }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'main' | 'spaces' | 'files'>('main');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [selectedSpaceName, setSelectedSpaceName] = useState<string>('');

  const { spaces, loading: spacesLoading } = useSpaces();
  const { files, loading: filesLoading } = useFiles(selectedSpaceId);

  const handleSpaceSelect = (spaceId: string, spaceName: string) => {
    if (view === 'spaces') {
      // Direct space selection
      onAttach({ type: 'space', spaceId, spaceName });
      setOpen(false);
      setView('main');
    } else if (view === 'files') {
      // Space selection for file browsing
      setSelectedSpaceId(spaceId);
      setSelectedSpaceName(spaceName);
    }
  };

  const handleFileSelect = (fileName: string) => {
    onAttach({ 
      type: 'file', 
      spaceId: selectedSpaceId, 
      spaceName: selectedSpaceName, 
      fileName 
    });
    setOpen(false);
    setView('main');
  };

  const resetView = () => {
    setView('main');
    setSelectedSpaceId('');
    setSelectedSpaceName('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetView();
    }
  };

  const getAttachmentDisplay = () => {
    if (!currentAttachment) return "Attach";
    
    if (currentAttachment.type === 'space') {
      return (
        <span className="flex items-center gap-1">
          <FolderOpen className="h-3 w-3" />
          {currentAttachment.spaceName}
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1">
          <File className="h-3 w-3" />
          {currentAttachment.fileName}
        </span>
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="rounded-full px-4 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50"
          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
        >
          <Paperclip className="h-4 w-4 mr-2" />
          {getAttachmentDisplay()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-white" align="start">
        <div className="max-h-80 overflow-y-auto">
          {view === 'main' && (
            <div className="p-2">
              <div className="text-sm font-medium text-gray-900 mb-2 px-2">Select attachment type</div>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-left"
                  onClick={() => setView('spaces')}
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Space
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-left"
                  onClick={() => setView('files')}
                >
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    File
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {view === 'spaces' && (
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('main')}
                  className="p-1 h-auto"
                >
                  ←
                </Button>
                <div className="text-sm font-medium text-gray-900">Select a space</div>
              </div>
              <div className="space-y-1">
                {spacesLoading ? (
                  <div className="text-sm text-gray-500 px-2 py-1">Loading spaces...</div>
                ) : spaces.length === 0 ? (
                  <div className="text-sm text-gray-500 px-2 py-1">No spaces available</div>
                ) : (
                  spaces.map((space) => (
                    <Button
                      key={space.SpaceId}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => handleSpaceSelect(space.SpaceId, space.SpaceName)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <FolderOpen className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{space.SpaceName}</span>
                        {currentAttachment?.type === 'space' && currentAttachment.spaceId === space.SpaceId && (
                          <Check className="h-4 w-4 text-green-600 ml-auto" />
                        )}
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}

          {view === 'files' && (
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('main')}
                  className="p-1 h-auto"
                >
                  ←
                </Button>
                <div className="text-sm font-medium text-gray-900">
                  {selectedSpaceId ? `Files in ${selectedSpaceName}` : 'Select a space first'}
                </div>
              </div>
              
              {!selectedSpaceId ? (
                <div className="space-y-1">
                  {spacesLoading ? (
                    <div className="text-sm text-gray-500 px-2 py-1">Loading spaces...</div>
                  ) : spaces.length === 0 ? (
                    <div className="text-sm text-gray-500 px-2 py-1">No spaces available</div>
                  ) : (
                    spaces.map((space) => (
                      <Button
                        key={space.SpaceId}
                        variant="ghost"
                        className="w-full justify-between text-left"
                        onClick={() => handleSpaceSelect(space.SpaceId, space.SpaceName)}
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          <span className="truncate">{space.SpaceName}</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filesLoading ? (
                    <div className="text-sm text-gray-500 px-2 py-1">Loading files...</div>
                  ) : files.length === 0 ? (
                    <div className="text-sm text-gray-500 px-2 py-1">No files in this space</div>
                  ) : (
                    files.map((file) => (
                      <Button
                        key={file.FileId}
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => handleFileSelect(file.FileName)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <File className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{file.FileName}</span>
                          {currentAttachment?.type === 'file' && 
                           currentAttachment.spaceId === selectedSpaceId && 
                           currentAttachment.fileName === file.FileName && (
                            <Check className="h-4 w-4 text-green-600 ml-auto" />
                          )}
                        </div>
                      </Button>
                    ))
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left mt-2 border-t pt-2"
                    onClick={() => {
                      setSelectedSpaceId('');
                      setSelectedSpaceName('');
                    }}
                  >
                    ← Back to spaces
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};