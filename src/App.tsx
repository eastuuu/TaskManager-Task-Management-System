import { TaskList } from './components/TaskList';

export default function App() {
  return (
    <div className="min-h-screen bg-sky-100 text-slate-900 font-sans selection:bg-sky-200 selection:text-sky-900">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <TaskList />
      </div>
    </div>
  );
}
