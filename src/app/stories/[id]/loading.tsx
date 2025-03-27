import { StoryPageLoading } from '@/components/story-page-loading';
import { StoryPageLoadingProgress } from '@/components/story-page-loading-progress';

export default function StoryLoading() {
  return (
    <>
      <StoryPageLoadingProgress />
      <StoryPageLoading />
    </>
  );
} 