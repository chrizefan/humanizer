"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Copy, Check, Save, Trash } from "lucide-react";
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
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Input Panel */}
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="input-text" className="text-lg font-medium">Input Text</Label>
          <div className="flex gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="tone" className="text-xs text-gray-500">Tone</Label>
              <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                <SelectTrigger id="tone" className="w-[130px] h-8">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="length" className="text-xs text-gray-500">Length</Label>
              <Select value={length} onValueChange={(value: any) => setLength(value)}>
                <SelectTrigger id="length" className="w-[130px] h-8">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Textarea
          id="input-text"
          placeholder="Enter your text here to humanize..."
          className="flex-1 min-h-[300px] resize-none p-4"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {inputText.length} characters
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClear}
              disabled={isHumanizing || !inputText}
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button 
              onClick={handleHumanize} 
              disabled={isHumanizing || !inputText || userCredits === 0}
              className="bg-[#4A90E2] hover:bg-[#3A80D2]"
            >
              {isHumanizing ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Humanizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Humanize
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Output Panel */}
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="output-text" className="text-lg font-medium">Humanized Result</Label>
          <div className="flex gap-2">
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Project title"
              className="h-8 px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            />
          </div>
        </div>
        <div 
          ref={outputRef}
          className={cn(
            "flex-1 min-h-[300px] p-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-auto",
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
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {outputText.length} characters
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              disabled={!outputText}
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !outputText}
              variant="outline"
              size="sm"
              className="border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}