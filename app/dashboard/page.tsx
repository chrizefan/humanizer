"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import TextEditor from "@/components/common/text-editor";
import CreditCounter from "@/components/common/credit-counter";
import ProjectList from "@/components/common/project-list";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/supabase";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          router.push("/auth?returnUrl=/dashboard");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/auth?returnUrl=/dashboard");
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="container py-12 max-w-7xl mx-auto flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A90E2]"></div>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <CreditCounter showDetails className="mt-2 md:mt-0" />
      </div>
      
      <Tabs defaultValue="humanize" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="humanize">Humanize Text</TabsTrigger>
          <TabsTrigger value="history">Project History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="humanize" className="py-4">
          <TextEditor />
        </TabsContent>
        
        <TabsContent value="history" className="py-4">
          <ProjectList />
        </TabsContent>
      </Tabs>
    </div>
  );
}