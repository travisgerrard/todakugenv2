'use client';

import { Card } from '@/components/ui/card';

interface GrammarPoint {
  pattern: string;
  explanation: string;
  example: string;
  example_translation: string;
}

interface GrammarCardProps {
  point: GrammarPoint;
}

export function GrammarCard({ point }: GrammarCardProps) {
  return (
    <Card className="p-4">
      <h3 className="text-xl font-medium mb-2">{point.pattern}</h3>
      <p className="mb-2">{point.explanation}</p>
      <div className="text-sm text-gray-500">
        <p>Example: {point.example}</p>
        <p>{point.example_translation}</p>
      </div>
    </Card>
  );
} 