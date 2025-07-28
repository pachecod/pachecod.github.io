import React from 'react';
import { File, FileType } from '../types';
import { FileCode, FileText, FileJson, X } from 'lucide-react';

interface FileTabsProps {
  files: File[];
  activeFileId: string;
  onChangeFile: (id: string) => void;
}

const FileTabs: React.FC<FileTabsProps> = ({ files, activeFileId, onChangeFile }) => {
  const getFileIcon = (type: FileType) => {
    switch (type) {
      case FileType.HTML:
        return <FileCode size={16} className="text-orange-400" />;
      case FileType.CSS:
        return <FileText size={16} className="text-blue-400" />;
      case FileType.JS:
        return <FileJson size={16} className="text-yellow-400" />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {files.map((file) => (
        <div
          key={file.id}
          className={`
            flex items-center py-2 px-4 border-r border-gray-700 cursor-pointer transition-colors
            ${activeFileId === file.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-700'}
          `}
          onClick={() => onChangeFile(file.id)}
        >
          {getFileIcon(file.type)}
          <span className="ml-2 text-sm whitespace-nowrap">{file.name}</span>
        </div>
      ))}
    </div>
  );
};

export default FileTabs;