import { Metadata } from "next";
import PricingCards from "@/components/pricing/pricing-cards";

export const metadata: Metadata = {
  title: "Pricing - AI Humanizer",
  description: "Affordable plans for transforming AI text into human-like content.",
};

export default function PricingPage() {
  return (
    <div className="container py-16 md:py-32 max-w-7xl mx-auto px-4 md:px-8">
      <div className="flex flex-col items-center text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-3xl">
          Choose the plan that works for you. All plans include access to our full suite of humanization features.
        </p>
      </div>
      
      <PricingCards />
      
      <div className="mt-24 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-4">What are credits?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Credits are our billing units. One credit allows you to humanize approximately 100 characters of text. Credits are consumed when you use the humanization tool.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-4">Do credits roll over?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Credits reset at the beginning of each billing cycle. Unused credits do not roll over to the next period. The Free plan receives 10 credits per month.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-4">Can I upgrade or downgrade my plan?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated difference for the remainder of the billing cycle. When downgrading, the new plan will take effect at the start of the next billing cycle.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-4">Is there a refund policy?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We offer a 7-day money-back guarantee for new subscriptions. If you're not satisfied with our service, contact our support team within 7 days of your purchase for a full refund.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal for subscription payments. Enterprise customers can request invoice payment options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}