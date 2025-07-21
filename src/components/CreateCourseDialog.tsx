
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, X, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateCourseDialogProps {
  onCreateCourse: (courseData: {
    CourseTitle: string;
    Description: string;
    Tags: string[];
  }) => Promise<void>;
  spaceId: string;
  isLoading?: boolean;
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({ 
  onCreateCourse, 
  spaceId,
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<'manual' | 'ai'>('manual');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      await onCreateCourse({
        CourseTitle: title,
        Description: description,
        Tags: tags,
      });
      
      // Reset form
      resetForm();
      setOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleAICourseCreated = () => {
    resetForm();
    setOpen(false);
  };

  const handleAIError = (error: string) => {
    console.error('AI Course Creation Error:', error);
    // You might want to show a toast or error message here
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setCreationMode('manual');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Choose how you'd like to create your course - manually or with AI assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Creation Method</Label>
            <RadioGroup
              value={creationMode}
              onValueChange={(value) => setCreationMode(value as 'manual' | 'ai')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Manual Creation
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ai" id="ai" />
                <Label htmlFor="ai" className="flex items-center gap-2 cursor-pointer">
                  <Bot className="h-4 w-4" />
                  AI-Powered Creation
                </Label>
              </div>
            </RadioGroup>
          </div>

          {creationMode === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter course title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter course description"
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tags (press Enter)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim() || !description.trim()}
                >
                  {isLoading ? 'Creating...' : 'Create Course'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Use our AI Chat to generate course content and structure. The AI will help you create a comprehensive course based on your requirements.
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-3">
                  Click the button below to open AI Chat where you can describe your course requirements.
                </p>
                <Button 
                  onClick={() => {
                    setOpen(false);
                    navigate('/dashboard/ai-chat');
                  }}
                  className="w-full"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Open AI Chat
                </Button>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
