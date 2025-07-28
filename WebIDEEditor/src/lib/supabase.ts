import { createClient } from '@supabase/supabase-js';
import { DBProject } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth functions
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    return await supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    return await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    return await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Project functions
export const getUserProjects = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('No user found') };

    return await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
  } catch (error) {
    console.error('Error getting user projects:', error);
    throw error;
  }
};

export const createProject = async (project: Partial<DBProject>) => {
  try {
    return await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (id: string, updates: Partial<DBProject>) => {
  try {
    return await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// File functions
export const createFile = async (file: {
  project_id: string;
  name: string;
  type: string;
  content: string;
}) => {
  try {
    return await supabase
      .from('files')
      .insert(file)
      .select()
      .single();
  } catch (error) {
    console.error('Error creating file:', error);
    throw error;
  }
};

export const updateFile = async (id: string, updates: {
  content?: string;
  type?: string;
}) => {
  try {
    return await supabase
      .from('files')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
};

export const getProjectFiles = async (projectId: string) => {
  try {
    return await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .order('name');
  } catch (error) {
    console.error('Error getting project files:', error);
    throw error;
  }
};

// Storage functions - improved error handling
export const getFiles = async (options?: { limit?: number; offset?: number; folder?: string }) => {
  try {
    const limit = options?.limit;
    const offset = options?.offset || 0;
    const folderFilter = options?.folder;
    console.log('Starting to load files...', { limit, offset, folderFilter });
    
    // First, let's check what buckets exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets);
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw new Error(`Cannot access storage: ${bucketsError.message}`);
    }

    // Check if 'files' bucket exists
    const filesBucket = buckets?.find((b: any) => b.name === 'files');
    if (!filesBucket) {
      console.warn('Files bucket not found. Available buckets:', buckets?.map((b: any) => b.name));
      return [];
    }

    console.log('Files bucket found:', filesBucket);

    const allFiles = [];
    const folders = folderFilter ? [folderFilter] : ['images', 'videos', 'audio', '3d', 'other'];

    // Try each folder
    for (const folder of folders) {
      try {
        console.log(`Checking folder: ${folder}`);
        
        const { data: folderFiles, error: folderError } = await supabase.storage
          .from('files')
          .list(folder, { 
            limit: limit === undefined || limit === null ? 1000 : limit + offset,
            sortBy: { column: 'name', order: 'asc' }
          });

        console.log(`Folder ${folder}:`, folderFiles, 'Error:', folderError);

        if (folderError) {
          console.warn(`Error accessing folder ${folder}:`, folderError);
          continue; // Skip this folder and continue with others
        }

        if (folderFiles && folderFiles.length > 0) {
          // Filter out directories and system files, but don't require an id
          const actualFiles = folderFiles.filter((file: any) => 
            file.name && 
            file.name !== '.emptyFolderPlaceholder' &&
            file.name !== '.placeholder' &&
            !file.name.endsWith('/') &&
            file.name.includes('.') // Make sure it's a file with extension
          );

          // Apply offset and limit for pagination
          const pagedFiles =
            limit === undefined || limit === null
              ? actualFiles
              : actualFiles.slice(offset, offset + limit);

          for (const file of pagedFiles) {
            try {
              const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(`${folder}/${file.name}`);

              allFiles.push({
                name: file.name,
                originalName: getOriginalName(file.name),
                id: file.id || `${folder}-${file.name}-${Date.now()}`,
                type: folder,
                url: publicUrl,
                folder: folder,
                size: file.metadata?.size || 0,
                lastModified: file.updated_at || file.created_at || new Date().toISOString()
              });
            } catch (urlError) {
              console.error(`Error getting URL for ${file.name}:`, urlError);
            }
          }
        }
      } catch (error) {
        console.warn(`Error accessing folder ${folder}:`, error);
      }
    }

    // For now, just return the files array. Optionally, you could return total count for UI.
    return allFiles;
    
  } catch (error) {
    console.error('Error in getFiles:', error);
    throw new Error(`Failed to load files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getFileType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'images';
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'videos';
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return 'audio';
  if (['glb', 'gltf', 'obj', 'fbx'].includes(ext)) return '3d';
  return 'other';
};

export const getOriginalName = (fileName: string): string => {
  // Remove timestamp and random ID suffixes
  const parts = fileName.split('.');
  if (parts.length < 2) return fileName;
  
  const nameWithoutExt = parts.slice(0, -1).join('.');
  const extension = parts[parts.length - 1];
  
  // Remove pattern like "-abc123-1234567890"
  const cleanName = nameWithoutExt.replace(/-[a-z0-9]+-\d+$/, '');
  
  return `${cleanName}.${extension}`;
};

export const getContentType = (extension: string): string => {
  const contentTypes: Record<string, string> = {
    'glb': 'model/gltf-binary',
    'gltf': 'model/gltf+json',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac'
  };
  
  return contentTypes[extension] || 'application/octet-stream';
};

// Utility functions for bucket setup and validation
export const validateSupabaseConnection = async () => {
  try {
    console.log('Validating Supabase connection...');
    
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.warn('Auth error (this might be normal):', authError);
    }
    
    // Test storage access
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      throw new Error(`Storage access failed: ${bucketsError.message}`);
    }
    
    console.log('Available buckets:', buckets?.map((b: any) => b.name));
    
    // Check if files bucket exists
    const filesBucket = buckets?.find((b: any) => b.name === 'files');
    if (!filesBucket) {
      console.warn('Files bucket not found. You may need to create it in your Supabase dashboard.');
      return {
        success: false,
        message: 'Files bucket not found. Please create a bucket named "files" in your Supabase storage.',
        buckets: buckets?.map((b: any) => b.name) || []
      };
    }
    
    console.log('Files bucket found:', filesBucket);
    
    // Test listing files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('files')
      .list('', { limit: 1 });
    
    if (filesError) {
      console.warn('Error listing files (this might be a permissions issue):', filesError);
      return {
        success: false,
        message: `Cannot list files: ${filesError.message}. Check your storage policies.`,
        buckets: buckets?.map((b: any) => b.name) || []
      };
    }
    
    return {
      success: true,
      message: 'Supabase connection validated successfully',
      buckets: buckets?.map((b: any) => b.name) || [],
      filesCount: files?.length || 0
    };
    
  } catch (error) {
    console.error('Supabase validation failed:', error);
    return {
      success: false,
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      buckets: []
    };
  }
};

// Debug function to test storage access step by step
export const debugStorageAccess = async () => {
  console.log('=== DEBUGGING STORAGE ACCESS ===');
  
  try {
    // Step 1: Test basic connection
    console.log('Step 1: Testing basic connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth result:', { user: user ? 'Logged in' : 'Not logged in', error: authError });
    
    // Step 2: List buckets with more detail
    console.log('Step 2: Listing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Full buckets response:', { data: buckets, error: bucketsError });
    console.log('Buckets result:', { buckets: buckets?.map((b: any) => b.name), error: bucketsError });
    
    if (bucketsError) {
      console.error('❌ Cannot list buckets:', bucketsError);
      console.log('This might be a permissions issue. Check your anon key permissions.');
      return;
    }
    
    if (!buckets || buckets.length === 0) {
      console.log('⚠️ No buckets found. This could mean:');
      console.log('1. The bucket exists but you don\'t have permission to list buckets');
      console.log('2. The bucket is in a different state');
      console.log('3. There\'s an issue with your anon key');
    }
    
    // Step 3: Check for files bucket
    console.log('Step 3: Checking for files bucket...');
    const filesBucket = buckets?.find((b: any) => b.name === 'files');
    console.log('Files bucket found:', !!filesBucket);
    
    if (filesBucket) {
      console.log('Files bucket details:', filesBucket);
    }
    
    // Step 4: Try to access the files bucket directly even if not in list
    console.log('Step 4: Trying to access files bucket directly...');
    try {
      const { data: directFiles, error: directError } = await supabase.storage
        .from('files')
        .list('', { limit: 1 });
      console.log('Direct files bucket access:', { files: directFiles?.length || 0, error: directError });
      
      if (directError) {
        console.log('Direct access error details:', directError);
      }
    } catch (directAccessError) {
      console.log('Direct access exception:', directAccessError);
    }
    
    // Step 5: Test listing root files
    console.log('Step 5: Testing root file listing...');
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from('files')
      .list('', { limit: 10 });
    console.log('Root files result:', { files: rootFiles?.length || 0, error: rootError });
    
    if (rootError) {
      console.log('Root files error details:', rootError);
    }
    
    // Step 6: Test listing images folder
    console.log('Step 6: Testing images folder...');
    const { data: imageFiles, error: imageError } = await supabase.storage
      .from('files')
      .list('images', { limit: 10 });
    console.log('Images folder result:', { files: imageFiles?.length || 0, error: imageError });
    
    if (imageFiles && imageFiles.length > 0) {
      console.log('Image files found:', imageFiles.map((f: any) => f.name));
      
      // Step 7: Test getting public URL for first image
      if (imageFiles[0]) {
        console.log('Step 7: Testing public URL generation...');
        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(`images/${imageFiles[0].name}`);
        console.log('Public URL for first image:', publicUrl);
      }
    }
    
    // Step 8: Test other folders
    const folders = ['videos', 'audio', '3d', 'other'];
    for (const folder of folders) {
      console.log(`Step 8: Testing ${folder} folder...`);
      const { data: folderFiles, error: folderError } = await supabase.storage
        .from('files')
        .list(folder, { limit: 5 });
      console.log(`${folder} folder result:`, { files: folderFiles?.length || 0, error: folderError });
    }
    
    console.log('=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

export const createRequiredFolders = async () => {
  const folders = ['images', 'videos', 'audio', '3d', 'other'];
  const results = [];
  
  for (const folder of folders) {
    try {
      // Create a placeholder file to ensure the folder exists
      const placeholderContent = new Blob([''], { type: 'text/plain' });
      const { error } = await supabase.storage
        .from('files')
        .upload(`${folder}/.placeholder`, placeholderContent, {
          upsert: true
        });
      
      if (error) {
        console.warn(`Could not create folder ${folder}:`, error);
        results.push({ folder, success: false, error: error.message });
      } else {
        console.log(`Folder ${folder} ready`);
        results.push({ folder, success: true });
      }
    } catch (error) {
      console.warn(`Error creating folder ${folder}:`, error);
      results.push({ 
        folder, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return results;
};