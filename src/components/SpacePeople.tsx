
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, MoreVertical, Shield, User, Crown, UserCheck, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface SpacePeopleProps {
  spaceId: string;
}

interface SpaceMember {
  UserId: string;
  FirstName: string;
  LastName: string;
  Email: string;
}

interface Space {
  SpaceId: string;
  SpaceName: string;
  SpaceDescription?: string;
  SpaceAdmin?: string;
}

interface AllUser {
  UserId: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Role: string;
  SpaceIds: string[];
}

const SpacePeople: React.FC<SpacePeopleProps> = ({ spaceId }) => {
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [space, setSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [isAssigningAdmin, setIsAssigningAdmin] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const isSystemAdmin = user?.role === 'SystemAdmin';

  useEffect(() => {
    fetchSpaceMembers();
    fetchSpaceDetails();
    if (isSystemAdmin) {
      fetchAllUsers();
    }
  }, [spaceId, isSystemAdmin]);

  const fetchSpaceMembers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/spaces/${spaceId}/users`);
      const data = await response.json();
      setMembers(data.Users || []);
    } catch (error) {
      console.error('Error fetching space members:', error);
      toast({
        title: "Oops! 😔",
        description: "Failed to load space members. Please try again.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpaceDetails = async () => {
    try {
      const response = await apiClient.get(`/spaces/${spaceId}`);
      const data = await response.json();
      setSpace(data);
    } catch (error) {
      console.error('Error fetching space details:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      const data = await response.json();
      setAllUsers(data.Users || []);
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast({
        title: "Oops! 😔",
        description: "Failed to load users list.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) return;

    try {
      setIsAdding(true);
      const response = await apiClient.put(`/spaces/${spaceId}/users/${selectedUserId}`);
      const data = await response.json();
      
      if (data.Message) {
        toast({
          title: "Success! 🎉",
          description: data.Message,
          className: "bg-green-50 border-green-200 text-green-800",
        });
        setIsAddDialogOpen(false);
        setSelectedUserId('');
        fetchSpaceMembers(); // Refresh the list
      } else if (data.Error) {
        toast({
          title: "Oops! 😔",
          description: data.Error,
          variant: "destructive",
          className: "bg-red-50 border-red-200 text-red-800",
        });
      }
    } catch (error) {
      console.error('Error adding user to space:', error);
      toast({
        title: "Something went wrong 😞",
        description: "Failed to add user to space. Please try again.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleAssignAdmin = async (userId: string) => {
    setIsAssigningAdmin(true);
    try {
      const response = await apiClient.put(`/spaces/${spaceId}`, {
        SpaceAdmin: userId
      });
      
      console.log('Assign admin response status:', response.status);
      
      // Handle 204 No Content (successful update with no response body)
      if (response.status === 204) {
        setSpace(prev => prev ? { ...prev, SpaceAdmin: userId } : null);
        toast({
          title: "Success! 🎉",
          description: "Space admin assigned successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        // Parse JSON for other successful responses
        const result = await response.json();
        
        if (result.Message) {
          setSpace(prev => prev ? { ...prev, SpaceAdmin: userId } : null);
          toast({
            title: "Success! 🎉",
            description: result.Message,
            className: "bg-green-50 border-green-200 text-green-800",
          });
        } else if (result.Error) {
          toast({
            title: "Oops! 😔",
            description: result.Error,
            variant: "destructive",
            className: "bg-red-50 border-red-200 text-red-800",
          });
        }
      }
    } catch (error) {
      console.error('Error assigning space admin:', error);
      toast({
        title: "Something went wrong 😞",
        description: "Failed to assign space admin. Please try again.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsAssigningAdmin(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    setIsRemoving(true);
    try {
      const response = await apiClient.delete(`/spaces/${spaceId}/users/${userId}`);
      
      console.log('Remove user response status:', response.status);
      
      // Handle 204 No Content response (successful deletion)
      if (response.status === 204) {
        toast({
          title: "Success! 🎉",
          description: "User removed from space successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        fetchSpaceMembers(); // Refresh the members list
        fetchSpaceDetails(); // Refresh space details to update admin badge
      } else {
        // Parse JSON for other successful responses (e.g., 200 with message)
        const result = await response.json();
        
        if (result.Message) {
          toast({
            title: "Success! 🎉",
            description: result.Message,
            className: "bg-green-50 border-green-200 text-green-800",
          });
          fetchSpaceMembers(); // Refresh the members list
          fetchSpaceDetails(); // Refresh space details to update admin badge
        } else if (result.Error) {
          toast({
            title: "Oops! 😔",
            description: result.Error,
            variant: "destructive",
            className: "bg-red-50 border-red-200 text-red-800",
          });
        } else {
          toast({
            title: "Oops! 😔",
            description: "Failed to remove user from space",
            variant: "destructive",
            className: "bg-red-50 border-red-200 text-red-800",
          });
        }
      }
    } catch (error) {
      console.error('Error removing user from space:', error);
      toast({
        title: "Something went wrong 😞",
        description: "Failed to remove user from space. Please try again.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  // Filter out users who are already in the space
  const availableUsers = allUsers.filter(user => 
    !members.some(member => member.UserId === user.UserId)
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-lexend">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 font-lexend">People</h2>
        {isSystemAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 font-lexend flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add People
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User to Space</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.UserId} value={user.UserId}>
                        {user.FirstName} {user.LastName} ({user.Email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isAdding}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddUser}
                    disabled={!selectedUserId || isAdding}
                  >
                    {isAdding ? 'Adding...' : 'Add User'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, index) => (
          <Card key={member.UserId} className="hover:shadow-md transition-all duration-300 animate-fade-in-up hover:scale-105" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {getInitials(member.FirstName, member.LastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-lexend">
                      {member.FirstName} {member.LastName}
                    </h3>
                    <p className="text-sm text-gray-600 font-lexend">{member.Email}</p>
                  </div>
                </div>
                {isSystemAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {space?.SpaceAdmin !== member.UserId && (
                        <DropdownMenuItem
                          onClick={() => handleAssignAdmin(member.UserId)}
                          disabled={isAssigningAdmin}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Make Space Admin
                        </DropdownMenuItem>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove from Space
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove User from Space</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.FirstName} {member.LastName} from this space? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveUser(member.UserId)}
                              disabled={isRemoving}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isRemoving ? 'Removing...' : 'Remove User'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 font-lexend">
                  User ID: {member.UserId}
                </div>
                {space?.SpaceAdmin === member.UserId && (
                  <div className="flex items-center gap-1 bg-gradient-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                    <Crown className="h-3 w-3" />
                    Space Admin
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 font-lexend">No members found in this space.</p>
        </div>
      )}
    </div>
  );
};

export default SpacePeople;
