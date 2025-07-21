import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send } from 'lucide-react';
import { AttachMenu } from '@/components/AttachMenu';
import AIChatInterface from '@/components/AIChatInterface';
import { useToast } from '@/hooks/use-toast';

const AIChat = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<{ type: 'space' | 'file'; spaceId: string; spaceName: string; fileName?: string } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName) {
      return user.firstName;
    }
    return user.username;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-helvetica">
      <div className="w-full max-w-2xl space-y-8">
        {/* Gradient Orb */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 shadow-2xl animate-pulse" 
                 style={{
                   background: 'radial-gradient(circle at 30% 30%, #E879F9, #C084FC, #A855F7, #9333EA)',
                   boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3), 0 0 60px rgba(168, 85, 247, 0.2)'
                 }}>
            </div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>
        </div>

        {/* Greeting Text */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-normal text-[#2E2E2E]">
            {getTimeOfDayGreeting()}, {getUserDisplayName()}
          </h1>
          <h2 className="text-4xl font-normal">
            <span className="text-[#2E2E2E]">What's on </span>
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              your mind?
            </span>
          </h2>
        </div>

        {/* Chat Input */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-gray-400 mt-3 flex-shrink-0" />
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question or make a request..."
                className="min-h-32 border-none resize-none text-base placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
              />
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                <AttachMenu 
                  onAttach={setAttachment}
                  currentAttachment={attachment}
                />
                <Button 
                  variant="outline" 
                  className="rounded-full px-4 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50"
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                >
                  Enhanced
                </Button>
              </div>
              
              <Button 
                className="bg-[#2E2E2E] hover:bg-[#1E1E1E] rounded-lg w-10 h-10 p-0 flex items-center justify-center"
                disabled={!message.trim() || !attachment}
                onClick={() => {
                  setShowChat(true);
                  // Clear the initial message after starting chat
                  setMessage('');
                }}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        {showChat && attachment && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Chat</h3>
              <div className="text-sm text-gray-600">
                Attached: {attachment.type === 'space' ? attachment.spaceName : `${attachment.fileName} (${attachment.spaceName})`}
              </div>
            </div>
            <AIChatInterface
              spaceId={attachment.spaceId}
              fileName={attachment.type === 'file' ? attachment.fileName : undefined}
              onCourseCreated={() => {
                toast({
                  title: "Course Created",
                  description: "Your course has been successfully created!",
                });
                setShowChat(false);
              }}
              onError={(error) => {
                toast({
                  title: "Error",
                  description: error,
                  variant: "destructive",
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;