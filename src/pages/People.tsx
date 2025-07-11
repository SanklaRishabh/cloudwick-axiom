import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Badge, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { apiClient } from '@/lib/api';

interface User {
  UserId: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Role: string;
  SpaceIds: string[];
}

interface UsersResponse {
  Users: User[];
}

const People = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/users');
      const data: UsersResponse = await response.json();
      console.log('Fetched users:', data);
      
      setUsers(data.Users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = (userId: string) => {
    navigate(`/dashboard/people/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-lexend">People</h1>
          <p className="text-gray-600 font-lexend mt-2">Manage platform users</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-lexend">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 font-lexend"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-lexend">People</h1>
        <p className="text-gray-600 font-lexend mt-2">Manage platform users</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-lexend">No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div 
              key={user.UserId}
              onClick={() => handleUserClick(user.UserId)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user.FirstName[0]}{user.LastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 font-lexend">
                      {user.FirstName} {user.LastName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{user.Email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className="h-4 w-4" />
                        <span>{user.Role}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {user.SpaceIds.length} spaces
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default People;
