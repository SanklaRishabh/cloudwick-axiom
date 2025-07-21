
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, MessageCircle } from 'lucide-react';
import { AttachMenu } from '@/components/AttachMenu';
import { WebSocketService } from '@/lib/websocket';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

const AIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [attachment, setAttachment] = useState<{ type: 'space' | 'file'; spaceId: string; spaceName: string; fileName?: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsService = useRef<WebSocketService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);
  const { toast } = useToast();

  const generateUniqueId = () => {
    messageIdCounter.current += 1;
    return `${Date.now()}-${messageIdCounter.current}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize WebSocket connection immediately
    initializeWebSocket();
    
    return () => {
      if (wsService.current) {
        wsService.current.disconnect();
      }
    };
  }, []);

  const initializeWebSocket = async () => {
    try {
      setIsConnecting(true);
      wsService.current = new WebSocketService();

      wsService.current.onConnection(() => {
        setIsConnected(true);
        setIsConnecting(false);
        addMessage('Hello! I\'m your AI assistant. Please attach a space or file using the attachment button below, then describe what you\'d like me to help you with.', 'ai');
      });

      wsService.current.onMessage((message: string) => {
        handleWebSocketMessage(message);
      });

      wsService.current.onError((error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        setIsConnected(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to AI service. Please refresh and try again.",
          variant: "destructive",
        });
      });

      wsService.current.onClose(() => {
        setIsConnected(false);
      });

      await wsService.current.connect();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setIsConnecting(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to AI service. Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  const handleWebSocketMessage = (message: string) => {
    console.log('Handling WebSocket message:', message);
    
    if (message === '{"status": "in_progress"}') {
      setIsLoading(false);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.isLoading) {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: 'Processing your request...',
            isLoading: false
          };
        } else {
          newMessages.push({
            id: generateUniqueId(),
            content: 'Processing your request...',
            sender: 'ai',
            timestamp: new Date(),
            isLoading: false
          });
        }
        return newMessages;
      });
      return;
    }

    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      
      if (lastMessage && lastMessage.content === 'Processing your request...') {
        newMessages[newMessages.length - 1] = {
          ...lastMessage,
          content: message,
          timestamp: new Date()
        };
      } else {
        newMessages.push({
          id: generateUniqueId(),
          content: message,
          sender: 'ai',
          timestamp: new Date()
        });
      }
      
      return newMessages;
    });
  };

  const addMessage = (content: string, sender: 'user' | 'ai', isLoading: boolean = false) => {
    const newMessage: ChatMessage = {
      id: generateUniqueId(),
      content,
      sender,
      timestamp: new Date(),
      isLoading
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !wsService.current?.isConnected() || !attachment) {
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage(userMessage, 'user');
    
    addMessage('AI is thinking...', 'ai', true);
    setIsLoading(true);

    try {
      wsService.current.sendMessage(userMessage, attachment.spaceId, attachment.fileName);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      setMessages(prev => prev.slice(0, -1));
      toast({
        title: "Send Error",
        description: "Failed to send message. Please try again.",
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

  const getConnectionStatus = () => {
    if (isConnecting) return { text: 'Connecting...', color: 'text-yellow-500' };
    if (isConnected) return { text: 'Connected', color: 'text-green-500' };
    return { text: 'Disconnected', color: 'text-red-500' };
  };

  const status = getConnectionStatus();

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-semibold text-gray-900">AI Chat</h1>
            <div className="flex items-center gap-2">
              {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className={`text-sm ${status.color}`}>{status.text}</span>
            </div>
          </div>
          {attachment && (
            <div className="text-sm text-gray-600">
              Attached: {attachment.type === 'space' ? attachment.spaceName : `${attachment.fileName} (${attachment.spaceName})`}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.sender === 'ai' && <Bot className="h-5 w-5 mt-0.5 flex-shrink-0 text-purple-600" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      <p className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.sender === 'user' && <User className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end gap-3">
            <AttachMenu 
              onAttach={setAttachment}
              currentAttachment={attachment}
            />
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={attachment ? "Type your message..." : "Please attach a space or file first..."}
                disabled={!isConnected || isLoading || !attachment}
                className="min-h-12 text-base"
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || !isConnected || isLoading || !attachment}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 h-12 px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
