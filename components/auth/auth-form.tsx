"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useToast } from "@/hooks/use-toast";

// Schema for sign in
const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Schema for sign up, extending sign in schema
const signUpSchema = signInSchema.extend({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" })
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { signIn, signUp } = useSupabaseAuth();
  
  // Get signup parameter and return URL from query string
  const isSignUp = searchParams?.get("signup") === "true";
  const returnUrl = searchParams?.get("returnUrl") || "/dashboard";
  const plan = searchParams?.get("plan") || null;
  
  // Initialize forms
  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Handle sign in submission
  const onSignInSubmit = async (values: SignInValues) => {
    setIsLoading(true);
    try {
      const { success, error, isEmailConfirmationError } = await signIn(values.email, values.password);
      
      if (!success) {
        // Special handling for email confirmation errors
        if (isEmailConfirmationError) {
          toast({
            title: "Email not confirmed",
            description: error,
            variant: "destructive",
          });
          
          // In development mode, add an option to bypass email confirmation
          if (process.env.NODE_ENV === 'development') {
            setTimeout(() => {
              toast({
                title: "Development mode",
                description: "Resubmit to bypass email confirmation in development",
              });
            }, 1500);
          }
        } else {
          toast({
            title: "Sign in failed",
            description: error || "Invalid email or password",
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      
      // If plan is specified, redirect to payment
      if (plan) {
        router.push(`/payment?plan=${plan}`);
      } else {
        router.push(returnUrl);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sign up submission
  const onSignUpSubmit = async (values: SignUpValues) => {
    setIsLoading(true);
    try {
      const { success, error, emailConfirmationRequired, message } = await signUp(values.email, values.password);
      
      if (!success) {
        toast({
          title: "Sign up failed",
          description: error || "Unable to create account",
          variant: "destructive",
        });
        return;
      }
      
      if (emailConfirmationRequired) {
        toast({
          title: "Check your email",
          description: message || "Please check your email for a confirmation link.",
        });
        return;
      }
      
      // If we reach here, signup was successful and email was auto-confirmed (development mode)
      toast({
        title: "Account created successfully",
        description: message || "You can now sign in to your account.",
      });
      
      // In development mode, automatically sign in
      if (process.env.NODE_ENV === 'development') {
        setTimeout(async () => {
          const { success: signInSuccess } = await signIn(values.email, values.password);
          if (signInSuccess) {
            toast({
              title: "Signed in successfully",
              description: "Welcome to AI Humanizer!",
            });
            
            if (plan) {
              router.push(`/payment?plan=${plan}`);
            } else {
              router.push(returnUrl);
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center w-full">
      <Card className="w-full max-w-md mx-auto shadow-lg h-fit">
        <Tabs defaultValue={isSignUp ? "signup" : "signin"}>
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Welcome to AI Humanizer</CardTitle>
            <CardDescription className="text-center text-base">
              Sign in to your account or create a new one
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="text-base">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-base">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="px-6">
            <TabsContent value="signin">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-5">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-[#4A90E2] hover:bg-[#3A80D2]" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-5">
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => {
                      // Calculate password strength
                      const getPasswordStrength = (password: string) => {
                        if (!password) return 0;
                        let strength = 0;
                        if (password.length >= 8) strength += 1;
                        if (/[A-Z]/.test(password)) strength += 1;
                        if (/[a-z]/.test(password)) strength += 1;
                        if (/[0-9]/.test(password)) strength += 1;
                        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
                        return strength;
                      };
                      
                      const strength = getPasswordStrength(field.value);
                      const strengthText = ["None", "Weak", "Fair", "Good", "Strong", "Excellent"][strength];
                      const strengthColors = ["bg-transparent", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-400", "bg-green-600"];
                      
                      return (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          {field.value && (
                            <div className="mt-1">
                              <div className="flex justify-between items-center">
                                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                  {[0, 1, 2, 3, 4].map((index) => (
                                    <div 
                                      key={index}
                                      className={`h-full flex-1 ${index < strength ? strengthColors[strength] : 'bg-transparent'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs ml-2 font-medium text-gray-600 dark:text-gray-400 min-w-16 text-right">
                                  {strengthText}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Password requirements:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className={`flex items-center ${field.value && field.value.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                <div className={`w-2 h-2 mr-2 rounded-full ${field.value && field.value.length >= 8 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                At least 8 characters
                              </div>
                              <div className={`flex items-center ${field.value && /[A-Z]/.test(field.value) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                <div className={`w-2 h-2 mr-2 rounded-full ${field.value && /[A-Z]/.test(field.value) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                Uppercase letter
                              </div>
                              <div className={`flex items-center ${field.value && /[a-z]/.test(field.value) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                <div className={`w-2 h-2 mr-2 rounded-full ${field.value && /[a-z]/.test(field.value) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                Lowercase letter
                              </div>
                              <div className={`flex items-center ${field.value && /[0-9]/.test(field.value) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                <div className={`w-2 h-2 mr-2 rounded-full ${field.value && /[0-9]/.test(field.value) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                Number (0-9)
                              </div>
                              <div className={`flex items-center ${field.value && /[^A-Za-z0-9]/.test(field.value) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                <div className={`w-2 h-2 mr-2 rounded-full ${field.value && /[^A-Za-z0-9]/.test(field.value) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                Special character
                              </div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <Button type="submit" className="w-full bg-[#4A90E2] hover:bg-[#3A80D2]" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </CardContent>
          
          <CardFooter className="text-sm text-center text-gray-500 px-6 pt-4 pb-6">
            <p className="max-w-[280px] mx-auto">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-[#4A90E2] hover:underline font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-[#4A90E2] hover:underline font-medium">
                Privacy Policy
              </a>
              .
            </p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}