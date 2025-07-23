import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, MoreHorizontal } from 'lucide-react';
import { AttachMenu } from '@/components/AttachMenu';
import { useToast } from '@/hooks/use-toast';
import { WebSocketService } from '@/lib/websocket';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

const AIChat = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachment, setAttachment] = useState<{ type: 'space' | 'file'; spaceId: string; spaceName: string; fileName?: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocketService | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeWebSocket = async () => {
    try {
      const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL;
      if (!wsBaseUrl) {
        throw new Error('WebSocket URL not configured in environment variables');
      }

      console.log('🔌 Initializing WebSocket with URL:', wsBaseUrl);
      wsRef.current = new WebSocketService(wsBaseUrl);
      
      wsRef.current.onConnection(() => {
        setIsConnected(true);
        console.log('✅ WebSocket connected successfully');
      });

      wsRef.current.onMessage((messageContent) => {
        try {
          const response = JSON.parse(messageContent);
          if (response.Content) {
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              
              if (lastMessage && lastMessage.sender === 'ai' && lastMessage.isLoading) {
                // Update the loading message with actual content
                lastMessage.content = response.Content;
                lastMessage.isLoading = false;
              } else {
                // Add new AI message
                newMessages.push({
                  id: Date.now().toString(),
                  content: response.Content,
                  sender: 'ai',
                  timestamp: new Date()
                });
              }
              return newMessages;
            });
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
        setIsLoading(false);
      });

      wsRef.current.onError((error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setIsLoading(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to AI service",
          variant: "destructive",
        });
      });

      wsRef.current.onClose(() => {
        setIsConnected(false);
        console.log('🔌 WebSocket disconnected');
      });

      await wsRef.current.connect();
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      toast({
        title: "Connection Error",
        description: "Failed to initialize AI service",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !attachment || !wsRef.current?.isConnected()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);
    
    const messageToSend = message;
    setMessage('');

    try {
      wsRef.current.sendMessage(
        messageToSend, 
        attachment.spaceId, 
        attachment.type === 'file' ? attachment.fileName : undefined
      );
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setIsLoading(false);
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = async () => {
    if (!attachment) return;
    
    setMessages([]);
    setIsLoading(false);
    
    if (!isConnected) {
      await initializeWebSocket();
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName) {
      return user.firstName;
    }
    return user.username;
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Show welcome screen if no messages
  if (messages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
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
            <h1 className="text-4xl font-normal text-gray-800">
              {getTimeOfDayGreeting()}, {getUserDisplayName()}
            </h1>
            <h2 className="text-4xl font-normal">
              <span className="text-gray-800">What's on </span>
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
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question or make a request..."
                  className="min-h-32 border-none resize-none text-base placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <AttachMenu 
                    onAttach={setAttachment}
                    currentAttachment={attachment}
                  />
                </div>
                
                <Button 
                  className="bg-gray-800 hover:bg-gray-900 rounded-lg w-10 h-10 p-0 flex items-center justify-center"
                  disabled={!message.trim() || !attachment}
                  onClick={startNewChat}
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show chat interface
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
            <div>
              <h1 className="font-semibold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-600">
                {attachment?.type === 'space' ? attachment.spaceName : `${attachment?.fileName} (${attachment?.spaceName})`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex-shrink-0"></div>
            )}
            <div className={`max-w-2xl ${msg.sender === 'user' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-2xl px-4 py-3 shadow-sm border border-gray-200`}>
              {msg.isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="rounded-full bg-gray-300 h-2 w-2"></div>
                    <div className="rounded-full bg-gray-300 h-2 w-2"></div>
                    <div className="rounded-full bg-gray-300 h-2 w-2"></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="border-none bg-transparent resize-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-0"
              rows={1}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-gray-800 hover:bg-gray-900 rounded-xl w-10 h-10 p-0"
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
