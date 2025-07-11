
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, MoreVertical, Mail, Shield, User, Crown } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const isSystemAdmin = user?.role === 'SystemAdmin';

  useEffect(() => {
    fetchSpaceMembers();
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
        title: "Error",
        description: "Failed to load space members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        title: "Error",
        description: "Failed to load users list.",
        variant: "destructive",
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
          title: "Success",
          description: data.Message,
        });
        setIsAddDialogOpen(false);
        setSelectedUserId('');
        fetchSpaceMembers(); // Refresh the list
      } else if (data.Error) {
        toast({
          title: "Error",
          description: data.Error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding user to space:', error);
      toast({
        title: "Error",
        description: "Failed to add user to space. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
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
        {members.map((member) => (
          <Card key={member.UserId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
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
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <User className="h-4 w-4 mr-2" />
                        Remove from Space
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              <div className="text-sm text-gray-600 font-lexend">
                User ID: {member.UserId}
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
