'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
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

interface ProjectContextType {
  projects: Project[];
  pagination: any;
  loading: boolean;
  error: string | null;
  preloaded: boolean;
  fetchProjects: (params: { page: number; pageSize: number }) => Promise<void>;
  deleteProject: (projectId: string) => Promise<{ success: boolean; error?: string }>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preloaded, setPreloaded] = useState(false);
  const { user, loading: authLoading } = useSupabaseAuth();

  const fetchProjects = useCallback(async ({ page, pageSize }: { page: number; pageSize: number }) => {
    console.log('ProjectContext - fetchProjects called with:', { page, pageSize }, 'user:', user?.id);
    if (authLoading || !user) {
      console.log('ProjectContext - Auth loading or no user, skipping fetch');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      console.log('ProjectContext - Executing query with params:', { from, to, userId: user.id });
      const { data, error: supabaseError, count } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      console.log('ProjectContext - Fetch projects response:', { data, count, supabaseError, userId: user.id });

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
      
      if (!preloaded) {
        setPreloaded(true);
      }
      
      console.log('ProjectContext - Set projects:', data || [], 'Pagination:', {
        page,
        pageSize,
        total: count || 0,
        totalPages
      });
    } catch (error: any) {
      console.error('ProjectContext - Fetch projects error:', error);
      setError(error.message || 'Failed to fetch projects');
      setProjects([]);
      setPagination({ page, pageSize, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, preloaded]);

  const deleteProject = useCallback(async (projectId: string): Promise<{ success: boolean; error?: string }> => {
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
      console.error('ProjectContext - Delete project error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete project' 
      };
    }
  }, [authLoading, user]);

  const refreshProjects = useCallback(async () => {
    console.log('ProjectContext - refreshProjects called with pagination:', pagination);
    if (pagination && !authLoading && user) {
      await fetchProjects({ page: pagination.page, pageSize: pagination.pageSize });
    }
  }, [pagination, authLoading, user, fetchProjects]);

  return (
    <ProjectContext.Provider value={{
      projects,
      pagination,
      loading,
      error,
      preloaded,
      fetchProjects,
      deleteProject,
      refreshProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}
