'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';

interface QuizItem {
  type: 'vocabulary' | 'grammar' | 'comprehension';
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  related_item?: string;
  storyTitle: string;
  storyId: string;
}

interface UserLevels {
  wanikaniLevel: number;
  genkiChapter: number;
  tadokuLevel: number;
}

interface QuizCollectionProps {
  quizzes: QuizItem[];
  userLevels: UserLevels;
}

export function QuizCollection({ quizzes, userLevels }: QuizCollectionProps) {
  const [quizType, setQuizType] = useState<string>('all');
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizItem[]>(quizzes);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    filterQuizzes();
  }, [quizType]);

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    // Filter by quiz type
    if (quizType !== 'all') {
      filtered = filtered.filter(quiz => quiz.type === quizType);
    }

    setFilteredQuizzes(filtered);
  };

  const handleAnswerSelect = (quizId: string, answerIndex: number) => {
    if (selectedAnswers[quizId] !== undefined) return; // Prevent changing answer
    setSelectedAnswers(prev => ({ ...prev, [quizId]: answerIndex }));
    setShowResults(prev => ({ ...prev, [quizId]: true }));
  };

  const toggleExplanation = (quizId: string) => {
    setShowExplanations(prev => ({ ...prev, [quizId]: !prev[quizId] }));
  };

  const quizKey = (quiz: QuizItem, index: number) => `${quiz.type}-${quiz.question}-${index}`;

  const isCorrect = (quiz: QuizItem, answerIndex: number) => {
    return quiz.correct_answer === answerIndex;
  };

  if (!quizzes.length) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/10">
        <p className="text-lg">No quizzes available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="all" onValueChange={setQuizType} className="w-full mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Quizzes</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="grammar">Grammar</TabsTrigger>
          <TabsTrigger value="comprehension">Comprehension</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:gap-8">
        {filteredQuizzes.map((quiz, index) => (
          <Card key={quizKey(quiz, index)} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="mb-2">
                  {quiz.type.charAt(0).toUpperCase() + quiz.type.slice(1)}
                </Badge>
                <Badge variant="outline">{quiz.storyTitle}</Badge>
              </div>
              <CardTitle className="text-xl">{quiz.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedAnswers[quizKey(quiz, index)]?.toString()} 
                className="gap-3"
              >
                {quiz.options.map((option, optionIndex) => {
                  const optionKey = quizKey(quiz, index);
                  const isSelected = selectedAnswers[optionKey] === optionIndex;
                  const showResult = showResults[optionKey];
                  const correct = quiz.correct_answer === optionIndex;
                  
                  let className = "flex items-center space-x-2 rounded p-3 border";
                  if (showResult && isSelected) {
                    className += correct ? " bg-green-50 border-green-200" : " bg-red-50 border-red-200";
                  } else if (showResult && correct) {
                    className += " bg-green-50 border-green-200";
                  }
                  
                  return (
                    <div 
                      key={optionIndex} 
                      className={className}
                      onClick={() => handleAnswerSelect(optionKey, optionIndex)}
                    >
                      <RadioGroupItem value={optionIndex.toString()} id={`option-${optionKey}-${optionIndex}`} />
                      <Label 
                        htmlFor={`option-${optionKey}-${optionIndex}`}
                        className="flex-grow cursor-pointer"
                      >
                        {option}
                      </Label>
                      {showResult && isSelected && (
                        correct ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />
                      )}
                      {showResult && !isSelected && correct && (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
              
              {showResults[quizKey(quiz, index)] && (
                <div className="mt-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => toggleExplanation(quizKey(quiz, index))}
                    className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                  >
                    {showExplanations[quizKey(quiz, index)] ? "Hide explanation" : "Show explanation"}
                  </Button>
                  
                  {showExplanations[quizKey(quiz, index)] && (
                    <div className="mt-2 p-3 bg-muted/20 rounded-md text-sm">
                      {quiz.explanation}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4 bg-muted/10">
              <Link href={`/stories/${quiz.storyId}`} passHref>
                <Button variant="outline" size="sm">
                  Go to Story
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 