import type { HumanizeRequest, HumanizeResponse, UndetectableSubmitRequest, UndetectableSubmitResponse, UndetectableDocumentResponse, UndetectableCreditsResponse } from '@/types';

// Undetectable AI API configuration - CORRECTED URL
const UNDETECTABLE_API_BASE = 'https://humanize.undetectable.ai';

// Get credentials from environment variables
const getUserCredentials = () => {
  console.log('=== Getting Undetectable AI Credentials ===');
  
  // Try server-side first (recommended for API routes)
  let userId = process.env.UNDETECTABLE_USER_ID;
  let apiKey = process.env.UNDETECTABLE_API_KEY;
  
  console.log(`Server-side USER_ID: ${userId ? '✓' : '✗'}`);
  console.log(`Server-side API_KEY: ${apiKey ? '✓' : '✗'}`);
  
  // Fallback to client-side (for debugging or client-side usage)
  if (!userId || !apiKey) {
    console.log('Falling back to NEXT_PUBLIC_ versions...');
    userId = process.env.NEXT_PUBLIC_UNDETECTABLE_USER_ID;
    apiKey = process.env.NEXT_PUBLIC_UNDETECTABLE_API_KEY;
    
    console.log(`Client-side USER_ID: ${userId ? '✓' : '✗'}`);
    console.log(`Client-side API_KEY: ${apiKey ? '✓' : '✗'}`);
  }
  
  console.log('Final credential check:', {
    hasUserId: !!userId,
    hasApiKey: !!apiKey,
    userIdPreview: userId ? `${userId.substring(0, 8)}...` : 'NOT SET',
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET'
  });
  
  if (!userId || !apiKey) {
    console.error('❌ Missing Undetectable AI credentials');
    throw new Error(`Missing Undetectable AI credentials. UserId: ${!!userId}, ApiKey: ${!!apiKey}`);
  }
  
  console.log('✅ Credentials loaded successfully');
  return { userId, apiKey };
};

// Map our options to Undetectable AI's expected values
const mapReadability = (readability?: string): string => {
  const mapping: Record<string, string> = {
    'High School': 'High School',
    'University': 'University',
    'Doctorate': 'Doctorate',
    'Journalist': 'Journalist',
    'Marketing': 'Marketing'
  };
  return mapping[readability || 'University'] || 'University';
};

const mapPurpose = (purpose?: string): string => {
  const mapping: Record<string, string> = {
    'General Writing': 'General Writing',
    'Essay': 'Essay',
    'Article': 'Article',
    'Marketing Material': 'Marketing Material',
    'Story': 'Story',
    'Cover Letter': 'Cover Letter',
    'Report': 'Report',
    'Business Material': 'Business Material',
    'Legal Material': 'Legal Material'
  };
  return mapping[purpose || 'General Writing'] || 'General Writing';
};

const mapStrength = (strength?: string): string => {
  const mapping: Record<string, string> = {
    'Quality': 'Quality',
    'Balanced': 'Balanced',
    'More Human': 'More Human'
  };
  return mapping[strength || 'Balanced'] || 'Balanced';
};

