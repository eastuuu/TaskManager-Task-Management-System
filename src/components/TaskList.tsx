import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';
import { AddTaskForm } from './AddTaskForm';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Could not load tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (title: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error('Failed to add task');
      const newTask = await response.json();
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.error(err);
      // Ideally show a toast notification here
    }
  };

  const toggleTask = async (id: number, isCompleted: boolean) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted } : t))
    );

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted }),
      });
      if (!response.ok) throw new Error('Failed to update task');
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isCompleted: !isCompleted } : t))
      );
      console.error(err);
    }
  };

  const editTask = async (id: number, title: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t))
    );

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error('Failed to update task');
    } catch (err) {
      // Revert on error - we need to fetch the original title or store it before update
      // For simplicity, we'll just re-fetch all tasks on error
      fetchTasks();
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
    } catch (err) {
      // Revert on error
      setTasks(previousTasks);
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p>Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle size={32} className="mb-2" />
        <p>{error}</p>
        <button 
          onClick={() => { setIsLoading(true); fetchTasks(); }}
          className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold text-black tracking-tight mb-2">
          TaskManager
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-slate-500 font-medium">
            Simple. Smart. Organized.
          </p>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progress</span>
              <span className="text-sm font-bold text-indigo-600">{completedCount}/{totalCount} Done</span>
            </div>
            <div className="w-10 h-10 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={100}
                  strokeDashoffset={100 - progress}
                  className="text-indigo-500 transition-all duration-500 ease-out"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <AddTaskForm onAdd={addTask} />

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">All caught up!</h3>
              <p className="text-slate-500">You have no pending tasks. Enjoy your day!</p>
            </motion.div>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={editTask}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
