'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { SparklesIcon } from "lucide-react";

interface GuestCreditsExhaustedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestCreditsExhaustedDialog({
  open,
  onOpenChange,
}: GuestCreditsExhaustedDialogProps) {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/auth?mode=signup');
  };

  const handleLogIn = () => {
    router.push('/auth?mode=login');
  };

  const handleViewPricing = () => {
    router.push('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <SparklesIcon className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">Free Trial Completed</DialogTitle>
          <DialogDescription className="text-center">
            You've used all your free guest credits. Sign up or log in to continue using AI Humanizer.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <h4 className="font-medium text-sm text-blue-800 dark:text-blue-300">Create an account to:</h4>
          <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-400 list-disc pl-5">
            <li>Get more credits and humanize more text</li>
            <li>Save and manage your humanized projects</li>
            <li>Access premium features and customization options</li>
            <li>Explore subscription plans for your needs</li>
          </ul>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            onClick={handleViewPricing}
            className="w-full sm:w-auto"
          >
            View Pricing
          </Button>
          <Button 
            variant="outline"
            onClick={handleLogIn}
            className="w-full sm:w-auto"
          >
            Log In
          </Button>
          <Button 
            onClick={handleSignUp}
            className="w-full sm:w-auto bg-[#4A90E2] hover:bg-[#3A80D2]"
          >
            Sign Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
