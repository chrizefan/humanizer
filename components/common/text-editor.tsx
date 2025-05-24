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
import { getUserCredits, updateUserCredits, saveProject, logUsage } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { HumanizeRequest } from "@/types";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  initialInput?: string;
  initialOutput?: string;
  title?: string;
}

export default function TextEditor({ initialInput = "", initialOutput = "", title = "Untitled Project" }: TextEditorProps) {
  const [inputText, setInputText] = useState(initialInput);
  const [outputText, setOutputText] = useState(initialOutput);
  const [projectTitle, setProjectTitle] = useState(title);
  const [tone, setTone] = useState<"professional" | "casual" | "friendly">("professional");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Fetch user credits on component mount
  useEffect(() => {
    const fetchCredits = async () => {
      const credits = await getUserCredits();
      setUserCredits(credits);
    };
    
    fetchCredits();
  }, []);
  
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
    
    if (userCredits === null || userCredits <= 0) {
      toast({
        title: "Insufficient credits",
        description: "You don't have enough credits to humanize text. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
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
        
        // Update user credits
        if (response.creditsUsed && userCredits !== null) {
          const newCreditAmount = Math.max(0, userCredits - response.creditsUsed);
          await updateUserCredits(newCreditAmount);
          setUserCredits(newCreditAmount);
          
          toast({
            title: "Text humanized successfully",
            description: `Used ${response.creditsUsed} credits. Remaining: ${newCreditAmount} credits.`,
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
    
    setIsSaving(true);
    
    try {
      const { success, projectId } = await saveProject(
        projectTitle,
        inputText,
        outputText
      );
      
      if (success && projectId) {
        // Log usage for the saved project
        await logUsage(projectId, inputText.length > 100 ? Math.ceil(inputText.length / 100) : 1);
        
        toast({
          title: "Project saved",
          description: "Your project has been saved successfully.",
        });
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
    setProjectTitle("Untitled Project");
    
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
        <div className="flex items-center justify-between h-14">
          <Label htmlFor="input-text" className="text-xl font-medium text-gray-700 dark:text-gray-300">AI-Generated Text</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePasteFromClipboard}
            disabled={isPasting}
            className="h-10 px-3 rounded-lg text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
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
        <div className="flex-1">
          <Textarea
            id="input-text"
            placeholder="Paste your AI-generated text here..."
            className="h-[250px] w-full resize-none p-6 text-base rounded-xl border-gray-200 dark:border-gray-700 shadow-sm bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-full text-gray-500 dark:text-gray-300 shadow-sm font-medium">
            {inputText.length} characters
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClear}
              disabled={isHumanizing || !inputText}
              className="h-12 px-4 rounded-lg text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <Trash className="h-5 w-5 mr-2" />
              Clear
            </Button>
            <Button 
              onClick={handleHumanize} 
              disabled={isHumanizing || !inputText || userCredits === 0}
              className="h-12 px-6 text-base rounded-lg font-medium bg-gradient-to-br from-[#4A90E2] via-[#4F7AE0] to-[#5A6ACF] hover:from-[#3A80D2] hover:to-[#4A5ABF] shadow-lg transition-all"
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
        <div className="flex items-center justify-between h-14">
          <Label htmlFor="output-text" className="text-xl font-medium text-gray-700 dark:text-gray-300">Humanized Result</Label>
          <div className="flex gap-2">
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Project title"
              className="h-10 px-4 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="flex-1">
          <div 
            ref={outputRef}
            className={cn(
              "h-[250px] w-full p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-auto text-base shadow-sm",
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
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-full text-gray-500 dark:text-gray-300 shadow-sm font-medium">
            {outputText.length} characters
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              disabled={!outputText}
              className="h-12 px-4 rounded-lg text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
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
              disabled={isSaving || !outputText}
              variant="outline"
              size="sm"
              className="h-12 px-4 rounded-lg font-medium bg-gradient-to-br from-[#4A90E2] via-[#4F7AE0] to-[#5A6ACF] hover:from-[#3A80D2] hover:to-[#4A5ABF] text-white border-none shadow-lg transition-all"
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
    </div>
  );
}