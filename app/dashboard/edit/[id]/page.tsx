"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import TextEditor from "@/components/common/text-editor";
import { supabase } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/supabase";
import { Project } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function EditProjectPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndFetchProject = async () => {
      try {
        // Check if user is authenticated
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          router.push("/auth?returnUrl=/dashboard");
          return;
        }

        // Fetch project details
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching project:", error);
          toast({
            title: "Error",
            description: "Could not load the project. It may have been deleted or you don't have permission to view it.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }

        if (!data) {
          toast({
            title: "Project Not Found",
            description: "The project you're looking for doesn't exist or you don't have permission to view it.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }

        setProject(data as Project);
      } catch (error) {
        console.error("Error in checkAuthAndFetchProject:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchProject();
  }, [params.id, router, toast]);

  if (isLoading) {
    return (
      <div className="container py-12 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-12 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="mb-6">The project you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Edit Project</h1>
      </div>

      <TextEditor
        initialInput={project.input_text}
        initialOutput={project.output_text}
        title={project.title}
      />
    </div>
  );
}