import * as React from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { validateSupabaseConnection, createRequiredFolders } from '../lib/supabase';

interface ValidationResult {
  success: boolean;
  message: string;
  buckets?: string[];
  filesCount?: number;
}

interface FolderResult {
  folder: string;
  success: boolean;
  error?: string;
}

export const SupabaseValidator: React.FC = () => {
  const [validationResult, setValidationResult] = React.useState<ValidationResult | null>(null);
  const [folderResults, setFolderResults] = React.useState<FolderResult[]>([]);
  const [isValidating, setIsValidating] = React.useState(false);
  const [isCreatingFolders, setIsCreatingFolders] = React.useState(false);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const result = await validateSupabaseConnection();
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        success: false,
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsValidating(false);
    }
  };

  const createFolders = async () => {
    setIsCreatingFolders(true);
    try {
      const results = await createRequiredFolders();
      setFolderResults(results);
    } catch (error) {
      console.error('Error creating folders:', error);
    } finally {
      setIsCreatingFolders(false);
    }
  };

  React.useEffect(() => {
    runValidation();
  }, []);

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <AlertCircle className="w-6 h-6 text-blue-400" />
        Supabase Integration Status
      </h2>

      {/* Connection Validation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Connection Test</h3>
          <button
            onClick={runValidation}
            disabled={isValidating}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Again'
            )}
          </button>
        </div>

        {validationResult && (
          <div className={`p-4 rounded-lg border ${validationResult.success ? 'border-green-600 bg-green-900 bg-opacity-20' : 'border-red-600 bg-red-900 bg-opacity-20'}`}>
            <div className="flex items-start gap-3">
              {getStatusIcon(validationResult.success)}
              <div className="flex-1">
                <p className={`font-medium ${getStatusColor(validationResult.success)}`}>
                  {validationResult.message}
                </p>
                {validationResult.buckets && validationResult.buckets.length > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    Available buckets: {validationResult.buckets.join(', ')}
                  </p>
                )}
                {validationResult.filesCount !== undefined && (
                  <p className="text-sm text-gray-400 mt-1">
                    Files in bucket: {validationResult.filesCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Folder Creation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Required Folders</h3>
          <button
            onClick={createFolders}
            disabled={isCreatingFolders || !validationResult?.success}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isCreatingFolders ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Folders'
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {['images', 'videos', 'audio', '3d', 'other'].map((folder) => {
            const result = folderResults.find(r => r.folder === folder);
            const success = result?.success ?? false;
            
            return (
              <div key={folder} className={`p-3 rounded border ${success ? 'border-green-600 bg-green-900 bg-opacity-20' : 'border-gray-600 bg-gray-700'}`}>
                <div className="flex items-center gap-2">
                  {result ? getStatusIcon(success) : <div className="w-5 h-5" />}
                  <span className="font-mono text-sm">{folder}/</span>
                </div>
                {result?.error && (
                  <p className="text-xs text-red-400 mt-1">{result.error}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Troubleshooting Guide */}
      {!validationResult?.success && (
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-400 mb-2">Troubleshooting Steps</h3>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>Check your environment variables in <code className="bg-gray-700 px-1 rounded">.env</code></li>
            <li>Verify your Supabase URL and anon key are correct</li>
            <li>Create a storage bucket named "files" in your Supabase dashboard</li>
            <li>Set up proper RLS policies for the storage bucket</li>
            <li>Check the browser console for detailed error messages</li>
          </ol>
        </div>
      )}
    </div>
  );
}; 