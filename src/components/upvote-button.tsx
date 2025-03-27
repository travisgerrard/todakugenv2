'use client';

import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';

interface UpvoteButtonProps {
  storyId: string;
  upvotes: number;
}

export function UpvoteButton({ storyId, upvotes }: UpvoteButtonProps) {
  const handleUpvote = async () => {
    const response = await fetch(`/api/stories/${storyId}/upvote`, {
      method: 'POST',
    });
    if (response.ok) {
      // Refresh the page to show updated upvotes
      window.location.reload();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={handleUpvote}
    >
      <ThumbsUp className="w-4 h-4" />
      <span>{upvotes}</span>
    </Button>
  );
} 