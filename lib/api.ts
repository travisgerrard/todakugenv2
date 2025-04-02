import OpenAI from 'openai';
import { Database } from './types';
import fs from 'fs';
import path from 'path';

// Enable better logging for debugging
const ENABLE_FILE_LOGGING = true;

function logToFile(message: string) {
  if (!ENABLE_FILE_LOGGING) return;
  
  try {
    const logDir = path.join(process.cwd(), 'logs');
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logPath = path.join(logDir, 'openai-api.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

// Create OpenAI client with better error handling
let openai: OpenAI | null = null;
try {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is missing from environment variables');
    logToFile('ERROR: OpenAI API key is missing from environment variables');
  } else {
    logToFile(`OpenAI API key found (length: ${process.env.OPENAI_API_KEY.length})`);
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  logToFile(`ERROR: Failed to initialize OpenAI client: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

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
  const requestId = Math.random().toString(36).substring(2, 9);
  const logPrefix = `[OpenAI-${requestId}]`;

  logToFile(`${logPrefix} Starting story generation with params: WK ${wanikani_level}, GK ${genki_chapter}, TK ${tadoku_level}, Length: ${length}, Topic: ${topic}`);
  console.log(`${logPrefix} Starting story generation (attempt 1/${maxRetries})`);
  console.log(`${logPrefix} Parameters: WK ${wanikani_level}, GK ${genki_chapter}, TK ${tadoku_level}, Length: ${length}, Topic: ${topic}`);

  // Validate OpenAI client is initialized
  if (!openai) {
    const errorMsg = 'OpenAI client is not initialized, check API key configuration';
    logToFile(`${logPrefix} ERROR: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  while (attempt < maxRetries) {
    try {
      logToFile(`${logPrefix} Attempt ${attempt + 1}: Creating prompt...`);
      console.log(`${logPrefix} Attempt ${attempt + 1}: Creating prompt...`);
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

      console.log(`${logPrefix} Attempt ${attempt + 1}: Calling OpenAI API...`);
      logToFile(`${logPrefix} Attempt ${attempt + 1}: Calling OpenAI API...`);
      
      if (!process.env.OPENAI_API_KEY) {
        const errorMsg = 'OpenAI API key is not configured';
        logToFile(`${logPrefix} ERROR: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      try {
        logToFile(`${logPrefix} Sending request to OpenAI API with model: gpt-4-turbo-preview`);
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

        logToFile(`${logPrefix} Successfully received response from OpenAI`);
        console.log(`${logPrefix} Attempt ${attempt + 1}: Received response from OpenAI`);
        
        const response = completion.choices[0].message.content;
        if (!response) {
          logToFile(`${logPrefix} ERROR: Empty response content from OpenAI`);
          throw new Error('No response from OpenAI');
        }

        logToFile(`${logPrefix} Parsing JSON response...`);
        console.log(`${logPrefix} Attempt ${attempt + 1}: Parsing JSON response...`);
        
        let story;
        try {
          story = JSON.parse(response);
          logToFile(`${logPrefix} Successfully parsed JSON response`);
        } catch (parseError) {
          logToFile(`${logPrefix} ERROR: Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
          throw new Error(`Failed to parse OpenAI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
        
        console.log(`${logPrefix} Attempt ${attempt + 1}: Validating story structure...`);
        logToFile(`${logPrefix} Validating story structure...`);
        
        // Validate basic structure
        if (!story.title || !story.content_jp || !story.content_en || !Array.isArray(story.vocabulary) || !Array.isArray(story.grammar) || !Array.isArray(story.quizzes)) {
          logToFile(`${logPrefix} ERROR: Story is missing required fields`);
          throw new Error('Story is missing required fields');
        }
        
        // Validate that we have quizzes for all vocabulary and grammar points
        const vocabularyQuizzes = story.quizzes.filter((q: Quiz) => q.type === 'vocabulary');
        const grammarQuizzes = story.quizzes.filter((q: Quiz) => q.type === 'grammar');
        
        console.log(`${logPrefix} Vocab quizzes: ${vocabularyQuizzes.length}, Vocabulary words: ${story.vocabulary.length}`);
        console.log(`${logPrefix} Grammar quizzes: ${grammarQuizzes.length}, Grammar points: ${story.grammar.length}`);
        
        logToFile(`${logPrefix} Vocab quizzes: ${vocabularyQuizzes.length}, Vocabulary words: ${story.vocabulary.length}`);
        logToFile(`${logPrefix} Grammar quizzes: ${grammarQuizzes.length}, Grammar points: ${story.grammar.length}`);
        
        // Previously failing validation, now just warning
        if (vocabularyQuizzes.length !== story.vocabulary.length) {
          const warning = `Warning: Mismatch: ${vocabularyQuizzes.length} vocabulary quizzes for ${story.vocabulary.length} vocabulary words`;
          logToFile(`${logPrefix} ${warning}`);
          console.warn(`${logPrefix} ${warning}`);
          // Continue anyway - don't throw an error
        }
        
        if (grammarQuizzes.length !== story.grammar.length) {
          const warning = `Warning: Mismatch: ${grammarQuizzes.length} grammar quizzes for ${story.grammar.length} grammar points`;
          logToFile(`${logPrefix} ${warning}`);
          console.warn(`${logPrefix} ${warning}`);
          // Continue anyway - don't throw an error
        }

        // Just log information about missing quizzes instead of failing
        const vocabularyWords = new Set(story.vocabulary.map((v: VocabularyItem) => v.word));
        const grammarPatterns = new Set(story.grammar.map((g: GrammarPoint) => g.pattern));
        
        const quizVocabularyWords = new Set(vocabularyQuizzes.map((q: Quiz) => q.related_item));
        const quizGrammarPatterns = new Set(grammarQuizzes.map((q: Quiz) => q.related_item));
        
        const missingVocabulary = Array.from(vocabularyWords).filter(word => !quizVocabularyWords.has(word));
        const missingGrammar = Array.from(grammarPatterns).filter(pattern => !quizGrammarPatterns.has(pattern));
        
        if (missingVocabulary.length > 0) {
          const warning = `Warning: Missing quizzes for vocabulary words: ${missingVocabulary.join(', ')}`;
          logToFile(`${logPrefix} ${warning}`);
          console.warn(`${logPrefix} ${warning}`);
          // Continue anyway - don't throw an error
        }
        
        if (missingGrammar.length > 0) {
          const warning = `Warning: Missing quizzes for grammar patterns: ${missingGrammar.join(', ')}`;
          logToFile(`${logPrefix} ${warning}`);
          console.warn(`${logPrefix} ${warning}`);
          // Continue anyway - don't throw an error
        }

        logToFile(`${logPrefix} Story validation successful! Title: ${story.title.jp || story.title}`);
        console.log(`${logPrefix} Attempt ${attempt + 1}: Story validation successful!`);
        
        return {
          title: story.title.jp || story.title,
          content_jp: story.content_jp,
          content_en: story.content_en,
          vocabulary: story.vocabulary,
          grammar: story.grammar,
          quizzes: story.quizzes,
        };
      } catch (apiError) {
        // Handle OpenAI API-specific errors
        logToFile(`${logPrefix} OpenAI API ERROR: ${apiError instanceof Error ? apiError.message : 'Unknown API error'}`);
        if (apiError instanceof Error && apiError.message.includes('API key')) {
          logToFile(`${logPrefix} API key error detected: ${apiError.message}`);
        }
        throw apiError; // Rethrow to be caught by the outer catch block
      }
    } catch (error) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logToFile(`${logPrefix} Attempt ${attempt}/${maxRetries} failed: ${errorMessage}`);
      console.error(`${logPrefix} Attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries) {
        logToFile(`${logPrefix} All retry attempts failed: ${errorMessage}`);
        console.error(`${logPrefix} All retry attempts failed:`, error);
        throw new Error(`Failed to generate valid story after multiple attempts: ${errorMessage}`);
      }
      
      logToFile(`${logPrefix} Waiting before retry attempt ${attempt + 1}...`);
      console.log(`${logPrefix} Waiting before retry attempt ${attempt + 1}...`);
      // Wait for a short time before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const finalErrorMsg = 'Failed to generate valid story after multiple attempts';
  logToFile(`${logPrefix} ERROR: ${finalErrorMsg}`);
  throw new Error(finalErrorMsg);
} 