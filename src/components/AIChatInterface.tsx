
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { WebSocketService, WebSocketResponse } from '@/lib/websocket';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
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

      wsService.current.onMessage((message: WebSocketResponse) => {
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

  const handleWebSocketMessage = (message: WebSocketResponse) => {
    setIsLoading(false);

    if (message.status === 'in_progress') {
      // Just acknowledge that the request is being processed
      return;
    }

    if (message.message) {
      addMessage(message.message, 'ai');
    }

    // Check if this is a course creation completion
    if (message.type === 'course_created' || message.status === 'completed') {
      setTimeout(() => {
        onCourseCreated();
      }, 1000);
    }
  };

  const addMessage = (content: string, sender: 'user' | 'ai') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date()
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
    setIsLoading(true);

    try {
      wsService.current.sendMessage(userMessage, spaceId);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
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
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConversation}
          disabled={messages.length === 0}
        >
          Clear
        </Button>
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
                    <p className="text-sm">{message.content}</p>
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
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
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
