"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getUserProjects } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/types";
import { ChevronLeft, ChevronRight, Clock, Trash, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ProjectListProps {
  className?: string;
}

export default function ProjectList({ className }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 5;
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, [page]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, count } = await getUserProjects(page, pageSize);
      setProjects(data as Project[]);
      setTotalProjects(count);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error fetching projects",
        description: "Could not load your projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalProjects / pageSize);

  const handleEditProject = (project: Project) => {
    router.push(`/dashboard/edit/${project.id}`);
  };

  // Placeholder for delete functionality
  const handleDeleteProject = async (project: Project) => {
    toast({
      title: "Delete project",
      description: "This feature is not implemented in the demo.",
    });
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
            ) : isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              "No projects yet"
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1 || isLoading}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages || totalPages === 0 || isLoading}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
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