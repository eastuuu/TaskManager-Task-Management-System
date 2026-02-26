import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { Check, Trash2, Calendar, Pencil, X, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number, isCompleted: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(task.id);
    setIsDeleting(false);
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onEdit(task.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formattedDate = new Date(task.createdDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex items-center justify-between p-4 mb-3 bg-white border rounded-xl shadow-sm transition-all duration-200 hover:shadow-md ${
        task.isCompleted ? 'border-gray-100 bg-gray-50/80' : 'border-gray-200 hover:border-indigo-200'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={() => onToggle(task.id, !task.isCompleted)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
            task.isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white scale-100'
              : 'border-gray-300 hover:border-emerald-500 text-transparent hover:bg-emerald-50'
          }`}
          aria-label={task.isCompleted ? "Mark as incomplete" : "Mark as completed"}
        >
          <motion.div
            initial={false}
            animate={{ scale: task.isCompleted ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Check size={14} strokeWidth={3} />
          </motion.div>
        </button>
        
        <div className="flex flex-col min-w-0 flex-1 mr-4">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-1.5 text-base border-2 border-indigo-100 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          ) : (
            <>
              <span className={`text-base font-medium truncate transition-all duration-200 ${
                task.isCompleted ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-700'
              }`}>
                {task.title}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  task.isCompleted ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-400'
                }`}>
                  <Calendar size={10} />
                  {formattedDate}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Save"
            >
              <Save size={18} />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Cancel"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Edit"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};
