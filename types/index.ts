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
}