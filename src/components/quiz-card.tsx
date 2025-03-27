'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizCardProps {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export function QuizCard({ question, options, correctAnswer, explanation }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <Card className="p-4">
      <h3 className="text-xl font-medium mb-2">Question</h3>
      <p className="mb-4">{question}</p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <Button
            key={index}
            variant={selectedAnswer === index ? (isCorrect ? 'default' : 'destructive') : 'outline'}
            className="w-full justify-start"
            onClick={() => handleAnswer(index)}
            disabled={selectedAnswer !== null}
          >
            {option}
            {selectedAnswer === index && (
              <span className="ml-2">
                {isCorrect ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </span>
            )}
          </Button>
        ))}
      </div>
      {showExplanation && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="font-medium mb-2">
            {isCorrect ? 'Correct!' : 'Incorrect. The correct answer is:'}
          </p>
          <p>{explanation}</p>
        </div>
      )}
    </Card>
  );
} 