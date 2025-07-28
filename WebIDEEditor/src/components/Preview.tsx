import React, { useEffect, useRef, useState } from 'react';
import { File, FileType, Framework } from '../types';
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

interface PreviewProps {
  files: File[];
  framework?: Framework;
  onPreviewModeChange?: (showInline: boolean) => void;
}

const Preview: React.FC<PreviewProps> = ({ files, framework, onPreviewModeChange }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showInline, setShowInline] = useState(true);
  const [externalWindow, setExternalWindow] = useState<Window | null>(null);
  const checkWindowInterval = useRef<number>();

  // Check if external window is closed
  useEffect(() => {
    if (!showInline && externalWindow) {
      checkWindowInterval.current = window.setInterval(() => {
        if (externalWindow.closed) {
          setShowInline(true);
          onPreviewModeChange?.(true);
          setExternalWindow(null);
          clearInterval(checkWindowInterval.current);
        }
      }, 1000);
    }

    return () => {
      if (checkWindowInterval.current) {
        clearInterval(checkWindowInterval.current);
      }
    };
  }, [showInline, externalWindow, onPreviewModeChange]);

  useEffect(() => {
    if (!iframeRef.current && showInline) return;

    try {
      const htmlFile = files.find(f => f.id === 'index.html');
      const cssFile = files.find(f => f.id === 'style.css');
      const jsFile = files.find(f => f.id === 'script.js');

      if (!htmlFile) {
        setError('No HTML file found');
        return;
      }

      let htmlContent = htmlFile.content;

      // Add meta tags for security and CORS
      const metaTags = `
        <meta http-equiv="Content-Security-Policy" content="
          default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
          img-src * data: blob: 'unsafe-inline';
          connect-src * 'unsafe-inline';
          media-src * blob: 'unsafe-inline';
          model-src * data: blob: 'unsafe-inline';
          script-src * 'unsafe-inline' 'unsafe-eval';
          style-src * 'unsafe-inline';
          worker-src * blob: 'unsafe-inline';
        ">
        <meta name="referrer" content="no-referrer">
        <meta http-equiv="Access-Control-Allow-Origin" content="*">
      `;

      // Add meta tags if they don't exist
      if (!htmlContent.includes('Content-Security-Policy')) {
        htmlContent = htmlContent.replace('</head>', `${metaTags}</head>`);
      }

      // Add A-Frame specific handling
      if (framework === Framework.AFRAME) {
        // Add model handling script
        const aframeScript = `
          <script>
            AFRAME.registerComponent('model-handler', {
              init: function() {
                this.el.addEventListener('model-loaded', () => {
                  const mesh = this.el.getObject3D('mesh');
                  if (mesh) {
                    mesh.traverse((node) => {
                      if (node.isMesh) {
                        // Force material update
                        if (node.material) {
                          node.material.needsUpdate = true;
                          if (node.material.map) {
                            node.material.map.needsUpdate = true;
                          }
                        }
                      }
                    });
                  }
                });
              }
            });
          </script>
        `;
        htmlContent = htmlContent.replace('</head>', `${aframeScript}</head>`);

        // Add crossorigin and model-handler to all models
        htmlContent = htmlContent.replace(/<a-entity/g, '<a-entity model-handler');
        htmlContent = htmlContent.replace(/gltf-model="([^"]+)"/g, 'gltf-model="$1" crossorigin="anonymous"');
        htmlContent = htmlContent.replace(/gltf-model='([^']+)'/g, "gltf-model='$1' crossorigin='anonymous'");
      }

      // Add crossorigin to all external resources
      htmlContent = htmlContent.replace(/<(img|video|audio|script|a-asset-item)/g, '<$1 crossorigin="anonymous"');
      
      // Add timeout to a-assets if present
      htmlContent = htmlContent.replace(/<a-assets/g, '<a-assets timeout="30000"');

      // Add resource preload script
      const preloadScript = `
        <script>
          window.addEventListener('load', () => {
            // Pre-fetch all external resources
            document.querySelectorAll('[src], [href], [gltf-model]').forEach(el => {
              const url = el.getAttribute('src') || el.getAttribute('href') || el.getAttribute('gltf-model');
              if (url && url.startsWith('http')) {
                fetch(url, { mode: 'cors', credentials: 'omit' })
                  .catch(err => console.warn('Resource prefetch:', err));
              }
            });
          });
        </script>
      `;
      htmlContent = htmlContent.replace('</head>', `${preloadScript}</head>`);

      // Inject CSS if it exists and not already in HTML
      if (cssFile && !htmlContent.includes('<link') && !htmlContent.includes('<style')) {
        const styleTag = `<style>${cssFile.content}</style>`;
        htmlContent = htmlContent.replace('</head>', `${styleTag}</head>`);
      }
      
      // Inject JS if it exists and not already in HTML
      if (jsFile && !htmlContent.includes('<script')) {
        const scriptTag = `<script>${jsFile.content}</script>`;
        htmlContent = htmlContent.replace('</body>', `${scriptTag}</body>`);
      }

      // Create blob with proper permissions
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);

      if (showInline && iframeRef.current) {
        iframeRef.current.src = url;
      } else if (!showInline && previewUrl) {
        if (externalWindow && !externalWindow.closed) {
          externalWindow.location.href = url;
        } else {
          const newWindow = window.open(url, 'preview', 'width=800,height=600');
          setExternalWindow(newWindow);
        }
      }
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      setError(`Preview error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [files, framework, showInline]);

  const togglePreviewMode = () => {
    if (!showInline) {
      // Switching back to inline mode
      setShowInline(true);
      onPreviewModeChange?.(true);
      if (externalWindow && !externalWindow.closed) {
        externalWindow.close();
      }
      setExternalWindow(null);
    } else {
      // Opening in new tab
      setShowInline(false);
      onPreviewModeChange?.(false);
      if (previewUrl) {
        const newWindow = window.open(previewUrl, 'preview', 'width=800,height=600');
        setExternalWindow(newWindow);
      }
    }
  };

  if (error) {
    return (
      <div className="h-full bg-gray-800 p-4 overflow-auto">
        <div className="p-4 bg-red-900 rounded-md text-white">
          <h3 className="font-bold mb-2">Preview Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center bg-gray-800 px-4 py-2">
        <span className="text-sm font-medium">Preview</span>
        <button 
          onClick={togglePreviewMode}
          className="p-1.5 rounded hover:bg-gray-700 transition-colors flex items-center gap-1 text-sm"
          title={showInline ? "Open in new tab" : "Show inline preview"}
        >
          {showInline ? (
            <>
              <Maximize2 size={16} />
              <span>Open in new tab</span>
            </>
          ) : (
            <>
              <Minimize2 size={16} />
              <span>Show inline preview</span>
            </>
          )}
        </button>
      </div>
      {showInline ? (
        <div className="flex-1">
          <iframe
            ref={iframeRef}
            className="w-full h-full bg-white"
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin allow-presentation allow-downloads"
            title="Preview"
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-900 p-4">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Preview opened in new tab</p>
            <button
              onClick={togglePreviewMode}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <Minimize2 size={16} />
              <span>Return to inline preview</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;