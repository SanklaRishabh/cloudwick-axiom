import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { WebSocketService } from '@/lib/websocket';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

interface AIChatInterfaceProps {
  spaceId: string;
  onCourseCreated: () => void;
  onError: (error: string) => void;
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ 
  spaceId, 
  onCourseCreated, 
  onError 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsService = useRef<WebSocketService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

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
    // Initialize WebSocket connection
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
        addMessage('Welcome! I\'m here to help you create a course using AI. Please describe what kind of course you\'d like to create.', 'ai');
      });

      wsService.current.onMessage((message: string) => {
        handleWebSocketMessage(message);
      });

      wsService.current.onError((error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        setIsConnected(false);
        onError('Failed to connect to AI service. Please try again.');
      });

      wsService.current.onClose(() => {
        setIsConnected(false);
      });

      await wsService.current.connect();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setIsConnecting(false);
      onError('Failed to connect to AI service. Please try again.');
    }
  };

  const handleWebSocketMessage = (message: string) => {
    console.log('Handling WebSocket message:', message);
    
    // Check if this is the in_progress status response (JSON format with double quotes)
    if (message === '{"status": "in_progress"}') {
      setIsLoading(false);
      // Replace the loading message with "Processing..." message
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.isLoading) {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: 'Processing...',
            isLoading: false
          };
        } else {
          // If no loading message exists, add the processing message
          newMessages.push({
            id: generateUniqueId(),
            content: 'Processing...',
            sender: 'ai',
            timestamp: new Date(),
            isLoading: false
          });
        }
        return newMessages;
      });
      return;
    }

    // Handle final AI response - replace the "Processing..." message
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      
      if (lastMessage && lastMessage.content === 'Processing...') {
        // Replace the "Processing..." message with the final response
        newMessages[newMessages.length - 1] = {
          ...lastMessage,
          content: message,
          timestamp: new Date()
        };
      } else {
        // Add as new message if no "Processing..." message exists
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
    if (!inputValue.trim() || !wsService.current?.isConnected()) {
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage(userMessage, 'user');
    
    // Add loading message
    addMessage('AI is thinking...', 'ai', true);
    setIsLoading(true);

    try {
      wsService.current.sendMessage(userMessage, spaceId);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      // Remove the loading message on error
      setMessages(prev => prev.slice(0, -1));
      onError('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    addMessage('Conversation cleared. How can I help you create a course?', 'ai');
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span className="font-medium">AI Course Creator</span>
          {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
          )}
          {!isConnected && !isConnecting && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Disconnected" />
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onCourseCreated}
            disabled={messages.length === 0}
          >
            Complete Course
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            disabled={messages.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.sender === 'ai' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  {message.sender === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the course you want to create..."
            disabled={!isConnected || isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || !isConnected || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;
