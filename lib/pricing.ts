import { PricingTier } from '@/types';

// Define pricing tiers
export const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 10,
    features: [
      '10 free credits monthly',
      'Basic text humanization',
      'Standard processing speed',
      'Email support',
      'Project history (3 days)'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    credits: 500,
    isPopular: true,
    features: [
      '500 credits monthly',
      'Advanced tone customization',
      'Priority processing',
      'Email and chat support',
      'Project history (30 days)',
      'Team sharing (up to 3 users)'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    credits: 3000,
    features: [
      '3,000 credits monthly',
      'Custom API integration',
      'Enterprise-grade security',
      'Dedicated account manager',
      'Unlimited project history',
      'Custom tone development',
      'Unlimited team sharing',
      'SSO & advanced permissions'
    ]
  }
];

// Function to get pricing tier by ID
export function getPricingTierById(id: string): PricingTier | undefined {
  return pricingTiers.find(tier => tier.id === id);
}

// Function to calculate how many characters can be processed with a given number of credits
export function calculateCharactersPerCredit(credits: number): number {
  // Assuming 1 credit = 100 characters
  return credits * 100;
}

// Function to estimate monthly usage based on tier
export function estimateMonthlyUsage(tierId: string): string {
  const tier = getPricingTierById(tierId);
  if (!tier) return '0 characters';
  
  const characters = calculateCharactersPerCredit(tier.credits);
  
  if (characters >= 1000000) {
    return `${(characters / 1000000).toFixed(1)}M characters`;
  } else if (characters >= 1000) {
    return `${(characters / 1000).toFixed(1)}K characters`;
  }
  
  return `${characters} characters`;
}