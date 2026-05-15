'use client';
import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedTask?: { _id: string; title: string };
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/notifications');
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await axios.patch('/api/notifications', { id });
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await axios.patch('/api/notifications', { markAllRead: true });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllRead };
}
