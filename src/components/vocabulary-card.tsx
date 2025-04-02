'use client';

import { Card } from '@/components/ui/card';

interface VocabularyItem {
  word: string;
  reading: string;
  meaning: string;
  example: string;
  example_translation: string;
}

interface VocabularyCardProps {
  item: VocabularyItem;
}

export function VocabularyCard({ item }: VocabularyCardProps) {
  return (
    <Card className="p-4">
      <h3 className="text-xl font-medium mb-2">{item.word}</h3>
      <p className="text-gray-600 mb-2">{item.reading}</p>
      <p className="font-medium mb-2">{item.meaning}</p>
      <div className="text-sm text-gray-500">
        <p>Example: {item.example}</p>
        <p>{item.example_translation}</p>
      </div>
    </Card>
  );
} 