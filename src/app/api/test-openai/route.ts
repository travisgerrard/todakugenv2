import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

function logToFile(message: string) {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logPath = path.join(logDir, 'openai-test.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('Testing OpenAI API connection...');
  logToFile('Testing OpenAI API connection...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is missing');
    logToFile('ERROR: OpenAI API key is missing');
    return NextResponse.json({ success: false, error: 'API Key is missing' }, { status: 500 });
  }
  
  console.log('API Key exists, testing connection...');
  logToFile(`API Key exists (length: ${process.env.OPENAI_API_KEY.length}), testing connection...`);
  
  try {
    console.log('Sending test request to OpenAI...');
    logToFile('Sending test request to OpenAI...');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Hello!"
        }
      ],
      max_tokens: 5,
    });
    
    console.log('OpenAI API response:', completion);
    logToFile(`OpenAI API response: ${JSON.stringify(completion)}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'OpenAI API is working', 
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error testing OpenAI API:', error);
    logToFile(`ERROR testing OpenAI API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 