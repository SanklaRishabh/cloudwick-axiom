import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Calendar, Trash2, Play } from 'lucide-react';
import { useQuestionSets } from '@/hooks/useQuestionSets';
import { QuestionSetViewer } from './QuestionSetViewer';

interface SpaceTestsProps {
  spaceId: string;
}

const SpaceTests: React.FC<SpaceTestsProps> = ({ spaceId }) => {
  const { questionSets, loading, createQuestionSet, deleteQuestionSet } = useQuestionSets(spaceId);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<string | null>(null);

  const handleCreateQuestionSet = async () => {
    await createQuestionSet();
  };

  const handleDeleteQuestionSet = async (requestId: string) => {
    await deleteQuestionSet(requestId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedQuestionSet) {
    return (
      <QuestionSetViewer
        spaceId={spaceId}
        requestId={selectedQuestionSet}
        onBack={() => setSelectedQuestionSet(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 font-lexend">Loading test sets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-lexend">Test Sets</h2>
          <p className="text-gray-600 font-lexend">Create and manage question sets for testing knowledge</p>
        </div>
        <Button 
          onClick={handleCreateQuestionSet}
          className="bg-gradient-primary hover:bg-gradient-primary/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Test Set
        </Button>
      </div>

      {questionSets.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 font-lexend mb-2">No test sets yet</h3>
            <p className="text-gray-500 font-lexend mb-4">Create your first test set to start testing knowledge</p>
            <Button 
              onClick={handleCreateQuestionSet}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Test Set
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {questionSets.map((questionSet, index) => (
            <Card key={questionSet.RequestId} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-lexend">
                    Test Set {index + 1}
                  </CardTitle>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Test Set</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this test set? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteQuestionSet(questionSet.RequestId)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-lexend">
                  <Calendar className="h-4 w-4" />
                  {formatDate(questionSet.CreatedAt)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <Badge variant="outline" className="text-xs">
                    ID: {questionSet.RequestId.slice(0, 8)}...
                  </Badge>
                  <Button 
                    onClick={() => setSelectedQuestionSet(questionSet.RequestId)}
                    className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpaceTests;