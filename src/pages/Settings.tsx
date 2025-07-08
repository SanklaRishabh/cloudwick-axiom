import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from '@/lib/api';

interface UserProfile {
  FirstName: string;
  LastName: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const form = useForm<UserProfile>({
    defaultValues: {
      FirstName: "",
      LastName: "",
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.username) return;
      
      setIsLoadingProfile(true);
      try {
        const response = await apiClient.get(`/users/${user.username}`);
        const userData = await response.json();
        
        form.setValue("FirstName", userData.FirstName || "");
        form.setValue("LastName", userData.LastName || "");
        
        console.log('👤 Loaded user profile for settings:', userData);
      } catch (error) {
        console.error('❌ Error loading user profile:', error);
        // Fallback to user data from auth context
        form.setValue("FirstName", user.firstName || "");
        form.setValue("LastName", user.lastName || "");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user, form]);

  const onSubmit = async (data: UserProfile) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await apiClient.put(`/users/${user.username}`, {
        FirstName: data.FirstName,
        LastName: data.LastName,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-lexend">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-lexend">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-lexend">Profile Information</CardTitle>
            <CardDescription>
              Update your personal information here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="FirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-lexend">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          {...field}
                          className="font-lexend"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="LastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-lexend">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          {...field}
                          className="font-lexend"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 font-lexend"
                  >
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-lexend">Account Information</CardTitle>
            <CardDescription>
              Your account details (read-only).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 font-lexend">Email</label>
              <p className="text-gray-900 font-lexend">{user?.email || 'Not available'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 font-lexend">Username</label>
              <p className="text-gray-900 font-lexend">{user?.username || 'Not available'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
