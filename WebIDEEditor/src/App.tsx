import React, { useState, useEffect } from 'react';
import { Home, Play, Save, Settings, Maximize2, Minimize2 } from 'lucide-react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileTabs from './components/FileTabs';
import { FileType, Project } from './types';
import { defaultTemplates } from './templates';
import { useAuthStore } from './store/auth';

function App() {
  const [activeFileId, setActiveFileId] = useState<string>('index.html');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [splitPosition, setSplitPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isPreviewExternal, setIsPreviewExternal] = useState(false);
  
  const user = useAuthStore(state => state.user);
  const saveProject = useAuthStore(state => state.saveProject);
  const loadProject = useAuthStore(state => state.loadProject);
  const projects = useAuthStore(state => state.projects);
  
  const [project, setProject] = useState<Project>(() => {
    const savedProject = localStorage.getItem('current-project');
    if (savedProject) {
      try {
        return JSON.parse(savedProject);
      } catch (e) {
        console.error('Failed to parse saved project');
      }
    }
    return defaultTemplates.basic;
  });

  const updateFile = (fileId: string, content: string) => {
    const newProject = {
      ...project,
      files: project.files.map(file => 
        file.id === fileId ? { ...file, content } : file
      )
    };
    setProject(newProject);
    localStorage.setItem('current-project', JSON.stringify(newProject));
    setPreviewKey(prev => prev + 1);
  };

  const handleChangeFile = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  const loadTemplate = (templateProject: Project) => {
    setProject(templateProject);
    setActiveFileId(templateProject.files[0]?.id || 'index.html');
    localStorage.setItem('current-project', JSON.stringify(templateProject));
    setPreviewKey(prev => prev + 1);
  };

  const handleSaveProject = async () => {
    if (!user) {
      alert('Please sign in to save your project');
      return;
    }

    const projectId = await saveProject(project);
    if (projectId) {
      alert('Project saved successfully!');
    } else {
      alert('Failed to save project');
    }
  };

  const handleLoadProject = async (projectId: string) => {
    const loadedProject = await loadProject(projectId);
    if (loadedProject) {
      setProject(loadedProject);
      setActiveFileId(loadedProject.files[0]?.id || 'index.html');
      localStorage.setItem('current-project', JSON.stringify(loadedProject));
      setPreviewKey(prev => prev + 1);
    }
  };

  const activeFile = project.files.find(file => file.id === activeFileId) || project.files[0];

  const togglePreview = () => {
    if (isPreviewExternal) {
      setIsPreviewExternal(false);
      setShowPreview(true);
    } else {
      setShowPreview(!showPreview);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const container = e.currentTarget as HTMLDivElement;
    const containerRect = container.getBoundingClientRect();
    const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setSplitPosition(Math.max(20, Math.min(80, newPosition)));
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeFile?.content || '');
    } catch (err) {
      alert('Failed to copy code');
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = 'default';
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Header 
        projectName={project.name}
        onSave={handleSaveProject}
        onCopyCode={handleCopyCode}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onLoadTemplate={loadTemplate}
          templates={defaultTemplates}
          projects={projects}
          onLoadProject={handleLoadProject}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <FileTabs 
            files={project.files}
            activeFileId={activeFileId}
            onChangeFile={handleChangeFile}
          />
          
          <div 
            className="flex flex-1 overflow-hidden relative"
            onMouseMove={handleMouseMove}
          >
            <div 
              className="h-full overflow-hidden transition-[width] duration-300 ease-in-out relative"
              style={{ width: showPreview ? `${splitPosition}%` : '100%' }}
            >
              <div className="absolute top-2 right-2 z-10">
                <button 
                  onClick={togglePreview}
                  className="px-3 py-1.5 bg-gray-800 rounded hover:bg-gray-700 transition-colors flex items-center gap-1 text-sm"
                  title={showPreview ? "Hide preview" : "Show preview"}
                >
                  {showPreview ? (
                    <>
                      <Minimize2 size={16} />
                      <span>Hide Preview</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 size={16} />
                      <span>Show Preview</span>
                    </>
                  )}
                </button>
              </div>
              <Editor 
                value={activeFile?.content || ''}
                language={activeFile?.type || FileType.HTML}
                onChange={(value) => updateFile(activeFileId, value)}
              />
            </div>
            
            <div 
              className="w-2 bg-gray-800 hover:bg-blue-500 transition-colors cursor-col-resize"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            />
            
            <div 
              className="h-full overflow-hidden transition-[width] duration-300 ease-in-out"
              style={{ width: showPreview ? `${100 - splitPosition}%` : '0%' }}
            >
              <Preview 
                key={previewKey}
                files={project.files}
                framework={project.framework}
                onPreviewModeChange={(isExternal) => {
                  setIsPreviewExternal(isExternal);
                  setShowPreview(!isExternal);
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;