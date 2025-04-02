'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StoryGenerationProgressProps {
  status: 'generating' | 'processing' | 'complete' | 'error';
  error?: string;
}

export function StoryGenerationProgress({ status, error }: StoryGenerationProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === 'generating') {
      // Start at 0 and go up to 70% during generation
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 70) return 70;
          return prev + 5;
        });
      }, 1000);
    } else if (status === 'processing') {
      // Move from 70% to 90% during processing
      setProgress(70);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + 2;
        });
      }, 500);
    } else if (status === 'complete') {
      // Jump to 100% when complete
      setProgress(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const getStatusMessage = () => {
    switch (status) {
      case 'generating':
        return 'Generating your story...';
      case 'processing':
        return 'Processing the content...';
      case 'complete':
        return 'Story generated successfully!';
      case 'error':
        return 'Error generating story';
      default:
        return 'Preparing...';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Story Generation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground text-center">
          {getStatusMessage()}
        </p>
        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
} 