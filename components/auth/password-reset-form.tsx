"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function PasswordResetForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useSupabaseAuth();
  const { toast } = useToast();
  
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (values: ResetPasswordValues) => {
    setIsLoading(true);
    try {
      const { success, message, error } = await resetPassword(values.email);
      
      if (!success) {
        toast({
          title: "Reset failed",
          description: error || "Failed to send reset instructions",
          variant: "destructive",
        });
        return;
      }
      
      setIsSubmitted(true);
      toast({
        title: "Reset email sent",
        description: message || "Check your email for password reset instructions",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Reset failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] w-full">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {isSubmitted 
              ? "Check your email for password reset instructions" 
              : "Enter your email to receive password reset instructions"}
          </CardDescription>
        </CardHeader>
        
        {!isSubmitted ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="youremail@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full bg-[#4A90E2] hover:bg-[#3A80D2]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                
                <div className="text-center text-sm">
                  <Link 
                    href="/auth" 
                    className="text-[#4A90E2] hover:underline"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        ) : (
          <CardContent className="space-y-4">
            <div className="bg-green-50 text-green-800 p-4 rounded-md text-sm">
              Reset instructions have been sent to your email. Please check your inbox.
            </div>
            
            <div className="text-center pt-4">
              <Link 
                href="/auth" 
                className="text-[#4A90E2] hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
