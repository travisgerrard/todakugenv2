'use client';

import { SectionHeader } from '@/components/section-header';
import { VocabularySection } from '@/components/vocabulary-section';
import { GrammarSection } from '@/components/grammar-section';
import { QuizSection } from '@/components/quiz-section';
import { Database } from '@/lib/types';

type Story = Database['public']['Tables']['stories']['Row'];

interface StorySectionsProps {
  story: Story;
}

export function StorySections({ story }: StorySectionsProps) {
  return (
    <div className="space-y-8">
      <section>
        <SectionHeader title="Vocabulary" />
        <VocabularySection vocabulary={story.vocabulary} />
      </section>

      <section>
        <SectionHeader title="Grammar Points" />
        <GrammarSection grammar={story.grammar} />
      </section>

      <section>
        <SectionHeader title="Quizzes" />
        <QuizSection quizzes={story.quizzes} />
      </section>
    </div>
  );
} 