"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pricingTiers, getPricingTierById } from "@/lib/pricing";
import { PricingTier } from "@/types";

// Schema for payment form
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  cardNumber: z.string()
    .min(16, { message: "Card number must be 16 digits" })
    .max(16, { message: "Card number must be 16 digits" })
    .regex(/^\d{16}$/, { message: "Card number must contain only digits" }),
  expiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Expiry must be in MM/YY format" }),
  cvc: z.string()
    .min(3, { message: "CVC must be 3 digits" })
    .max(4, { message: "CVC must be 3-4 digits" })
    .regex(/^\d{3,4}$/, { message: "CVC must contain only digits" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaymentForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingTier | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // Get plan and cycle from query parameters
  useEffect(() => {
    const planId = searchParams?.get("plan") || "free";
    const cycle = searchParams?.get("cycle") || "monthly";
    
    const plan = getPricingTierById(planId);
    if (plan) {
      setSelectedPlan(plan);
    } else {
      // Default to free plan if invalid plan ID
      setSelectedPlan(pricingTiers[0]);
    }
    
    setBillingCycle(cycle === "yearly" ? "yearly" : "monthly");
  }, [searchParams]);
  
  // Calculate price based on billing cycle
  const calculatePrice = () => {
    if (!selectedPlan) return 0;
    
    const monthlyPrice = selectedPlan.price;
    
    if (billingCycle === "yearly") {
      // 20% discount for yearly billing
      const yearlyTotal = monthlyPrice * 12;
      const discountAmount = yearlyTotal * 0.2;
      return (yearlyTotal - discountAmount) / 12;
    }
    
    return monthlyPrice;
  };
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  });
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "") // Remove existing spaces
      .replace(/\D/g, "") // Remove non-digits
      .slice(0, 16); // Limit to 16 digits
  };
  
  // Format expiry date (MM/YY)
  const formatExpiry = (value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 4);
    
    if (cleanValue.length > 2) {
      return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
    }
    
    return cleanValue;
  };
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!selectedPlan) {
      toast({
        title: "No plan selected",
        description: "Please select a subscription plan.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real app, you would send payment details to a payment processor
      // For demo purposes, we'll simulate a successful payment after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set payment as complete
      setIsComplete(true);
      
      toast({
        title: "Payment successful",
        description: `You have successfully subscribed to the ${selectedPlan.name} plan.`,
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // If no plan is selected yet, show loading state
  if (!selectedPlan) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#4A90E2]" />
        </CardContent>
      </Card>
    );
  }
  
  // If payment is complete, show success state
  if (isComplete) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-center text-gray-500 mb-6">
            Thank you for subscribing to the {selectedPlan.name} plan.
          </p>
          <Button 
            onClick={() => router.push("/dashboard")}
            className="bg-[#4A90E2] hover:bg-[#3A80D2]"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Regular payment form
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Complete Your Purchase</CardTitle>
        <CardDescription>
          Subscribe to the {selectedPlan.name} plan
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{selectedPlan.name} Plan</span>
            <span className="font-bold">${calculatePrice().toFixed(2)}/mo</span>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            Billed {billingCycle === "yearly" ? "yearly" : "monthly"}
            {billingCycle === "yearly" && " (20% discount)"}
          </div>
          <div className="text-sm">
            <strong>{selectedPlan.credits}</strong> credits per month
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="4242 4242 4242 4242" 
                        {...field} 
                        onChange={(e) => onChange(formatCardNumber(e.target.value))}
                        maxLength={16}
                      />
                      <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiry"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MM/YY" 
                        {...field} 
                        onChange={(e) => onChange(formatExpiry(e.target.value))}
                        maxLength={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cvc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVC</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123" 
                        {...field} 
                        maxLength={4}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-[#4A90E2] hover:bg-[#3A80D2]"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ${calculatePrice().toFixed(2)}/month
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="text-xs text-center text-gray-500">
        Your payment is processed securely. We don't store your card details.
      </CardFooter>
    </Card>
  );
}