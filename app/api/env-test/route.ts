import { NextRequest, NextResponse } from 'next/server';
import { testEnvironmentVariables, getUndetectableCredentials } from '../../../lib/env-test';

export async function GET(request: NextRequest) {
  console.log('=== Environment Test API Route ===');
  
  try {
    // Test all environment variables
    const envVars = testEnvironmentVariables();
    
    // Test Undetectable AI credentials specifically
    const credentials = getUndetectableCredentials();
    
    // Return sanitized results (don't expose sensitive data in response)
    const sanitizedEnvVars = Object.entries(envVars).reduce((acc, [key, value]) => {
      if (key.includes('KEY') || key.includes('SECRET')) {
        acc[key] = value ? `${value.substring(0, 8)}...` : null;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string | null>);
    
    return NextResponse.json({
      success: true,
      envVars: sanitizedEnvVars,
      credentials: {
        userId: credentials.userId ? `${credentials.userId.substring(0, 8)}...` : null,
        apiKey: credentials.apiKey ? `${credentials.apiKey.substring(0, 8)}...` : null,
        hasUserId: !!credentials.userId,
        hasApiKey: !!credentials.apiKey,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
