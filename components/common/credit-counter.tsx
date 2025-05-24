"use client";

import { useState, useEffect } from "react";
import { CircleDollarSign } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateCharactersPerCredit } from "@/lib/pricing";

interface CreditCounterProps {
  className?: string;
  showDetails?: boolean;
}

export default function CreditCounter({ className, showDetails = false }: CreditCounterProps) {
  const { credits, usageStats, loading: isLoading, error, fetchCredits } = useCredits();

  useEffect(() => {
    // Fetch credits when component mounts
    fetchCredits();
    
    // Set up interval to refresh credits every 30 seconds
    const interval = setInterval(() => {
      fetchCredits();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchCredits]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CircleDollarSign className="h-5 w-5 text-[#4A90E2]" />
        <Skeleton className="h-5 w-20" />
      </div>
    );
  }

  // Calculate character estimate
  const characterEstimate = credits ? calculateCharactersPerCredit(credits) : 0;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        <CircleDollarSign className="h-5 w-5 text-[#4A90E2]" />
        <span className="font-medium">{credits !== null ? credits : 0} Credits</span>
      </div>
      
      {showDetails && (
        <div className="text-xs text-gray-500 mt-1 ml-7">
          ≈ {characterEstimate.toLocaleString()} characters
        </div>
      )}
    </div>
  );
}