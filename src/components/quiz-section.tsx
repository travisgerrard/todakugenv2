'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Quiz {
  type: 'vocabulary' | 'grammar' | 'comprehension';
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  related_item?: string;
}

interface QuizSectionProps {
  quizzes: Quiz[];
}

export function QuizSection({ quizzes }: QuizSectionProps) {
  const [items, setItems] = useState<Quiz[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (Array.isArray(quizzes)) {
      setItems(quizzes);
      // Reset all states when quizzes change
      setSelectedAnswers({});
      setShowExplanations({});
      setShowResults({});
    }
  }, [quizzes]);

  if (!items?.length) return null;

  const vocabularyQuizzes = items.filter(q => q.type === 'vocabulary');
  const grammarQuizzes = items.filter(q => q.type === 'grammar');
  const comprehensionQuizzes = items.filter(q => q.type === 'comprehension');

  const handleAnswerSelect = (quizId: string, answerIndex: number) => {
    if (selectedAnswers[quizId] !== null && selectedAnswers[quizId] !== undefined) return; // Prevent multiple selections
    setSelectedAnswers(prev => ({ ...prev, [quizId]: answerIndex }));
    setShowResults(prev => ({ ...prev, [quizId]: true }));
  };

  const toggleExplanation = (quizId: string) => {
    setShowExplanations(prev => ({ ...prev, [quizId]: !prev[quizId] }));
  };

  const isCorrect = (quiz: Quiz, answerIndex: number) => {
    return quiz.correct_answer === answerIndex;
  };

  const renderQuiz = (quiz: Quiz, index: number) => {
    const quizId = `${quiz.type}-${index}`;
    const isAnswered = selectedAnswers[quizId] !== null && selectedAnswers[quizId] !== undefined;
    
    return (
      <Card key={quizId} className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">
            {quiz.type === 'vocabulary' && 'Vocabulary Quiz'}
            {quiz.type === 'grammar' && 'Grammar Quiz'}
            {quiz.type === 'comprehension' && 'Comprehension Quiz'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quiz.related_item && (
            <p className="text-sm text-muted-foreground mb-2">
              Related {quiz.type === 'vocabulary' ? 'word' : 'pattern'}: {quiz.related_item}
            </p>
          )}
          <p className="mb-4">{quiz.question}</p>
          <div className="space-y-2">
            {quiz.options.map((option, optionIndex) => {
              const isSelected = selectedAnswers[quizId] === optionIndex;
              const isCorrectAnswer = isCorrect(quiz, optionIndex);
              
              let buttonStyle = 'bg-white hover:bg-gray-50 border-gray-200';
              
              if (isAnswered) {
                if (isSelected) {
                  buttonStyle = isCorrectAnswer 
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-red-500 text-white border-red-500';
                } else if (isCorrectAnswer) {
                  buttonStyle = 'bg-green-100 border-green-200';
                }
              }
              
              return (
                <div
                  key={optionIndex}
                  className={`w-full p-3 rounded-md border cursor-pointer transition-colors ${buttonStyle}`}
                  onClick={() => !isAnswered && handleAnswerSelect(quizId, optionIndex)}
                >
                  {option}
                </div>
              );
            })}
          </div>
          {showResults[quizId] && (
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={() => toggleExplanation(quizId)}
                className="text-sm"
              >
                {showExplanations[quizId] ? 'Hide Explanation' : 'Show Explanation'}
              </Button>
              {showExplanations[quizId] && (
                <p className="mt-2 text-sm text-muted-foreground">{quiz.explanation}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Quizzes</h2>
      <Tabs defaultValue="vocabulary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vocabulary">
            Vocabulary ({vocabularyQuizzes.length})
          </TabsTrigger>
          <TabsTrigger value="grammar">
            Grammar ({grammarQuizzes.length})
          </TabsTrigger>
          <TabsTrigger value="comprehension">
            Comprehension ({comprehensionQuizzes.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="vocabulary">
          {vocabularyQuizzes.map((quiz, index) => renderQuiz(quiz, index))}
        </TabsContent>
        <TabsContent value="grammar">
          {grammarQuizzes.map((quiz, index) => renderQuiz(quiz, index))}
        </TabsContent>
        <TabsContent value="comprehension">
          {comprehensionQuizzes.map((quiz, index) => renderQuiz(quiz, index))}
        </TabsContent>
      </Tabs>
    </section>
  );
} 