// Check user credits from Undetectable AI
export const checkUserCredits = async (): Promise<UndetectableCreditsResponse> => {
  const { userId, apiKey } = getUserCredentials();
  
  console.log('Checking user credits...');
  
  const response = await fetch(`${UNDETECTABLE_API_BASE}/check-user-credits`, {
    method: 'GET',
    headers: {
      'apikey': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Undetectable AI credits check error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Failed to check credits: ${response.status} - ${errorText}`);
  }

  const creditsData = await response.json();
  console.log('Credits check successful:', creditsData);
  return creditsData;
};

// Submit document to Undetectable AI
export const submitToUndetectable = async (request: HumanizeRequest): Promise<UndetectableSubmitResponse> => {
  const { userId, apiKey } = getUserCredentials();
  
  // Build the request according to the API documentation
  const submitRequest = {
    content: request.text,
    readability: mapReadability(request.readability || 'University'),
    purpose: mapPurpose(request.purpose || 'General Writing'),
    strength: mapStrength(request.strength),
    model: 'v2' // Default model as per documentation
  };

  console.log('Submitting to Undetectable AI:', {
    url: `${UNDETECTABLE_API_BASE}/submit`,
    apiKeyPreview: apiKey.substring(0, 8) + '...',
    contentLength: request.text.length,
    request: {
      ...submitRequest,
      content: `${request.text.substring(0, 50)}...` // Only show first 50 chars in logs
    }
  });

  const response = await fetch(`${UNDETECTABLE_API_BASE}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey, // Corrected header name
    },
    body: JSON.stringify(submitRequest), // Don't include userId in body according to docs
  });

  const responseText = await response.text();
  console.log('API Response:', {
    status: response.status,
    statusText: response.statusText,
    body: responseText
  });

  if (!response.ok) {
    console.error('Undetectable AI API error:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });
    throw new Error(`Undetectable AI API error: ${response.status} - ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse response as JSON:', responseText);
    throw new Error('Invalid JSON response from API');
  }
};

// Get document status and result from Undetectable AI
export const getUndetectableDocument = async (documentId: string): Promise<UndetectableDocumentResponse> => {
  const { userId, apiKey } = getUserCredentials();
  
  const response = await fetch(`${UNDETECTABLE_API_BASE}/document`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey, // Corrected header name
    },
    body: JSON.stringify({
      id: documentId // Only include id as per documentation
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Undetectable AI API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Undetectable AI API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Poll for document completion with exponential backoff
export const pollForCompletion = async (
  documentId: string, 
  maxAttempts: number = 30,
  initialDelay: number = 5000 // Start with 5 seconds as recommended in docs
): Promise<UndetectableDocumentResponse> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`Polling attempt ${attempt + 1}/${maxAttempts} for document ${documentId}`);
    
    const document = await getUndetectableDocument(documentId);
    
    // Check if document is complete (has output)
    if (document.output) {
      console.log('Document processing completed successfully');
      return document;
    }
    
    // If status indicates failure, throw error
    if (document.status === 'failed' || document.status === 'error') {
      throw new Error('Document processing failed');
    }
    
    // Wait before next attempt - use 5-10 seconds as recommended
    const delay = Math.min(5000 + (attempt * 2000), 10000); // 5s, 7s, 9s, then 10s max
    console.log(`Document not ready yet, waiting ${delay}ms before next check...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error('Document processing timed out');
};

// Main humanize function that orchestrates the process
export const humanizeText = async (request: HumanizeRequest): Promise<HumanizeResponse> => {
  try {
    // Validate input according to API requirements
    if (!request.text || request.text.trim().length === 0) {
      return {
        success: false,
        error: 'Input text is required'
      };
    }

    // Check minimum length requirement (50 characters)
    if (request.text.length < 50) {
      return {
        success: false,
        error: 'Input text must be at least 50 characters long'
      };
    }

    // Check maximum length requirement (15,000 characters)
    if (request.text.length > 15000) {
      return {
        success: false,
        error: 'Input text is too long (maximum 15,000 characters)'
      };
    }

    console.log(`Processing text with ${request.text.length} characters`);

    // Check user credits before processing
    try {
      const creditsInfo = await checkUserCredits();
      if (creditsInfo.credits <= 0) {
        return {
          success: false,
          error: 'Insufficient credits. Please purchase more credits to continue.'
        };
      }
      console.log(`Credits available: ${creditsInfo.credits} (base: ${creditsInfo.baseCredits}, boost: ${creditsInfo.boostCredits})`);
    } catch (error) {
      console.warn('Could not check credits, proceeding with submission:', error);
      // Continue with submission - let the API handle insufficient credits
    }

    // Submit document to Undetectable AI
    const submitResponse = await submitToUndetectable(request);
    
    if (!submitResponse.id) {
      return {
        success: false,
        error: 'Failed to submit document for processing'
      };
    }

    console.log(`Document submitted successfully with ID: ${submitResponse.id}`);

    // Poll for completion
    const completedDocument = await pollForCompletion(submitResponse.id);
    
    if (!completedDocument.output) {
      return {
        success: false,
        error: 'Processing completed but no output was generated'
      };
    }

    return {
      success: true,
      output: completedDocument.output,
      creditsUsed: 1 // Assuming 1 credit per request, adjust as needed
    };
  } catch (error) {
    console.error('Humanization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

// For development/testing - keep the mock function
export const humanizeTextMock = async (request: HumanizeRequest): Promise<HumanizeResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockOutput = `This is a humanized version of your text. The original content has been transformed to appear more natural and human-like while maintaining the core message and meaning. 

Your settings:
- Readability: ${request.readability || 'University'}
- Purpose: ${request.purpose || 'General Writing'}
- Strength: ${request.strength || 'Balanced'}

Original text length: ${request.text.length} characters
Humanized text length: ${request.text.length + 50} characters

This mock response demonstrates how the actual API would return humanized content based on your input parameters.`;

  return {
    success: true,
    output: mockOutput,
    creditsUsed: 1
  };
};
