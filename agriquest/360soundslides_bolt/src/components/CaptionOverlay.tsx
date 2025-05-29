import React from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store';

interface CaptionOverlayProps {
  text: string;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ text }) => {
  const { hideCaption } = useStore();
  
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 animate-fadeIn">
      <div className="bg-white bg-opacity-90 max-w-2xl w-full mx-4 rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-blue-500 text-white">
          <h2 className="text-xl font-bold">Caption</h2>
          <button 
            onClick={hideCaption}
            className="text-white hover:text-blue-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-800 text-lg leading-relaxed">{text}</p>
        </div>
        
        <div className="px-6 py-4 bg-gray-100 flex justify-end">
          <button
            onClick={hideCaption}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};