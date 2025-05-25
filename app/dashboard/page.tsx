"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import TextEditor from "@/components/common/text-editor";
import CreditCounter from "@/components/common/credit-counter";
import ProjectList from "@/components/common/project-list";
import { useRouter } from "next/navigation";
import { ProjectListProvider } from "@/hooks/use-project-list-refresh";
import { ProjectProvider, useProjectContext } from "@/hooks/use-project-context";
import { isAuthenticated } from "@/lib/supabase";

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { fetchProjects } = useProjectContext();

  useEffect(() => {
    const checkAuthAndPreloadProjects = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          router.push("/auth?returnUrl=/dashboard");
        } else {
          setIsLoading(false);
          // Preload the first page of projects to prevent flickering
          try {
            await fetchProjects({ page: 1, pageSize: 5 });
            console.log('Dashboard - Projects preloaded successfully');
          } catch (error) {
            console.log('Dashboard - Error preloading projects:', error);
            // Don't block the UI if preloading fails
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/auth?returnUrl=/dashboard");
      }
    };

    checkAuthAndPreloadProjects();
  }, [router, fetchProjects]);

  if (isLoading) {
    return (
      <div className="container py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A90E2]"></div>
      </div>
    );
  }

  return (
    <ProjectListProvider>
      <div className="container py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <CreditCounter showDetails className="mt-2 md:mt-0" />
        </div>
        
        <Tabs defaultValue="humanize" className="w-full flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="humanize">Humanize Text</TabsTrigger>
            <TabsTrigger value="history">Project History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="humanize" className="flex-1 py-2">
            <TextEditor />
          </TabsContent>
          
          <TabsContent value="history" className="flex-1 py-2">
            <ProjectList />
          </TabsContent>
        </Tabs>
      </div>
    </ProjectListProvider>
  );
}

export default function DashboardPage() {
  return (
    <ProjectProvider>
      <DashboardContent />
    </ProjectProvider>
  );
}