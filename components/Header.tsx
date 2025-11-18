
import React from 'react';
import { PlusIcon } from './Icons';

interface HeaderProps {
  onAddTask: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddTask }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-slate-900">Minhas Tarefas</h1>
          <button
            onClick={onAddTask}
            className="hidden lg:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Tarefa
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
