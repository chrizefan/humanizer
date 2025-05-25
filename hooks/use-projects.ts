import { useState, useCallback } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  title: string;
  input_text: string;
  output_text: string;
  created_at: string;
  user_id: string;
}

interface ProjectsResponse {
  success: boolean;
  data?: Project[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useSupabaseAuth();

  const fetchProjects = useCallback(async ({ page, pageSize }: { page: number; pageSize: number }) => {
    console.log('fetchProjects called with:', { page, pageSize }, 'user:', user?.id, 'email:', user?.email);
    if (authLoading || !user) {
      console.log('fetchProjects: Auth loading or no user, skipping fetch');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Get additional session info for debugging
      const { data: { session } } = await supabase.auth.getSession();
      console.log('fetchProjects: Current session user ID:', session?.user?.id);
      
      // Skip user validation - auth middleware already handles authentication
      
      // Fetch projects using Supabase client directly
      console.log('fetchProjects: Executing query with params:', { from, to, userId: user.id });
      const { data, error: supabaseError, count } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      console.log('Fetch projects response:', { data, count, supabaseError, userId: user.id });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const totalPages = count ? Math.ceil(count / pageSize) : 1;

      setProjects(data || []);
      setPagination({
        page,
        pageSize,
        total: count || 0,
        totalPages
      });
      
      console.log('Set projects:', data || [], 'Pagination:', {
        page,
        pageSize,
        total: count || 0,
        totalPages
      });
    } catch (error: any) {
      console.error('Fetch projects error:', error);
      setError(error.message || 'Failed to fetch projects');
      setProjects([]);
      setPagination({ page, pageSize, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, supabase]);

  const deleteProject = useCallback(async (projectId: string): Promise<ProjectsResponse> => {
    if (authLoading || !user) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const { error: supabaseError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Delete project error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete project' 
      };
    }
  }, [authLoading, user, supabase]);

  const getProject = useCallback(async (projectId: string): Promise<ProjectsResponse> => {
    if (authLoading || !user) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (!data) {
        throw new Error('Project not found');
      }

      return { success: true, data: [data] };
    } catch (error: any) {
      console.error('Get project error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch project' 
      };
    }
  }, [authLoading, user, supabase]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>): Promise<ProjectsResponse> => {
    if (authLoading || !user) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (!data) {
        throw new Error('Project not found or update failed');
      }

      return { success: true, data: [data] };
    } catch (error: any) {
      console.error('Update project error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update project' 
      };
    }
  }, [authLoading, user, supabase]);

  // Create a refresh function that re-fetches with current pagination
  const refreshProjects = useCallback(async () => {
    console.log('refreshProjects called with pagination:', pagination, 'user:', user?.id, 'email:', user?.email);
    if (pagination && !authLoading && user) {
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;

      setLoading(true);
      setError(null);
      
      try {
        // Get additional session info for debugging
        const { data: { session } } = await supabase.auth.getSession();
        console.log('refreshProjects: Current session user ID:', session?.user?.id);
        
        // Skip user validation - auth middleware already handles authentication
        
        console.log('refreshProjects: User in database check skipped');
        
        console.log('Executing refresh query with params:', { from, to, userId: user.id });
        const { data, error: supabaseError, count } = await supabase
          .from('projects')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(from, to);

        console.log('Refresh projects response:', { data, count, supabaseError, userId: user.id });

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        const totalPages = count ? Math.ceil(count / pagination.pageSize) : 1;

        setProjects(data || []);
        setPagination({
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: count || 0,
          totalPages
        });
      } catch (error: any) {
        console.error('Refresh projects error:', error);
        setError(error.message || 'Failed to refresh projects');
        setProjects([]);
        setPagination({ 
          page: pagination.page, 
          pageSize: pagination.pageSize, 
          total: 0, 
          totalPages: 1 
        });
      } finally {
        setLoading(false);
      }
    }
  }, [pagination, authLoading, user, supabase]);

  return {
    projects,
    pagination,
    loading,
    error,
    fetchProjects,
    deleteProject,
    getProject,
    updateProject,
    refreshProjects
  };
}