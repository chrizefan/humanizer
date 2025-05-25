// Project Types
export interface Project {
  id: string;
  title: string;
  input_text: string;
  output_text: string;
  created_at: string;
  updated_at: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  credits_remaining: number;
  subscription_tier: 'free' | 'pro' | 'enterprise';
}

// Pricing Tiers
export interface PricingTier {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  features: string[];
  credits: number;
  isPopular?: boolean;
}

// API Response Types
export interface HumanizeResponse {
  success: boolean;
  output?: string;
  error?: string;
  creditsUsed?: number;
}

// Form Types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AuthFormData {
  email: string;
  password: string;
}

export interface PaymentFormData {
  name: string;
  email: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  plan: 'free' | 'pro' | 'enterprise';
}

// API Request Types
export interface HumanizeRequest {
  text: string;
  tone?: 'professional' | 'casual' | 'friendly';
  length?: 'short' | 'medium' | 'long';
  readability?: 'High School' | 'University' | 'Doctorate' | 'Journalist' | 'Marketing';
  purpose?: 'General Writing' | 'Essay' | 'Article' | 'Marketing Material' | 'Story' | 'Cover Letter' | 'Report' | 'Business Material' | 'Legal Material';
  strength?: 'Quality' | 'Balanced' | 'More Human';
}

// Undetectable AI API Types
export interface UndetectableSubmitRequest {
  content: string;
  readability: string;
  purpose: string;
  strength?: string;
  model?: string;
}

export interface UndetectableSubmitResponse {
  status: string;
  id: string;
}

export interface UndetectableDocumentResponse {
  id: string;
  output?: string;
  input: string;
  readability: string;
  purpose: string;
  status?: string;
  createdDate: string;
}

export interface UndetectableCreditsResponse {
  baseCredits: number;
  boostCredits: number;
  credits: number;
}