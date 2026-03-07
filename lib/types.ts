export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'member' | 'viewer';
  color: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  members: string[]; // user ids
  taskCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  startDate?: string;
  tags?: string[];
  gitLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Integration {
  id: string;
  taskId: string;
  platform: 'github' | 'gitlab';
  link: string;
  prStatus?: 'open' | 'merged' | 'closed';
}

export type KanbanColumn = {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
};
