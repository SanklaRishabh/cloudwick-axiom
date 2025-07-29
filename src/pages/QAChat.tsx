import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Cloud, Users, Send, ArrowLeft, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useSpaces } from '@/hooks/useSpaces';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getQAChatWebSocketUrl } from '@/lib/config';

interface QAMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
}

interface QuestionData {
  file?: string;
  question?: string;
  options?: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  scenario?: string;
  expectedSolution?: string;
  keyPoints?: string[];
  totalFiles?: number;
  correct?: string;
  explanation?: string;
}

interface EvaluationData {
  score: number;
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  suggestion?: string;
}

type ChatbotState = 'idle' | 'selecting-type' | 'selecting-space' | 'selecting-mode' | 'ready' | 'question' | 'connecting' | 'evaluation';

const QAChat: React.FC = () => {
  const [state, setState] = useState<ChatbotState>('idle');
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [selectedType, setSelectedType] = useState<'platform' | 'aws' | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'mcq' | 'solution' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [solutionAnswer, setSolutionAnswer] = useState<string>('');
  const [showHints, setShowHints] = useState<boolean>(false);
  const [lastEvaluation, setLastEvaluation] = useState<EvaluationData | null>(null);
  const { spaces } = useSpaces();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      addMessage('system', 'Connection closed.');
    };
  };

  const handleWebSocketMessage = (data: any) => {
    console.log('WebSocket message received:', data);
    switch (data.action) {
      case 'questionnaire':
        if (selectedType === 'aws') {
          setState('selecting-mode');
          addMessage('bot', 'AWS questionnaire initialized! Please select the mode:');
        } else if (data.status === 'ready') {
          setState('ready');
          addMessage('bot', data.message || 'Platform questionnaire initialized! You can now start answering questions.');
        } else if (data.type === 'mcq' && data.data) {
          setState('question');
          setCurrentQuestion(data.data);
          setSelectedAnswer(null);
          addMessage('bot', `Question from ${data.data.file}:\n\n${data.data.question}`);
        } else if (data.type === 'evaluation' && data.data) {
          setState('evaluation');
          setLastEvaluation(data.data);
          const result = data.data.isCorrect ? '✅ Correct!' : '❌ Incorrect';
          addMessage('bot', `${result}\n\nScore: ${data.data.score}\nFeedback: ${data.data.feedback}\nExplanation: ${data.data.explanation}`);
        }
        break;
      case 'setMode':
        if (data.status && data.mode) {
          setState('ready');
          addMessage('bot', `Mode set to ${data.mode.toUpperCase()}. You can now start answering questions.`);
        }
        break;
      case 'platform':
        if (data.data) {
          setState('evaluation');
          setLastEvaluation(data.data);
          const result = data.data.isCorrect ? '✅ Correct!' : '❌ Incorrect';
          addMessage('bot', `${result}\n\nScore: ${data.data.score}\nFeedback: ${data.data.feedback}\nExplanation: ${data.data.explanation}`);
        }
        break;
      default:
        if (data.type === 'question' && data.mode === 'mcq') {
          setState('question');
          setCurrentQuestion(data.data);
          setSelectedAnswer(null);
          setSolutionAnswer('');
          setShowHints(false);
          addMessage('bot', `AWS MCQ Question:\n\n${data.data.question}`);
        } else if (data.type === 'question' && data.mode === 'solution') {
          setState('question');
          setCurrentQuestion(data.data);
          setSelectedAnswer(null);
          setSolutionAnswer('');
          setShowHints(false);
          addMessage('bot', `AWS Solution Question:\n\n${data.data.scenario}`);
        } else if (data.type === 'evaluation') {
          setState('evaluation');
          setLastEvaluation(data.data);
          const result = data.data.isCorrect ? '✅ Correct!' : '❌ Incorrect';
          addMessage('bot', `${result}\n\nScore: ${data.data.score}\nFeedback: ${data.data.feedback}\nExplanation: ${data.data.explanation}`);
        } else if (data.message) {
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
      setState('selecting-mode');
      addMessage('bot', 'AWS questionnaire selected! Please choose your preferred mode:');
    } else {
      setState('selecting-space');
      addMessage('bot', 'Please select a space from your available spaces:');
    }
  };

  const handleSpaceSelection = (spaceId: string) => {
    setSelectedSpace(spaceId);
    const space = spaces.find(s => s.SpaceId === spaceId);
    addMessage('user', `Selected space: ${space?.SpaceName || spaceId}`);
    
    setState('connecting');
    addMessage('system', 'Initializing platform questionnaire...');
    
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
    if ((!selectedAnswer && !solutionAnswer.trim()) || !currentQuestion) return;
    
    if (selectedMode === 'solution') {
      addMessage('user', `Solution submitted: ${solutionAnswer}`);
      sendMessage({
        action: 'submitAnswer',
        answer: solutionAnswer
      });
      setSolutionAnswer('');
    } else {
      const answer = selectedAnswer!;
      const options = currentQuestion.options!;
      addMessage('user', `Selected answer: ${answer.toUpperCase()}) ${options[answer as keyof typeof options]}`);
      
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
    }
    
    setCurrentQuestion(null);
    // State will be updated to 'evaluation' when response arrives
  };

  const handleModeSelection = (mode: 'mcq' | 'solution') => {
    setSelectedMode(mode);
    addMessage('user', `Selected mode: ${mode.toUpperCase()}`);
    
    sendMessage({
      action: 'setMode',
      mode: mode
    });
  };

  const resetChat = () => {
    if (websocket) {
      websocket.close();
    }
    setMessages([]);
    setState('idle');
    setSelectedType(null);
    setSelectedSpace(null);
    setSelectedMode(null);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setLastEvaluation(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Knowledge Testing</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-8rem)] flex flex-col">
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
            <div className="flex-1 bg-card rounded-lg border">
              <div className="h-full flex flex-col">
                <div className="flex-1 p-6">
                  <ScrollArea className="h-full">
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

                      {state === 'selecting-mode' && (
                        <div className="space-y-3">
                          <Separator />
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleModeSelection('mcq')}
                              className="flex-1"
                              variant="outline"
                            >
                              MCQ Mode
                            </Button>
                            <Button
                              onClick={() => handleModeSelection('solution')}
                              className="flex-1"
                              variant="outline"
                            >
                              Solution Mode
                            </Button>
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

                      {state === 'evaluation' && (
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
                              {currentQuestion.file && (
                                <Badge variant="secondary">
                                  File: {currentQuestion.file}
                                </Badge>
                              )}
                               <Badge variant="outline">
                                 {selectedType === 'aws' ? `AWS ${selectedMode?.toUpperCase()}` : 'Platform MCQ'}
                               </Badge>
                             </div>
                             
                             {selectedMode === 'solution' ? (
                               <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                                 <p className="font-medium mb-3">{currentQuestion.scenario}</p>
                                 
                                 {currentQuestion.keyPoints && currentQuestion.keyPoints.length > 0 && (
                                   <div className="space-y-2">
                                     <Button
                                       onClick={() => setShowHints(!showHints)}
                                       variant="secondary"
                                       size="sm"
                                       className="flex items-center gap-2"
                                     >
                                       <Lightbulb className="h-4 w-4" />
                                       {showHints ? 'Hide Hints' : 'Show Hints'}
                                     </Button>
                                     
                                     {showHints && (
                                       <div className="bg-background/50 p-3 rounded border">
                                         <h4 className="font-medium text-sm mb-2">Key Points:</h4>
                                         <ul className="text-sm space-y-1">
                                           {currentQuestion.keyPoints.map((point, index) => (
                                             <li key={index} className="flex items-start gap-2">
                                               <span className="text-primary">•</span>
                                               <span>{point}</span>
                                             </li>
                                           ))}
                                         </ul>
                                       </div>
                                     )}
                                   </div>
                                 )}
                                 
                                 <div className="space-y-2">
                                   <label className="text-sm font-medium">Your Solution:</label>
                                   <Textarea
                                     value={solutionAnswer}
                                     onChange={(e) => setSolutionAnswer(e.target.value)}
                                     placeholder="Type your solution here..."
                                     className="min-h-[120px]"
                                   />
                                 </div>
                               </div>
                             ) : (
                               <div className="bg-muted/50 p-4 rounded-lg">
                                 <p className="font-medium mb-3">{currentQuestion.question}</p>
                                 <div className="space-y-2">
                                   {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, value]) => (
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
                             )}
                             
                             <Button 
                               onClick={handleAnswerSubmit}
                               disabled={selectedMode === 'solution' ? !solutionAnswer.trim() : !selectedAnswer}
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
                </div>

                <div className="border-t p-4">
                  <Button 
                    onClick={resetChat}
                    variant="outline"
                    className="w-full"
                  >
                    Reset Chat
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QAChat;