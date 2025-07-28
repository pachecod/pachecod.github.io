import React from 'react';
import { Code, FileCode, PanelLeft } from 'lucide-react';
import { Framework, Project } from '../types';
import { FileList } from './FileList';
import { supabase } from '../lib/supabase';
import { DBProject } from '../lib/supabase';

interface SidebarProps {
  onLoadTemplate: (template: Project) => void;
  templates: Record<string, Project>;
  projects: DBProject[];
  onLoadProject: (projectId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onLoadTemplate, 
  templates,
  projects,
  onLoadProject
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [fileListKey, setFileListKey] = React.useState(0);

  const frameworkIcons = {
    [Framework.HTML]: <FileCode size={16} className="text-orange-400" />,
    [Framework.AFRAME]: <Code size={16} className="text-blue-400" />,
    [Framework.BABYLON]: <Code size={16} className="text-purple-400" />,
  };

  // Subscribe to file changes
  React.useEffect(() => {
    const channel = supabase
      .channel('file-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'storage',
      }, () => {
        setFileListKey(prev => prev + 1);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <aside 
      className={`bg-gray-900 border-r border-gray-700 flex flex-col transition-all duration-300 ${
        isExpanded ? 'w-96' : 'w-12'
      }`}
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 hover:bg-gray-800 transition-colors self-end"
      >
        <PanelLeft size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      <div className="flex-1 overflow-y-auto">
        {isExpanded && (
          <>
            {projects.length > 0 && (
              <div className="mb-6">
                <div className="px-3 py-2">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Your Projects
                  </h2>
                </div>
                <nav className="space-y-1">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => onLoadProject(project.id)}
                      className="w-full text-left hover:bg-gray-800 transition-colors flex items-center px-3 py-2 space-x-2"
                    >
                      {frameworkIcons[project.framework as Framework] || <FileCode size={16} />}
                      <span className="text-sm">{project.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            )}

            <div className="px-3 py-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Templates
              </h2>
            </div>
            
            <nav className="space-y-1 mb-6">
              {Object.entries(templates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => onLoadTemplate(template)}
                  className="w-full text-left hover:bg-gray-800 transition-colors flex items-center px-3 py-2 space-x-2"
                >
                  {frameworkIcons[template.framework] || <FileCode size={16} />}
                  <span className="text-sm">{template.name}</span>
                </button>
              ))}
            </nav>

            <div className="px-3 py-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Uploaded Files
              </h2>
              <FileList key={fileListKey} />
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;