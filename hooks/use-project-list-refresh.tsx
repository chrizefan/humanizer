'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ProjectListContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ProjectListContext = createContext<ProjectListContextType | undefined>(undefined);

export function ProjectListProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    console.log('triggerRefresh called in ProjectListContext');
    setRefreshTrigger(prev => {
      console.log('Incrementing refreshTrigger from', prev, 'to', prev + 1);
      return prev + 1;
    });
  }, []);

  return (
    <ProjectListContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </ProjectListContext.Provider>
  );
}

export function useProjectListRefresh() {
  const context = useContext(ProjectListContext);
  if (context === undefined) {
    throw new Error('useProjectListRefresh must be used within a ProjectListProvider');
  }
  return context;
}
