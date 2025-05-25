"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Copy, Check, Save, Trash, Clipboard } from "lucide-react";
import { motion } from "framer-motion";
import { humanizeText } from "@/lib/humanizer";
import { updateUserCredits, saveProject, logUsage } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/use-credits";
import { useGuestCredits } from "@/hooks/use-guest-credits";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { HumanizeRequest } from "@/types";
import { cn } from "@/lib/utils";
import styles from "./text-editor.module.css";
import { SaveProjectDialog } from "./save-project-dialog";
import { GuestCreditsExhaustedDialog } from "./guest-credits-exhausted-dialog";
import { useProjectListRefresh } from "@/hooks/use-project-list-refresh";

interface TextEditorProps {
  initialInput?: string;
  initialOutput?: string;
  title?: string;
}

export default function TextEditor({ initialInput = "", initialOutput = "", title = "Untitled Project" }: TextEditorProps) {
  const [inputText, setInputText] = useState(initialInput);
  const [outputText, setOutputText] = useState(initialOutput);
  const [tone, setTone] = useState<"professional" | "casual" | "friendly">("professional");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [inputHeight, setInputHeight] = useState(400);
  const [outputHeight, setOutputHeight] = useState(400);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isCreditsExhaustedDialogOpen, setCreditsExhaustedDialogOpen] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  // Try to get the refresh function, but don't require it
  let triggerRefresh: (() => void) | undefined;
  try {
    const { triggerRefresh: refresh } = useProjectListRefresh();
    triggerRefresh = refresh;
  } catch (error) {
    // Hook not available - probably not in dashboard context
    triggerRefresh = undefined;
  }
  
  // Use the credits hook for authenticated users and guest credits for unauthenticated users
  const { user } = useSupabaseAuth();
  const { credits: userCredits, fetchCredits } = useCredits();
  const { guestCredits, useGuestCredit, hasGuestCredits } = useGuestCredits();
  
  // Calculate dynamic heights based on content
  const calculateHeight = (text: string) => {
    const lines = text.split('\n').length;
    const minHeight = 400; // Increased from 200 for better prominence
    const maxHeight = typeof window !== 'undefined' ? window.innerHeight - 300 : 600;
    const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, lines * 24 + 48));
    return calculatedHeight;
  };
  
  // Update heights when text changes
  useEffect(() => {
    const newHeight = calculateHeight(inputText);
    setInputHeight(newHeight);
    if (inputRef.current) {
      inputRef.current.style.height = `${newHeight}px`;
    }
  }, [inputText]);
  
  useEffect(() => {
    const newHeight = calculateHeight(outputText);
    setOutputHeight(newHeight);
    if (outputRef.current) {
      outputRef.current.style.height = `${newHeight}px`;
    }
  }, [outputText]);
  
  // Fetch user credits on component mount
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);
   // Handle humanize button click
  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No text to humanize",
        description: "Please enter some text to humanize.",
        variant: "destructive",
      });
      return;
    }
    
    // Check credits based on authentication status
    if (user) {
      // Authenticated user - check user credits
      if (userCredits === null || userCredits <= 0) {
        toast({
          title: "Insufficient credits",
          description: "You don't have enough credits to humanize text. Please upgrade your plan.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Guest user - check guest credits
      if (!hasGuestCredits) {
        setCreditsExhaustedDialogOpen(true);
        return;
      }
    }
    
    setIsHumanizing(true);
    
    try {
      const params: HumanizeRequest = {
        text: inputText,
        tone,
        length,
      };
      
      const response = await humanizeText(params);
      
      if (response.success && response.output) {
        setOutputText(response.output);
        
        if (user) {
          // Authenticated user - update user credits
          if (response.creditsUsed && userCredits !== null) {
            const newCreditAmount = Math.max(0, userCredits - response.creditsUsed);
            await updateUserCredits(newCreditAmount);
            // Refresh credits from the API
            await fetchCredits();
            
            toast({
              title: "Text humanized successfully",
              description: `Used ${response.creditsUsed} credits. Remaining: ${newCreditAmount} credits.`,
            });
          }
        } else {
          // Guest user - use guest credit
          useGuestCredit();
          
          toast({
            title: "Text humanized successfully",
            description: "Try our premium features! Sign up now for unlimited access.",
            action: !hasGuestCredits ? (
              <Button 
                size="sm" 
                onClick={() => setCreditsExhaustedDialogOpen(true)}
              >
                Learn More
              </Button>
            ) : undefined,
          });
        }
      } else {
        toast({
          title: "Humanization failed",
          description: response.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during humanization:", error);
      toast({
        title: "Humanization failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsHumanizing(false);
    }
  };
  
  // Handle copy button click
  const handleCopy = () => {
    if (!outputText) return;
    
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
    
    toast({
      title: "Copied to clipboard",
      description: "The humanized text has been copied to your clipboard.",
    });
  };
  
  // Handle save button click
  const handleSave = async () => {
    if (!inputText || !outputText) {
      toast({
        title: "Nothing to save",
        description: "Please humanize some text first before saving.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaveDialogOpen(true);
  };

  // Handle saving with project name from dialog
  const handleSaveWithName = async (projectName: string) => {
    setIsSaving(true);
    
    try {
      console.log('TextEditor - Starting save with name:', projectName);
      console.log('TextEditor - Current user context:', { 
        userCredits, 
        hasRefreshFunction: !!triggerRefresh 
      });
      
      const { success, projectId } = await saveProject(
        projectName,
        inputText,
        outputText
      );
      
      console.log('TextEditor - Save result:', { success, projectId });
      
      if (success && projectId) {
        // Log usage for the saved project
        await logUsage(projectId, inputText.length > 100 ? Math.ceil(inputText.length / 100) : 1);
        
        toast({
          title: "Project saved",
          description: "Your project has been saved successfully.",
        });
        
        setIsSaveDialogOpen(false);
        // Trigger refresh of project list if available
        if (triggerRefresh) {
          console.log('TextEditor - Triggering project list refresh after save');
          triggerRefresh();
        } else {
          console.log('TextEditor - triggerRefresh function not available');
        }
      } else {
        toast({
          title: "Save failed",
          description: "Failed to save your project. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Save failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle clear button click
  const handleClear = () => {
    setInputText("");
    setOutputText("");
    
    toast({
      title: "Editor cleared",
      description: "Both input and output have been cleared.",
    });
  };
  
  // Handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      setIsPasting(true);
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        toast({
          title: "Text pasted",
          description: "Text has been pasted from clipboard.",
        });
      } else {
        toast({
          title: "Nothing to paste",
          description: "Clipboard is empty or does not contain text.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      toast({
        title: "Paste failed",
        description: "Failed to read from clipboard. Please check browser permissions.",
        variant: "destructive",
      });
    } finally {
      setIsPasting(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Guest Credit Expiration Banner */}
      {!user && guestCredits === 0 && (
        <div className="col-span-1 lg:col-span-2 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg text-white mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Free Trial Expired</h3>
              <p className="text-white/90">You've used all 3 free credits. Sign up now to continue using AI Humanizer!</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="bg-white text-blue-600 hover:bg-blue-50 border-none"
                onClick={() => window.location.href = '/auth?mode=signup'}
              >
                Sign Up
              </Button>
              <Button 
                variant="ghost"
                className="text-white hover:bg-blue-500 hover:text-white"
                onClick={() => window.location.href = '/auth?mode=login'}
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Input Panel */}
      <motion.div 
        className="flex flex-col"
        initial={{ opacity: 0, x: -20 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          transition: { duration: 0.6, delay: 0.1 }
        }}
      >
        <div className="flex items-center justify-between h-14 flex-shrink-0">
          <Label htmlFor="input-text" className="text-xl font-medium text-gray-700 dark:text-gray-300">AI-Generated Text</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePasteFromClipboard}
            disabled={isPasting || (!user && guestCredits === 0)}
            className="h-10 px-3 rounded-lg text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPasting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Pasting...
              </>
            ) : (
              <>
                <Clipboard className="h-4 w-4 mr-2" />
                Paste
              </>
            )}
          </Button>
        </div>
        <div className="flex-1 min-h-0 mb-4">
          <Textarea
            ref={inputRef}
            id="input-text"
            placeholder={
              !user && guestCredits === 0 
                ? "Guest trial expired. Please sign up or log in to continue..." 
                : "Paste your AI-generated text here..."
            }
            className={cn(
              "w-full resize-none p-6 text-base rounded-xl border-gray-200 dark:border-gray-700 shadow-sm bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-auto",
              styles.dynamicTextarea,
              !user && guestCredits === 0 && "opacity-50 cursor-not-allowed"
            )}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!user && guestCredits === 0}
          />
        </div>
        <div className="flex justify-between items-center flex-shrink-0 h-16">
          <div className="text-sm px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-full text-gray-500 dark:text-gray-300 shadow-sm font-medium">
            {inputText.length} characters
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClear}
              disabled={isHumanizing || !inputText || (!user && guestCredits === 0)}
              className="h-12 px-4 rounded-lg text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash className="h-5 w-5 mr-2" />
              Clear
            </Button>
            <Button 
              onClick={handleHumanize} 
              disabled={isHumanizing || !inputText || (user ? userCredits === 0 : !hasGuestCredits)}
              className="h-12 px-6 text-base rounded-lg font-medium bg-gradient-to-br from-[#4A90E2] via-[#4F7AE0] to-[#5A6ACF] hover:from-[#3A80D2] hover:to-[#4A5ABF] shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isHumanizing ? (
                <>
                  <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                  Humanizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Humanize
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Output Panel */}
      <motion.div 
        className="flex flex-col"
        initial={{ opacity: 0, x: 20 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          transition: { duration: 0.6, delay: 0.1 }
        }}
      >
        <div className="flex items-center justify-between h-14 flex-shrink-0">
          <Label htmlFor="output-text" className="text-xl font-medium text-gray-700 dark:text-gray-300">Humanized Result</Label>
        </div>
        <div className="flex-1 min-h-0 mb-4">
          <div 
            ref={outputRef}
            className={cn(
              "w-full p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-auto text-base shadow-sm",
              styles.dynamicOutput,
              !outputText && "flex items-center justify-center text-gray-400"
            )}
          >
            {outputText ? (
              <div className="whitespace-pre-wrap">{outputText}</div>
            ) : (
              <div className="text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Humanized text will appear here</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center flex-shrink-0 h-16">
          <div className="text-sm px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-full text-gray-500 dark:text-gray-300 shadow-sm font-medium">
            {outputText.length} characters
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              disabled={!outputText || (!user && guestCredits === 0)}
              className="h-12 px-4 rounded-lg text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCopied ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !outputText || (!user && guestCredits === 0)}
              variant="outline"
              size="sm"
              className="h-12 px-4 rounded-lg font-medium bg-gradient-to-br from-[#4A90E2] via-[#4F7AE0] to-[#5A6ACF] hover:from-[#3A80D2] hover:to-[#4A5ABF] text-white border-none shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
      
      <SaveProjectDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveWithName}
        isSaving={isSaving}
      />

      <GuestCreditsExhaustedDialog
        open={isCreditsExhaustedDialogOpen}
        onOpenChange={setCreditsExhaustedDialogOpen}
      />
    </div>
  );
}