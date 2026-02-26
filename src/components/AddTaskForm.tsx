import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface AddTaskFormProps {
  onAdd: (title: string) => Promise<void>;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(title);
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 relative z-10">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
        <div className="relative flex items-center bg-white rounded-xl shadow-sm">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            className="w-full pl-5 pr-16 py-4 bg-transparent border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-0 text-lg outline-none"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Plus size={20} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
