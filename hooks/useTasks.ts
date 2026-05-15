'use client';
import { useCallback } from 'react';
import { useTaskStore, Task } from '@/store/taskStore';
import axios from 'axios';
import toast from 'react-hot-toast';

export function useTasks() {
  const { tasks, total, isLoading, filter, setTasks, setLoading, setFilter, updateTaskInList, removeTask } = useTaskStore();

  const fetchTasks = useCallback(async (params?: { status?: string; priority?: string; search?: string; page?: number }) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== 'all') query.set('status', params.status);
      if (params?.priority && params.priority !== 'all') query.set('priority', params.priority);
      if (params?.search) query.set('search', params.search);
      if (params?.page) query.set('page', String(params.page));
      const { data } = await axios.get(`/api/tasks?${query}`);
      setTasks(data.data.tasks, data.data.total);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTasks]);

  const createTask = useCallback(async (payload: { title: string; description: string; assignedTo: string; priority: string; deadline: string; tags?: string[] }) => {
    const { data } = await axios.post('/api/tasks', payload);
    toast.success('Task created!');
    return data.data.task as Task;
  }, []);

  const updateTask = useCallback(async (id: string, payload: Record<string, unknown>) => {
    const { data } = await axios.put(`/api/tasks/${id}`, payload);
    updateTaskInList(data.data.task);
    toast.success('Task updated!');
    return data.data.task as Task;
  }, [updateTaskInList]);

  const deleteTask = useCallback(async (id: string) => {
    await axios.delete(`/api/tasks/${id}`);
    removeTask(id);
    toast.success('Task deleted');
  }, [removeTask]);

  const updateStatus = useCallback(async (taskId: string, status: string) => {
    const { data } = await axios.patch('/api/tasks/update-status', { taskId, status });
    updateTaskInList(data.data.task);
    toast.success('Status updated!');
    return data.data.task as Task;
  }, [updateTaskInList]);

  const requestReschedule = useCallback(async (taskId: string, newDeadline: string, reason: string) => {
    await axios.post('/api/tasks/reschedule', { taskId, newDeadline, reason });
    toast.success('Reschedule request submitted!');
  }, []);

  const addComment = useCallback(async (taskId: string, text: string) => {
    const { data } = await axios.patch(`/api/tasks/${taskId}`, { action: 'add_comment', text });
    updateTaskInList(data.data.task);
    return data.data.task as Task;
  }, [updateTaskInList]);

  return { tasks, total, isLoading, filter, fetchTasks, createTask, updateTask, deleteTask, updateStatus, requestReschedule, addComment, setFilter };
}
