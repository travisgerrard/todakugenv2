'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface GrammarItem {
  pattern: string;
  explanation: string;
  example: string;
  example_translation: string;
  storyTitle: string;
  storyId: string;
}

interface UserLevels {
  wanikaniLevel: number;
  genkiChapter: number;
  tadokuLevel: number;
}

interface GrammarCollectionProps {
  grammar: GrammarItem[];
  userLevels: UserLevels;
}

export function GrammarCollection({ grammar, userLevels }: GrammarCollectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<GrammarItem[]>(grammar);
  const [currentTab, setCurrentTab] = useState('all');
  const [genkiChapter, setGenkiChapter] = useState(userLevels.genkiChapter);

  useEffect(() => {
    filterGrammar();
  }, [searchQuery, currentTab, genkiChapter]);

  const filterGrammar = () => {
    let filtered = [...grammar];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.pattern.toLowerCase().includes(query) ||
          item.explanation.toLowerCase().includes(query)
      );
    }

    // Set filtered items
    setFilteredItems(filtered);
  };

  if (!grammar.length) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/10">
        <p className="text-lg">No grammar points available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search grammar patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:max-w-xs"
          />
        </div>
        
        <Tabs defaultValue="all" onValueChange={setCurrentTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="genki">Genki</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <p className="text-sm text-muted-foreground mb-4">
              Showing all grammar points ({filteredItems.length})
            </p>
          </TabsContent>
          
          <TabsContent value="genki">
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Genki Chapter: {genkiChapter}</p>
              <Slider
                value={[genkiChapter]}
                onValueChange={(value) => setGenkiChapter(value[0])}
                max={23}
                step={1}
                className="max-w-md"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredItems.map((item, index) => (
          <Card key={index} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-xl">{item.pattern}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-lg mb-4">{item.explanation}</p>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-1">Example:</p>
                <p className="font-medium">{item.example}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.example_translation}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/stories/${item.storyId}`} passHref>
                <Button variant="outline" size="sm">
                  View in Story
                </Button>
              </Link>
              <Badge variant="outline">{item.storyTitle}</Badge>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 