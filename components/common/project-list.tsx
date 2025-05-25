"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useProjectContext } from "@/hooks/use-project-context";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Clock, Trash, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useProjectListRefresh } from "@/hooks/use-project-list-refresh";

interface Project {
  id: string;
  title: string;
  input_text: string;
  output_text: string;
  created_at: string;
}

interface ProjectListProps {
  className?: string;
}

export default function ProjectList({ className }: ProjectListProps) {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useSupabaseAuth();
  const { projects, pagination, loading: isLoading, error, preloaded, fetchProjects, deleteProject, refreshProjects } = useProjectContext();
  const { refreshTrigger, triggerRefresh } = useProjectListRefresh();

  useEffect(() => {
    // Only fetch projects when auth is ready and user is available
    // Skip if projects are already preloaded
    if (!authLoading && user && !preloaded) {
      console.log('ProjectList - Fetching projects for user:', user.id);
      fetchProjects({ page, pageSize });
    } else if (preloaded) {
      console.log('ProjectList - Projects already preloaded, skipping fetch');
    }
  }, [page, authLoading, user, preloaded, fetchProjects]); // Added fetchProjects back

  // Refresh projects when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && !authLoading && user) {
      console.log('ProjectList - Refresh triggered for user:', user.id, 'with refreshTrigger:', refreshTrigger);
      console.log('ProjectList - User email:', user.email);
      refreshProjects();
    } else {
      console.log('ProjectList - Refresh NOT triggered:', { 
        refreshTrigger, 
        authLoading, 
        hasUser: !!user,
        userId: user?.id
      });
    }
  }, [refreshTrigger, authLoading, user]); // Removed refreshProjects from dependencies

  useEffect(() => {
    if (error) {
      // Don't show errors related to "no projects found" which is normal
      if (error !== 'No projects found') {
        toast({
          title: "Error fetching projects",
          description: error,
          variant: "destructive",
        });
      }
    }
  }, [error, toast]);

  const totalPages = pagination?.totalPages || 1;
  const totalProjects = pagination?.total || 0;

  const handleEditProject = (project: Project) => {
    router.push(`/dashboard/edit/${project.id}`);
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      const result = await deleteProject(project.id);
      
      if (result.success) {
        toast({
          title: "Project deleted",
          description: "Your project has been deleted successfully.",
        });
        // Trigger refresh to update the project list
        triggerRefresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  // Generate skeleton cards for loading state
  const renderSkeletons = () => {
    return Array(pageSize).fill(0).map((_, i) => (
      <Card key={`skeleton-${i}`} className="mb-4">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {totalProjects > 0 ? (
              <>
                Showing {Math.min((page - 1) * pageSize + 1, totalProjects)} - {Math.min(page * pageSize, totalProjects)} of {totalProjects}
              </>
            ) : authLoading || isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              "No projects yet"
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1 || authLoading || isLoading}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages || totalPages === 0 || authLoading || isLoading}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {authLoading || isLoading ? (
        renderSkeletons()
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Your humanized texts will appear here</p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-[#4A90E2] hover:bg-[#3A80D2]"
          >
            Create your first project
          </Button>
        </div>
      ) : (
        projects.map((project) => (
          <Card key={project.id} className="mb-4 transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(project.created_at), 'MMM d, yyyy')}
                </div>
              </div>
              <CardDescription className="text-xs">
                {format(new Date(project.created_at), 'h:mm a')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-3">
                {project.input_text}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="text-xs text-gray-500">
                {project.input_text.length} characters
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteProject(project)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProject(project)}
                  className="text-[#4A90E2] hover:bg-[#4A90E2]/10"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      )}

      {/* Pagination controls for bottom of list */}
      {totalPages > 1 && !isLoading && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center px-4">
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}