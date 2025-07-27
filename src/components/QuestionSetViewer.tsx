import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Send } from 'lucide-react';
import { useQuestions, TestResult } from '@/hooks/useQuestionSets';

interface QuestionSetViewerProps {
  spaceId: string;
  requestId: string;
  onBack: () => void;
}

export const QuestionSetViewer: React.FC<QuestionSetViewerProps> = ({
  spaceId,
  requestId,
  onBack
}) => {
  const { questions, loading, submitAnswers } = useQuestions(spaceId, requestId);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = value;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Fill empty answers with empty strings
      const completeAnswers = questions.map((_, index) => selectedAnswers[index] || '');
      const testResults = await submitAnswers(completeAnswers);
      setResults(testResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting answers:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getOptionLabel = (optionNumber: number) => {
    return String.fromCharCode(97 + optionNumber); // 'a', 'b', 'c', 'd'
  };

  const isAnswerCorrect = (questionIndex: number) => {
    if (!showResults || !results[questionIndex]) return null;
    const selectedAnswer = selectedAnswers[questionIndex];
    const correctAnswer = results[questionIndex].Answer.toLowerCase();
    return selectedAnswer === correctAnswer;
  };

  const getScore = () => {
    if (!showResults) return 0;
    let correct = 0;
    results.forEach((result, index) => {
      if (selectedAnswers[index] === result.Answer.toLowerCase()) {
        correct++;
      }
    });
    return Math.round((correct / results.length) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2 font-lexend"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Test Sets
        </Button>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-lexend">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2 font-lexend"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Test Sets
        </Button>
        {showResults && (
          <div className="flex items-center gap-2">
            <Badge variant={getScore() >= 70 ? "default" : "destructive"} className="text-lg px-3 py-1">
              Score: {getScore()}%
            </Badge>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-lexend">
            {showResults ? 'Test Results' : 'Test Questions'}
          </h2>
          <p className="text-gray-600 font-lexend">
            {showResults 
              ? `You scored ${getScore()}% on this test`
              : `Answer all ${questions.length} questions and submit to see results`
            }
          </p>
        </div>

        {questions.map((question, index) => {
          const result = showResults ? results[index] : null;
          const isCorrect = isAnswerCorrect(index);
          
          return (
            <Card key={question.SequenceNumber} className={`transition-all duration-200 ${
              showResults 
                ? isCorrect 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
                : 'hover:shadow-md'
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-lexend flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      Q{question.SequenceNumber}
                    </Badge>
                    {question.Question}
                  </CardTitle>
                  {showResults && (
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={selectedAnswers[index] || ''}
                  onValueChange={(value) => handleAnswerChange(index, value)}
                  disabled={showResults}
                >
                  {[question.Option1, question.Option2, question.Option3, question.Option4].map((option, optionIndex) => {
                    const optionValue = getOptionLabel(optionIndex);
                    const isSelected = selectedAnswers[index] === optionValue;
                    const isCorrectOption = showResults && result?.Answer.toLowerCase() === optionValue;
                    
                    return (
                      <div key={optionIndex} className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                        showResults
                          ? isCorrectOption
                            ? 'bg-green-100 border border-green-300'
                            : isSelected && !isCorrectOption
                            ? 'bg-red-100 border border-red-300'
                            : ''
                          : isSelected
                          ? 'bg-blue-50 border border-blue-300'
                          : ''
                      }`}>
                        <RadioGroupItem value={optionValue} id={`q${index}-${optionValue}`} />
                        <Label 
                          htmlFor={`q${index}-${optionValue}`} 
                          className="flex-1 cursor-pointer font-lexend"
                        >
                          <span className="font-medium mr-2">{optionValue.toUpperCase()}.</span>
                          {option}
                        </Label>
                        {showResults && isCorrectOption && (
                          <Badge variant="default" className="bg-green-500">
                            Correct
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>

                {showResults && result && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                    <h4 className="font-semibold text-gray-900 font-lexend mb-2">Explanation:</h4>
                    <p className="text-gray-700 font-lexend">{result.Explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {!showResults && questions.length > 0 && (
          <div className="flex justify-center pt-6">
            <Button 
              onClick={handleSubmit}
              disabled={submitting || selectedAnswers.filter(Boolean).length === 0}
              className="bg-gradient-primary hover:bg-gradient-primary/90 text-white px-8 py-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Test
                </>
              )}
            </Button>
          </div>
        )}

        {showResults && (
          <div className="flex justify-center pt-6">
            <Button 
              onClick={onBack}
              variant="outline"
              className="px-8 py-2"
            >
              Back to Test Sets
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};