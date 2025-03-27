import OpenAI from 'openai';
import { Database } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface StoryGenerationParams {
  wanikani_level: number;
  genki_chapter: number;
  tadoku_level: number;
  length: 'short' | 'medium' | 'long';
  topic: string;
}

interface VocabularyItem {
  word: string;
  reading: string;
  meaning: string;
  example: string;
  example_translation: string;
}

interface GrammarPoint {
  pattern: string;
  explanation: string;
  example: string;
  example_translation: string;
}

interface Quiz {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  type: 'vocabulary' | 'grammar' | 'comprehension';
  related_item?: string;
}

interface Story {
  title: string;
  content_jp: string;
  content_en: string;
  vocabulary: VocabularyItem[];
  grammar: GrammarPoint[];
  quizzes: Quiz[];
}

export async function generateStory(params: StoryGenerationParams): Promise<Story> {
  const { wanikani_level, genki_chapter, tadoku_level, length, topic } = params;
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const prompt = `Generate a Japanese story with the following requirements:
- Wanikani level: ${wanikani_level}
- Genki chapter: ${genki_chapter}
- Tadoku level: ${tadoku_level}
- Length: ${length}
- Topic: ${topic}

Please provide:
1. A title in Japanese and English
2. The story in Japanese
3. The story in English
4. A list of vocabulary words with readings and meanings
5. A list of grammar points with explanations
6. Example sentences for each vocabulary word and grammar point from the story
7. Multiple choice quiz questions for:
   - EVERY vocabulary word (testing meaning and usage)
   - EVERY grammar point (testing understanding and application)
   - Story comprehension (3-4 questions testing understanding of the story's content, main ideas, and details)

CRITICAL REQUIREMENTS:
1. You MUST create EXACTLY one quiz question for each vocabulary word
2. You MUST create EXACTLY one quiz question for each grammar point
3. The number of vocabulary quizzes MUST equal the number of vocabulary words
4. The number of grammar quizzes MUST equal the number of grammar points
5. Each vocabulary quiz MUST include the word it's testing in the 'related_item' field
6. Each grammar quiz MUST include the pattern it's testing in the 'related_item' field

Format the response as JSON with the following structure:
{
  "title": {
    "jp": "Japanese title",
    "en": "English title"
  },
  "content_jp": "Japanese story text",
  "content_en": "English story text",
  "vocabulary": [
    {
      "word": "word in Japanese",
      "reading": "reading in hiragana",
      "meaning": "English meaning",
      "example": "example sentence from story",
      "example_translation": "English translation of example"
    }
  ],
  "grammar": [
    {
      "pattern": "grammar pattern",
      "explanation": "English explanation",
      "example": "example sentence from story",
      "example_translation": "English translation of example"
    }
  ],
  "quizzes": [
    {
      "question": "quiz question",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct_answer": 0,
      "explanation": "explanation of the correct answer",
      "type": "vocabulary|grammar|comprehension",
      "related_item": "word or pattern (for vocabulary/grammar quizzes)"
    }
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a Japanese language teacher creating graded readers and quizzes. Always provide accurate Japanese text and translations. Create engaging stories with clear plot points that can be tested in comprehension questions. You MUST create EXACTLY one quiz question for each vocabulary word and grammar point. The number of quizzes must match the number of vocabulary words and grammar points exactly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const story = JSON.parse(response);
      
      // Validate that we have quizzes for all vocabulary and grammar points
      const vocabularyQuizzes = story.quizzes.filter((q: Quiz) => q.type === 'vocabulary');
      const grammarQuizzes = story.quizzes.filter((q: Quiz) => q.type === 'grammar');
      
      if (vocabularyQuizzes.length !== story.vocabulary.length) {
        throw new Error(`Mismatch: ${vocabularyQuizzes.length} vocabulary quizzes for ${story.vocabulary.length} vocabulary words`);
      }
      
      if (grammarQuizzes.length !== story.grammar.length) {
        throw new Error(`Mismatch: ${grammarQuizzes.length} grammar quizzes for ${story.grammar.length} grammar points`);
      }

      // Validate that each vocabulary word and grammar point has a corresponding quiz
      const vocabularyWords = new Set(story.vocabulary.map((v: VocabularyItem) => v.word));
      const grammarPatterns = new Set(story.grammar.map((g: GrammarPoint) => g.pattern));
      
      const quizVocabularyWords = new Set(vocabularyQuizzes.map((q: Quiz) => q.related_item));
      const quizGrammarPatterns = new Set(grammarQuizzes.map((q: Quiz) => q.related_item));
      
      const missingVocabulary = Array.from(vocabularyWords).filter(word => !quizVocabularyWords.has(word));
      const missingGrammar = Array.from(grammarPatterns).filter(pattern => !quizGrammarPatterns.has(pattern));
      
      if (missingVocabulary.length > 0) {
        throw new Error(`Missing quizzes for vocabulary words: ${missingVocabulary.join(', ')}`);
      }
      
      if (missingGrammar.length > 0) {
        throw new Error(`Missing quizzes for grammar patterns: ${missingGrammar.join(', ')}`);
      }

      return {
        title: story.title.jp,
        content_jp: story.content_jp,
        content_en: story.content_en,
        vocabulary: story.vocabulary,
        grammar: story.grammar,
        quizzes: story.quizzes,
      };
    } catch (error) {
      attempt++;
      if (attempt === maxRetries) {
        console.error('Error parsing OpenAI response:', error);
        throw new Error('Failed to generate valid story after multiple attempts');
      }
      console.log(`Attempt ${attempt} failed, retrying...`);
      // Wait for a short time before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error('Failed to generate valid story after multiple attempts');
} 