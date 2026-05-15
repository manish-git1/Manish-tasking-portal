'use client';
import { create } from 'zustand';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: { _id: string; name: string; email: string; avatar?: string; department?: string };
  createdBy: { _id: string; name: string; email: string };
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  tags: string[];
  comments: { _id: string; author: string; authorName: string; text: string; createdAt: string }[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  total: number;
  isLoading: boolean;
  filter: { status: string; priority: string; search: string };
  setTasks: (tasks: Task[], total?: number) => void;
  setCurrentTask: (t: Task | null) => void;
  setLoading: (v: boolean) => void;
  setFilter: (f: Partial<TaskState['filter']>) => void;
  updateTaskInList: (task: Task) => void;
  removeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>()((set) => ({
  tasks: [],
  currentTask: null,
  total: 0,
  isLoading: false,
  filter: { status: 'all', priority: 'all', search: '' },
  setTasks: (tasks, total) => set({ tasks, total: total ?? tasks.length }),
  setCurrentTask: (currentTask) => set({ currentTask }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilter: (f) => set((s) => ({ filter: { ...s.filter, ...f } })),
  updateTaskInList: (task) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t._id === task._id ? task : t)) })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) })),
}));
