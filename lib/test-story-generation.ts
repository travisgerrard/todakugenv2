import { generateStory } from './api';

async function testStoryGeneration() {
  try {
    console.log('Testing story generation...');
    
    const story = await generateStory({
      wanikani_level: 5,
      genki_chapter: 1,
      tadoku_level: 0,
      length: 'short',
      topic: 'daily life'
    });

    console.log('Generated Story:');
    console.log('Title:', story.title);
    console.log('\nJapanese Content:');
    console.log(story.content_jp);
    console.log('\nEnglish Content:');
    console.log(story.content_en);
    console.log('\nVocabulary:');
    console.log(story.vocabulary);
    console.log('\nGrammar Points:');
    console.log(story.grammar);

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testStoryGeneration();
} 