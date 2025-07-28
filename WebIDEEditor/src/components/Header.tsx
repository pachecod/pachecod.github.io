import React, { useState } from 'react';
import { Code, Save, Copy } from 'lucide-react';
// import { FileUpload } from './FileUpload';

interface HeaderProps {
  projectName: string;
  onSave: () => void;
  onCopyCode: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ projectName, onSave, onCopyCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // const handleUploadComplete = (url: string) => {
  //   navigator.clipboard.writeText(url);
  //   alert('File uploaded! URL copied to clipboard');
  // };

  // const handleFilesChanged = () => {
  //   setFileListKey(prev => prev + 1);
  // };

  return (
    <header className="bg-gray-800 border-b border-gray-700 py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-blue-400">
            <Code size={24} className="mr-2" />
            <h1 className="font-bold text-lg">WebXR IDE</h1>
          </div>
          <span className="text-gray-400 text-sm hidden sm:block">|</span>
          <div className="text-gray-300 text-sm font-medium hidden sm:block">
            {projectName || 'Untitled Project'}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onSave}
            className="flex items-center px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Save size={16} className="mr-1.5" />
            <span className="hidden sm:inline">Download Code</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 transition-colors relative"
            title="Copy code to clipboard"
          >
            <Copy size={16} className="mr-1.5" />
            <span className="hidden sm:inline">Copy Code</span>
            {copied && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-xs rounded whitespace-nowrap border border-gray-700">Copied!</span>
            )}
          </button>
          {/* <FileUpload 
            onUploadComplete={handleUploadComplete} 
            onFilesChanged={handleFilesChanged}
          /> */}
        </div>
      </div>
    </header>
  );
};

export default Header;