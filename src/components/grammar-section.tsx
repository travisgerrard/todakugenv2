'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GrammarItem {
  pattern: string;
  explanation: string;
  example: string;
  example_translation: string;
}

interface GrammarSectionProps {
  grammar: GrammarItem[];
}

export function GrammarSection({ grammar }: GrammarSectionProps) {
  const [items, setItems] = useState<GrammarItem[]>([]);

  useEffect(() => {
    if (Array.isArray(grammar)) {
      setItems(grammar);
    }
  }, [grammar]);

  if (!items?.length) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Grammar Points</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl">{item.pattern}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-2">{item.explanation}</p>
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