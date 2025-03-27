'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VocabularyItem {
  word: string;
  reading: string;
  meaning: string;
  example: string;
  example_translation: string;
}

interface VocabularySectionProps {
  vocabulary: VocabularyItem[];
}

export function VocabularySection({ vocabulary }: VocabularySectionProps) {
  const [items, setItems] = useState<VocabularyItem[]>([]);

  useEffect(() => {
    if (Array.isArray(vocabulary)) {
      setItems(vocabulary);
    }
  }, [vocabulary]);

  if (!items?.length) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Vocabulary</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl">
                {item.word} <span className="text-muted-foreground">({item.reading})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-2">{item.meaning}</p>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">Example:</p>
                <p className="font-medium">{item.example}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.example_translation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
} 