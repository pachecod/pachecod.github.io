import { create } from 'zustand';
import { 
  getCurrentUser, 
  type DBProject, 
  getUserProjects, 
  createProject, 
  updateProject,
  createFile,
  updateFile,
  getProjectFiles
} from '../lib/supabase';
import { Project, Framework, File as ProjectFile } from '../types';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  projects: DBProject[];
  setUser: (user: any | null) => void;
  setProjects: (projects: DBProject[]) => void;
  checkAuth: () => Promise<void>;
  loadProjects: () => Promise<void>;
  saveProject: (project: Project) => Promise<string | null>;
  loadProject: (projectId: string) => Promise<Project | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  projects: [],
  setUser: (user) => set({ user }),
  setProjects: (projects) => set({ projects }),
  
  checkAuth: async () => {
    try {
      const user = await getCurrentUser();
      set({ user, isLoading: false });
      if (user) {
        await get().loadProjects();
      }
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },

  loadProjects: async () => {
    const { data: projects, error } = await getUserProjects();
    if (!error && projects) {
      set({ projects });
    }
  },

  saveProject: async (project: Project) => {
    const user = get().user;
    if (!user) return null;

    try {
      // Create or update project
      const existingProject = get().projects.find(p => p.name === project.name);
      let projectId: string;

      if (existingProject) {
        const { data: updatedProject } = await updateProject(existingProject.id, {
          name: project.name,
          framework: project.framework,
          user_id: user.id
        });
        projectId = existingProject.id;
      } else {
        const { data: newProject } = await createProject({
          name: project.name,
          framework: project.framework,
          user_id: user.id
        });
        projectId = newProject?.id || '';
      }

      // Save all files
      for (const file of project.files) {
        const { data: existingFiles } = await getProjectFiles(projectId);
        const existingFile = existingFiles?.find(f => f.name === file.name);

        if (existingFile) {
          await updateFile(existingFile.id, {
            content: file.content,
            type: file.type
          });
        } else {
          await createFile({
            project_id: projectId,
            name: file.name,
            type: file.type,
            content: file.content
          });
        }
      }

      await get().loadProjects();
      return projectId;
    } catch (error) {
      console.error('Error saving project:', error);
      return null;
    }
  },

  loadProject: async (projectId: string): Promise<Project | null> => {
    try {
      const { data: project } = await updateProject(projectId, {});
      if (!project) return null;

      const { data: files } = await getProjectFiles(projectId);
      if (!files) return null;

      return {
        name: project.name,
        framework: project.framework as Framework,
        files: files.map(f => ({
          id: f.name,
          name: f.name,
          type: f.type as ProjectFile['type'],
          content: f.content
        }))
      };
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  }
}));