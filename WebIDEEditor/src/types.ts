export enum FileType {
  HTML = 'html',
  CSS = 'css',
  JS = 'javascript',
}

export enum Framework {
  HTML = 'html',
  AFRAME = 'aframe',
  BABYLON = 'babylon',
}

export interface File {
  id: string;
  name: string;
  type: FileType;
  content: string;
}

export interface Project {
  name: string;
  files: File[];
  framework: Framework;
}

export interface DBProject {
  id: string;
  name: string;
  framework: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}