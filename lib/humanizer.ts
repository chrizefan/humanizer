import { HumanizeRequest, HumanizeResponse } from '@/types';

// Humanizer API configuration
export const humanizerConfig = {
  apiKey: process.env.NEXT_PUBLIC_HUMANIZER_API_KEY || 'mock-key',
  endpoint: process.env.NEXT_PUBLIC_HUMANIZER_API_ENDPOINT || 'https://api.example.com/humanize',
  maxTokens: 1500,
  temperature: 0.7,
};

// For demo purposes, we'll simulate the API call
export async function humanizeText(
  params: HumanizeRequest
): Promise<HumanizeResponse> {
  // In a real application, you would call the actual API
  // const response = await fetch(humanizerConfig.endpoint, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${humanizerConfig.apiKey}`
  //   },
  //   body: JSON.stringify({
  //     text: params.text,
  //     tone: params.tone || 'professional',
  //     length: params.length || 'medium',
  //     max_tokens: humanizerConfig.maxTokens,
  //     temperature: humanizerConfig.temperature
  //   })
  // });
  
  // Simulated API response
  return new Promise((resolve) => {
    // Add artificial delay to simulate network request
    setTimeout(() => {
      // Check if text is provided
      if (!params.text || params.text.trim() === '') {
        resolve({
          success: false,
          error: 'No text provided for humanization'
        });
        return;
      }
      
      // Calculate credits used based on text length
      const creditsUsed = Math.max(1, Math.ceil(params.text.length / 100));
      
      // Simulate different tones
      let humanizedText = params.text;
      
      // Simple transformations based on tone
      switch(params.tone) {
        case 'professional':
          humanizedText = makeTextProfessional(params.text);
          break;
        case 'casual':
          humanizedText = makeTextCasual(params.text);
          break;
        case 'friendly':
          humanizedText = makeTextFriendly(params.text);
          break;
        default:
          humanizedText = makeTextProfessional(params.text);
      }
      
      resolve({
        success: true,
        output: humanizedText,
        creditsUsed
      });
    }, 1500);
  });
}

// Helper functions to simulate different tones
function makeTextProfessional(text: string): string {
  // Replace casual phrases with more professional ones
  const casualPhrases = [
    { from: /\bkinda\b/gi, to: 'somewhat' },
    { from: /\bgonna\b/gi, to: 'going to' },
    { from: /\bwanna\b/gi, to: 'want to' },
    { from: /\byeah\b/gi, to: 'yes' },
    { from: /\bnope\b/gi, to: 'no' },
    { from: /\bawesome\b/gi, to: 'excellent' },
    { from: /\bcool\b/gi, to: 'satisfactory' },
    { from: /\btotally\b/gi, to: 'completely' },
    { from: /\bstuff\b/gi, to: 'items' },
    { from: /\bthings\b/gi, to: 'matters' },
  ];
  
  let result = text;
  casualPhrases.forEach(phrase => {
    result = result.replace(phrase.from, phrase.to);
  });
  
  // Add some professional flair
  const sentences = result.split(/(?<=[.!?])\s+/);
  const enhancedSentences = sentences.map(sentence => {
    // Randomly add professional phrases to some sentences
    if (Math.random() > 0.7) {
      const professionalPhrases = [
        'As per our discussion, ',
        'Based on the analysis, ',
        'In accordance with best practices, ',
        'From a strategic perspective, ',
        'Taking into account all variables, '
      ];
      const randomPhrase = professionalPhrases[Math.floor(Math.random() * professionalPhrases.length)];
      return randomPhrase + sentence.charAt(0).toLowerCase() + sentence.slice(1);
    }
    return sentence;
  });
  
  return enhancedSentences.join(' ');
}

function makeTextCasual(text: string): string {
  // Replace formal phrases with more casual ones
  const formalPhrases = [
    { from: /\brequest\b/gi, to: 'ask' },
    { from: /\butilize\b/gi, to: 'use' },
    { from: /\bobtain\b/gi, to: 'get' },
    { from: /\brequire\b/gi, to: 'need' },
    { from: /\bpurchase\b/gi, to: 'buy' },
    { from: /\bconsume\b/gi, to: 'use' },
    { from: /\bcommence\b/gi, to: 'start' },
    { from: /\bterminate\b/gi, to: 'end' },
    { from: /\bapproximately\b/gi, to: 'about' },
    { from: /\bindividual\b/gi, to: 'person' },
  ];
  
  let result = text;
  formalPhrases.forEach(phrase => {
    result = result.replace(phrase.from, phrase.to);
  });
  
  // Add some casual flair
  const sentences = result.split(/(?<=[.!?])\s+/);
  const enhancedSentences = sentences.map(sentence => {
    // Randomly add casual phrases to some sentences
    if (Math.random() > 0.7) {
      const casualPhrases = [
        'So, ',
        'Anyway, ',
        'Basically, ',
        'To be honest, ',
        'I mean, '
      ];
      const randomPhrase = casualPhrases[Math.floor(Math.random() * casualPhrases.length)];
      return randomPhrase + sentence.charAt(0).toLowerCase() + sentence.slice(1);
    }
    return sentence;
  });
  
  return enhancedSentences.join(' ');
}

function makeTextFriendly(text: string): string {
  // Replace neutral phrases with more friendly ones
  const neutralPhrases = [
    { from: /\bconsider\b/gi, to: 'think about' },
    { from: /\bbelieve\b/gi, to: 'feel like' },
    { from: /\bunfortunately\b/gi, to: 'sadly' },
    { from: /\bperhaps\b/gi, to: 'maybe' },
    { from: /\bdiscuss\b/gi, to: 'chat about' },
    { from: /\bmeeting\b/gi, to: 'get-together' },
    { from: /\bcolleague\b/gi, to: 'teammate' },
    { from: /\bcustomer\b/gi, to: 'friend' },
    { from: /\bprovide\b/gi, to: 'share' },
    { from: /\bassist\b/gi, to: 'help out' },
  ];
  
  let result = text;
  neutralPhrases.forEach(phrase => {
    result = result.replace(phrase.from, phrase.to);
  });
  
  // Add some friendly flair
  const sentences = result.split(/(?<=[.!?])\s+/);
  const enhancedSentences = sentences.map(sentence => {
    // Randomly add friendly phrases to some sentences
    if (Math.random() > 0.7) {
      const friendlyPhrases = [
        'Hey, ',
        'You know what? ',
        'I\'m excited to say that ',
        'Just between us, ',
        'Guess what? '
      ];
      const randomPhrase = friendlyPhrases[Math.floor(Math.random() * friendlyPhrases.length)];
      return randomPhrase + sentence.charAt(0).toLowerCase() + sentence.slice(1);
    }
    return sentence;
  });
  
  return enhancedSentences.join(' ');
}