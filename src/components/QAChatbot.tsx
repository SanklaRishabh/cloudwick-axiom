import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircleQuestion, Brain, Cloud, Users, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpaces } from '@/hooks/useSpaces';
import { useToast } from '@/hooks/use-toast';
import { getQAChatWebSocketUrl } from '@/lib/config';

interface QAMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
}

interface QuestionData {
  file: string;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  totalFiles: number;
}

type ChatbotState = 'idle' | 'selecting-type' | 'selecting-space' | 'ready' | 'question' | 'connecting';

const QAChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ChatbotState>('idle');
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [selectedType, setSelectedType] = useState<'platform' | 'aws' | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const { spaces } = useSpaces();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: QAMessage['type'], content: string) => {
    const newMessage: QAMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const connectWebSocket = () => {
    setState('connecting');
    addMessage('system', 'Connecting to Q&A service...');
    
    const ws = new WebSocket(getQAChatWebSocketUrl());
    
    ws.onopen = () => {
      setWebsocket(ws);
      setState('selecting-type');
      addMessage('bot', 'Welcome to the Knowledge Testing chatbot! Please select the type of questionnaire you would like to take:');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        toast({
          title: "Error",
          description: "Failed to parse server response",
          variant: "destructive",
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Q&A service",
        variant: "destructive",
      });
      setState('idle');
    };

    ws.onclose = () => {
      setWebsocket(null);
      if (state !== 'idle') {
        addMessage('system', 'Connection closed.');
      }
    };
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.action) {
      case 'questionnaire':
        if (data.status === 'ready') {
          setState('ready');
          addMessage('bot', data.message || 'Questionnaire initialized! You can now start answering questions.');
        } else if (data.type === 'mcq') {
          setState('question');
          setCurrentQuestion(data.data);
          setSelectedAnswer(null);
          addMessage('bot', `Question from ${data.data.file}:\n\n${data.data.question}`);
        }
        break;
      default:
        if (data.message) {
          addMessage('bot', data.message);
        }
    }
  };

  const sendMessage = (message: any) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message));
    }
  };

  const handleTypeSelection = (type: 'platform' | 'aws') => {
    setSelectedType(type);
    addMessage('user', `Selected: ${type.toUpperCase()}`);
    
    if (type === 'aws') {
      // For AWS, directly initialize questionnaire
      sendMessage({
        action: 'questionnaire',
        questionnaire: 'aws'
      });
    } else {
      // For platform, need to select space
      setState('selecting-space');
      addMessage('bot', 'Please select a space from your available spaces:');
    }
  };

  const handleSpaceSelection = (spaceId: string) => {
    setSelectedSpace(spaceId);
    const space = spaces.find(s => s.SpaceId === spaceId);
    addMessage('user', `Selected space: ${space?.SpaceName || spaceId}`);
    
    // Change state immediately to hide space selection
    setState('connecting');
    addMessage('system', 'Initializing platform questionnaire...');
    
    // Initialize platform questionnaire with selected space
    sendMessage({
      action: 'questionnaire',
      questionnaire: 'platform',
      space: spaceId
    });
  };

  const handleStartQuestion = () => {
    if (selectedType === 'platform') {
      sendMessage({ action: 'getSpaceQuestion' });
    } else {
      sendMessage({ action: 'getQuestion' });
    }
    addMessage('user', 'Get next question');
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    addMessage('user', `Selected answer: ${selectedAnswer.toUpperCase()}) ${currentQuestion.options[selectedAnswer as keyof typeof currentQuestion.options]}`);
    
    if (selectedType === 'platform') {
      sendMessage({
        action: 'submitSpaceAnswer',
        answer: selectedAnswer
      });
    } else {
      sendMessage({
        action: 'submitAnswer',
        answer: selectedAnswer
      });
    }
    
    setSelectedAnswer(null);
    setCurrentQuestion(null);
    setState('ready');
  };

  const resetChat = () => {
    if (websocket) {
      websocket.close();
    }
    setMessages([]);
    setState('idle');
    setSelectedType(null);
    setSelectedSpace(null);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetChat();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          onClick={() => setOpen(true)}
        >
          <MessageCircleQuestion className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Knowledge Testing Chatbot
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4">
          {state === 'idle' && (
            <div className="flex-1 flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    Test Your Knowledge
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Connect to start your interactive knowledge testing session
                  </p>
                  <Button onClick={connectWebSocket} className="w-full">
                    Start Chatbot
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {state !== 'idle' && (
            <ScrollArea className="flex-1 min-h-0 pr-4 overflow-auto">
              <div className="space-y-4">
                {/* Messages */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.type === 'system'
                          ? 'bg-muted text-muted-foreground text-sm'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {/* Interactive Elements */}
                {state === 'selecting-type' && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleTypeSelection('platform')}
                        className="flex-1 flex items-center gap-2"
                        variant="outline"
                      >
                        <Users className="h-4 w-4" />
                        Platform
                      </Button>
                      <Button
                        onClick={() => handleTypeSelection('aws')}
                        className="flex-1 flex items-center gap-2"
                        variant="outline"
                      >
                        <Cloud className="h-4 w-4" />
                        AWS
                      </Button>
                    </div>
                  </div>
                )}

                {state === 'selecting-space' && spaces.length > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="space-y-2">
                      {spaces.map((space) => (
                        <Button
                          key={space.SpaceId}
                          onClick={() => handleSpaceSelection(space.SpaceId)}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <div className="text-left">
                            <div className="font-medium">{space.SpaceName}</div>
                            {space.SpaceDescription && (
                              <div className="text-xs text-muted-foreground">
                                {space.SpaceDescription}
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {state === 'ready' && (
                  <div className="space-y-3">
                    <Separator />
                    <Button onClick={handleStartQuestion} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Get Next Question
                    </Button>
                  </div>
                )}

                {state === 'question' && currentQuestion && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          File: {currentQuestion.file}
                        </Badge>
                        <Badge variant="outline">
                          MCQ Question
                        </Badge>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="font-medium mb-3">{currentQuestion.question}</p>
                        <div className="space-y-2">
                          {Object.entries(currentQuestion.options).map(([key, value]) => (
                            <Button
                              key={key}
                              onClick={() => setSelectedAnswer(key)}
                              variant={selectedAnswer === key ? "default" : "outline"}
                              className="w-full text-left justify-start p-3 h-auto"
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-mono text-sm bg-background/50 px-2 py-1 rounded">
                                  {key.toUpperCase()}
                                </span>
                                <span className="flex-1 text-wrap break-words">{value}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleAnswerSubmit}
                        disabled={!selectedAnswer}
                        className="w-full"
                        size="lg"
                      >
                        Submit Answer
                      </Button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QAChatbot;