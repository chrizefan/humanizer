import { NextRequest, NextResponse } from 'next/server';
import { humanizeText, humanizeTextMock } from '@/lib/humanizer';
import type { HumanizeRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Debug environment variables
    console.log('Environment variables check:', {
      NODE_ENV: process.env.NODE_ENV,
      UNDETECTABLE_USER_ID: process.env.UNDETECTABLE_USER_ID ? 'SET' : 'NOT SET',
      UNDETECTABLE_API_KEY: process.env.UNDETECTABLE_API_KEY ? 'SET' : 'NOT SET',
      USE_MOCK_HUMANIZER: process.env.USE_MOCK_HUMANIZER,
      // Show first few characters for debugging (but not the full keys for security)
      USER_ID_PREFIX: process.env.UNDETECTABLE_USER_ID?.substring(0, 8) + '...',
      API_KEY_PREFIX: process.env.UNDETECTABLE_API_KEY?.substring(0, 8) + '...'
    });

    const body: HumanizeRequest = await request.json();
    
    // Validate request
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Use mock in development if environment variable is set
    const useMock = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_HUMANIZER === 'true';
    
    console.log('Using mock?', useMock);
    
    const result = useMock ? await humanizeTextMock(body) : await humanizeText(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}