import { useState, useCallback } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';

type Project = {
  id: string;
  title: string;
  input_text: string;
  output_text: string;
  created_at: string;
};

type PaginationOptions = {
  page: number;
  pageSize: number;
};

type ProjectsResponse = {
  data: Project[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export function useProjects() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch projects with pagination
  const fetchProjects = useCallback(
    async (options?: Partial<PaginationOptions>) => {
      if (!user) {
        setError('You must be signed in to view projects');
        return { success: false };
      }

      try {
        setLoading(true);
        const page = options?.page || pagination.page;
        const pageSize = options?.pageSize || pagination.pageSize;

        const response = await fetch(
          `/api/projects?page=${page}&pageSize=${pageSize}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch projects');
        }

        const data: ProjectsResponse = await response.json();

        if (data.success) {
          setProjects(data.data);
          setPagination(data.pagination);
          return { success: true, data: data.data };
        } else {
          throw new Error(data.error || 'Failed to fetch projects');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch projects');
        console.error('Error fetching projects:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [user, pagination.page, pagination.pageSize]
  );

  // Get a single project by ID
  const getProject = useCallback(
    async (projectId: string) => {
      if (!user) {
        setError('You must be signed in to view projects');
        return { success: false };
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch project');
        }

        const data = await response.json();

        if (data.success) {
          return { success: true, data: data.data };
        } else {
          throw new Error(data.error || 'Failed to fetch project');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch project');
        console.error('Error fetching project:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Update a project
  const updateProject = useCallback(
    async (
      projectId: string,
      updates: Partial<{ title: string; input_text: string; output_text: string }>
    ) => {
      if (!user) {
        setError('You must be signed in to update projects');
        return { success: false };
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update project');
        }

        const data = await response.json();

        if (data.success) {
          // Refresh projects after update
          await fetchProjects();
          return { success: true };
        } else {
          throw new Error(data.error || 'Failed to update project');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to update project');
        console.error('Error updating project:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [user, fetchProjects]
  );

  // Delete a project
  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!user) {
        setError('You must be signed in to delete projects');
        return { success: false };
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete project');
        }

        const data = await response.json();

        if (data.success) {
          // Refresh projects after deletion
          await fetchProjects();
          return { success: true };
        } else {
          throw new Error(data.error || 'Failed to delete project');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to delete project');
        console.error('Error deleting project:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [user, fetchProjects]
  );

  return {
    projects,
    pagination,
    loading,
    error,
    fetchProjects,
    getProject,
    updateProject,
    deleteProject,
  };
}
