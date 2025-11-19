
import React, { useRef } from 'react';
import { PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from './Icons';

interface HeaderProps {
  onAddTask: () => void;
  onExport: (format: 'xlsx' | 'csv') => void;
  onImport: (file: File) => void;
}

const Header: React.FC<HeaderProps> = ({ onAddTask, onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        onImport(e.target.files[0]);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-slate-900">Minhas Tarefas</h1>
          
          <div className="flex items-center gap-2">
             {/* Import Button */}
             <div className="relative">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Importar Excel/CSV"
                >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    <span className="sr-only">Importar</span>
                </button>
             </div>

             {/* Export Button */}
             <div className="group relative">
                <button 
                    className="flex items-center justify-center p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Exportar Tarefas"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                {/* Hover Dropdown for Export */}
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 hidden group-hover:block">
                    <button onClick={() => onExport('xlsx')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Exportar Excel</button>
                    <button onClick={() => onExport('csv')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Exportar CSV</button>
                </div>
             </div>

             {/* Separator */}
             <div className="h-6 w-px bg-slate-200 mx-2 hidden lg:block"></div>

             <button
                onClick={onAddTask}
                className="hidden lg:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
             >
                <PlusIcon className="w-5 h-5" />
                Adicionar Tarefa
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
