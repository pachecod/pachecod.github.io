# Supabase Setup Guide

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Supabase Project Setup

### 1. Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket called `files`
4. Set the bucket to **public** (if you want files to be publicly accessible)
5. Configure RLS (Row Level Security) policies

### 2. Storage Bucket Policies

Add these policies to your `files` bucket:

**For public read access:**
```sql
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'files');
```

**For authenticated uploads:**
```sql
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');
```

**For authenticated deletes:**
```sql
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'files' AND auth.role() = 'authenticated');
```

### 3. Create Required Folders

In your `files` bucket, create these folders:
- `images/`
- `videos/`
- `audio/`
- `3d/`
- `other/`

### 4. Database Tables (if using projects feature)

Create these tables in your Supabase database:

```sql
-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  framework TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Policies for files
CREATE POLICY "Users can view files in their projects" ON files FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can insert files in their projects" ON files FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update files in their projects" ON files FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete files in their projects" ON files FOR DELETE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid())
);
```

## Common Issues and Solutions

### 1. "Cannot access storage" error
- Check that your bucket exists and is named `files`
- Verify your environment variables are correct
- Ensure your anon key has the necessary permissions

### 2. "Upload failed" errors
- Check bucket permissions
- Verify file size limits (default is 50MB)
- Ensure content type is properly set

### 3. "Missing Supabase environment variables"
- Create a `.env` file in your project root
- Add the required environment variables
- Restart your development server

### 4. Files not showing up
- Check that folders exist in your bucket
- Verify RLS policies allow read access
- Check browser console for specific error messages

## Netlify Deployment

For Netlify deployment, add your environment variables in the Netlify dashboard:

1. Go to Site settings > Environment variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy your site

## Testing

After setup, you can test the integration by:

1. Opening your app in the browser
2. Opening the browser console (F12)
3. Trying to upload a file
4. Checking for any error messages in the console

The improved error handling will now provide more detailed information about what's going wrong. 