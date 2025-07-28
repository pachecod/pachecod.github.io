import React, { useEffect, useState } from 'react';
import { Copy, Trash2, FileText, Image as ImageIcon, FileVideo, FileAudio, File, Box, AlertCircle, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase, getFiles, debugStorageAccess, createRequiredFolders } from '../lib/supabase';
import { FileUpload } from './FileUpload';

interface FileInfo {
  name: string;
  originalName: string;
  url: string;
  id: string;
  type: string;
  folder?: string;
  size?: number;
  lastModified?: string;
}

interface FilesByCategory {
  [key: string]: FileInfo[];
}

export const FileList: React.FC = () => {
  const [files, setFiles] = useState<FilesByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['images', 'videos', '3d', 'audio', 'other']));
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filesPerPage, setFilesPerPage] = useState<number | 'all'>(5);
  const [page, setPage] = useState<{ [key: string]: number }>({ images: 0, videos: 0, '3d': 0, audio: 0, other: 0 });
  const [totalFilesByCategory, setTotalFilesByCategory] = useState<{ [key: string]: number }>({});

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'videos':
        return <FileVideo size={18} className="text-purple-400" />;
      case 'audio':
        return <FileAudio size={18} className="text-green-400" />;
      case '3d':
        return <Box size={18} className="text-orange-400" />;
      case 'images':
        return <ImageIcon size={18} className="text-blue-400" />;
      default:
        return <FileText size={18} className="text-gray-400" />;
    }
  };

  const loadFiles = async () => {
    try {
      setError(null);
      setLoading(true);
      const categorizedFiles: FilesByCategory = {
        images: [],
        videos: [],
        '3d': [],
        audio: [],
        other: []
      };
      const totals: { [key: string]: number } = {};
      for (const category of Object.keys(categorizedFiles)) {
        let limit = filesPerPage === 'all' ? undefined : filesPerPage;
        let offset = filesPerPage === 'all' ? 0 : (page[category] || 0) * (filesPerPage as number);
        const catFiles = await getFiles({ limit, offset, folder: category });
        categorizedFiles[category] = catFiles;
        totals[category] = catFiles.length < (limit || 1000) && filesPerPage !== 'all' ? offset + catFiles.length : offset + catFiles.length + 1; // crude estimate
      }
      setFiles(categorizedFiles);
      setTotalFilesByCategory(totals);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async (url: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback(fileName);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const deleteFile = async (fileName: string, folder: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
      return;
    }

    try {
      const filePath = `${folder}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('files')
        .remove([filePath]);

      if (error) throw error;

      loadFiles();
      if (previewUrl) setPreviewUrl(null);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handlePreview = (file: FileInfo) => {
    setPreviewUrl(file.url);
  };

  useEffect(() => {
    loadFiles();

    const channel = supabase
      .channel('storage-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'storage',
        table: 'objects',
        filter: `bucket_id=eq.files`
      }, () => {
        setTimeout(() => {
          loadFiles();
        }, 500);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadFiles();
  }, [filesPerPage, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading files...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-center flex-col text-center space-y-4">
          <AlertCircle className="text-red-400 w-8 h-8" />
          <div>
            <p className="text-red-400 mb-2">Failed to load files</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadFiles}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasFiles = Object.values(files).some(category => category.length > 0);
  const totalFiles = Object.values(files).reduce((sum, category) => sum + category.length, 0);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold">Files</h3>
            {totalFiles > 0 && (
              <span className="text-xs text-gray-400">({totalFiles})</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadFiles}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Refresh files"
            >
              <RefreshCw size={14} className="text-gray-400" />
            </button>
            <button
              onClick={async () => {
                console.log('=== MANUAL TEST ===');
                try {
                  const result = await getFiles();
                  console.log('Manual getFiles result:', result);
                  console.log('Result length:', result.length);
                  console.log('Result type:', typeof result);
                  console.log('Is array?', Array.isArray(result));
                } catch (error) {
                  console.error('Manual test error:', error);
                }
              }}
              className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded"
              title="Test getFiles function"
            >
              Test
            </button>
            <button
              onClick={debugStorageAccess}
              className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
              title="Debug storage access"
            >
              Debug
            </button>
            <button
              onClick={async () => {
                console.log('=== SETTING UP FOLDERS ===');
                try {
                  const results = await createRequiredFolders();
                  console.log('Folder creation results:', results);
                  alert('Folders setup complete! Check console for details.');
                } catch (error) {
                  console.error('Folder setup error:', error);
                  alert('Folder setup failed. Check console for details.');
                }
              }}
              className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded"
              title="Create required folders"
            >
              Setup
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <FileUpload
            onUploadComplete={() => {}}
            onFilesChanged={loadFiles}
          />
          <span className="text-xs text-white ml-1 mr-2">Upload</span>
          <label htmlFor="filesPerPage" className="text-xs text-gray-400">Show files:</label>
          <select
            id="filesPerPage"
            value={filesPerPage}
            onChange={e => {
              setFilesPerPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
              setPage({ images: 0, videos: 0, '3d': 0, audio: 0, other: 0 });
            }}
            className="bg-gray-700 text-white text-xs rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="flex">
        <div className={`flex-1 ${previewUrl ? 'border-r border-gray-700' : ''}`}>
          {!hasFiles ? (
            <div className="text-center py-6 px-3">
              <p className="text-gray-400 mb-3 text-sm">No files uploaded yet</p>
              <p className="text-xs text-gray-500">
                Use the upload button in the header to add files
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(files).map(([category, categoryFiles]) => (
                categoryFiles.length > 0 && (
                  <div key={category} className="border border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-2 bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <span className="font-medium capitalize text-sm">{category}</span>
                      <span className="flex items-center">
                        <span className="text-xs text-gray-400 mr-2">{categoryFiles.length} files</span>
                        {expandedCategories.has(category) ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </span>
                    </button>
                    
                    {expandedCategories.has(category) && (
                      <>
                        <div className="divide-y divide-gray-700">
                          {categoryFiles.map((file) => (
                            <div 
                              key={file.id}
                              className="flex items-center p-3 hover:bg-gray-700 transition-colors group"
                            >
                              {/* File Icon/Thumbnail */}
                              <div className="flex-shrink-0 mr-3">
                                {category === 'images' ? (
                                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-800 flex items-center justify-center cursor-pointer">
                                    <img 
                                      src={file.url} 
                                      alt={file.originalName}
                                      className="w-full h-full object-cover"
                                      onClick={() => handlePreview(file)}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '';
                                          const iconDiv = document.createElement('div');
                                          iconDiv.className = 'flex items-center justify-center w-full h-full';
                                          parent.appendChild(iconDiv);
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center">
                                    {getFileIcon(category)}
                                  </div>
                                )}
                              </div>

                              {/* File Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate mb-1">
                                  {file.originalName}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <span className="capitalize">{category}</span>
                                  {file.size && file.size > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{(file.size / 1024).toFixed(1)}KB</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => copyUrl(file.url, file.originalName)}
                                  className="p-1.5 hover:bg-gray-600 rounded transition-colors relative"
                                  title="Copy URL"
                                >
                                  <Copy size={14} />
                                  {copyFeedback === file.originalName && (
                                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-xs rounded whitespace-nowrap mb-1">
                                      Copied!
                                    </span>
                                  )}
                                </button>
                                <button
                                  onClick={() => deleteFile(file.name, file.folder || 'other')}
                                  className="p-1.5 hover:bg-gray-600 rounded transition-colors text-red-400"
                                  title="Delete file"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {filesPerPage !== 'all' && categoryFiles.length > 0 && (
                          <div className="flex justify-between items-center px-3 py-2 bg-gray-900 border-t border-gray-700">
                            <button
                              disabled={page[category] === 0}
                              onClick={() => setPage(p => ({ ...p, [category]: Math.max(0, (p[category] || 0) - 1) }))}
                              className="px-2 py-1 text-xs bg-gray-700 rounded disabled:opacity-50"
                            >
                              Prev
                            </button>
                            <span className="text-xs text-gray-400">Page {(page[category] || 0) + 1}</span>
                            <button
                              disabled={categoryFiles.length < (filesPerPage as number)}
                              onClick={() => setPage(p => ({ ...p, [category]: (p[category] || 0) + 1 }))}
                              className="px-2 py-1 text-xs bg-gray-700 rounded disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="w-80 p-3 bg-gray-900">
            <div className="sticky top-0">
              <h4 className="text-sm font-medium mb-3">Preview</h4>
              <div className="rounded-lg overflow-hidden bg-black aspect-square mb-3">
                <img 
                  src={previewUrl} 
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                onClick={() => setPreviewUrl(null)}
                className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};