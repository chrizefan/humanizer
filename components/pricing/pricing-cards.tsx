"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { pricingTiers, estimateMonthlyUsage } from "@/lib/pricing";
import { useToast } from "@/hooks/use-toast";
import { getUser } from "@/lib/supabase";

export default function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const router = useRouter();
  const { toast } = useToast();
  
  // Calculate yearly prices (20% discount)
  const yearlyDiscount = 0.2;
  const getYearlyPrice = (monthlyPrice: number) => {
    const yearlyTotal = monthlyPrice * 12;
    const discountAmount = yearlyTotal * yearlyDiscount;
    return (yearlyTotal - discountAmount) / 12;
  };

  const handleSelectPlan = async (tierId: string) => {
    try {
      const user = await getUser();
      
      if (!user) {
        // If not logged in, redirect to auth with return URL
        router.push(`/auth?returnUrl=/payment&plan=${tierId}`);
        return;
      }
      
      // If logged in, go directly to payment
      router.push(`/payment?plan=${tierId}&cycle=${billingCycle}`);
    } catch (error) {
      console.error("Error checking authentication:", error);
      toast({
        title: "Authentication Error",
        description: "Please try again or log in manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto mb-10 flex w-full max-w-md flex-col items-center space-y-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Pricing Plans</h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Choose the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </div>
        
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly" onClick={() => setBillingCycle("monthly")}>
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" onClick={() => setBillingCycle("yearly")}>
              Yearly <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">Save 20%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier) => {
          const price = billingCycle === "yearly" 
            ? getYearlyPrice(tier.price) 
            : tier.price;
            
          return (
            <Card 
              key={tier.id} 
              className={tier.isPopular 
                ? "border-[#4A90E2] relative shadow-lg" 
                : "border-gray-200 dark:border-gray-800"
              }
            >
              {tier.isPopular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-[#4A90E2]">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>
                  {tier.credits} credits per month
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${price.toFixed(2)}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/ month</span>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Approximately {estimateMonthlyUsage(tier.id)} of humanized text per month
                </p>
                
                <ul className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={tier.isPopular 
                    ? "w-full bg-[#4A90E2] hover:bg-[#3A80D2]" 
                    : "w-full"
                  }
                  variant={tier.isPopular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(tier.id)}
                >
                  {tier.id === 'free' ? 'Get Started' : 'Subscribe'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}