
import React, { useState, useMemo } from 'react';
import { Task, PriorityLevel, PrimaryCategory, SecondaryCategory } from '../types';
import TaskItem from './TaskItem';
import { StarIcon } from './Icons';

interface TaskListProps {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onToggleToday: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (taskId: string, subtaskText: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  dateFilterType?: 'creation' | 'completion';
}

const priorityFilterOptions: Array<'All' | PriorityLevel> = ['All', 0, 1, 10, 100, 1000];
const primaryCategoryOptions: Array<'All' | PrimaryCategory> = ['All', ...Object.values(PrimaryCategory)];
const secondaryCategoryOptions: Array<'All' | SecondaryCategory> = [
    'All',
    'Geral', 'Água', 'Anvisa', 'Brinde/Evento', 'Calibração', 'Corte a Laser', 'Desenho Técnico', 'Embalagem', 'ESD', 'ETO', 
    'Gravação a Laser', 'Inventário', 'Manufatura', 'Mestrado', 'Partículas', 'Solda a Laser', 'Visita'
];

const priorityDisplay: Record<string, string> = {
    'All': 'Todas',
    '0': '0 - Crítico',
    '1': '1 - Urgente',
    '10': '10 - Alta',
    '100': '100 - Normal',
    '1000': '1000 - Baixa',
};

const TaskList: React.FC<TaskListProps> = ({ 
    title, 
    tasks, 
    onToggle,
    onToggleToday,
    onDelete, 
    onEdit, 
    onAddSubtask, 
    onToggleSubtask,
    dateFilterType 
}) => {
  const [activePriorityFilter, setActivePriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [activePrimaryFilter, setActivePrimaryFilter] = useState<'All' | PrimaryCategory>('All');
  const [activeSecondaryFilter, setActiveSecondaryFilter] = useState<'All' | SecondaryCategory>('All');
  
  // Date Filter State
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Today Filter State
  const [filterToday, setFilterToday] = useState(false);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // 1. Today Filter (New)
    if (filterToday) {
        result = result.filter(task => task.isToday);
    }

    // 2. Priority Filter
    if (activePriorityFilter !== 'All') {
      result = result.filter(task => task.priority === activePriorityFilter);
    }
    
    // 3. Primary Category Filter
    if (activePrimaryFilter !== 'All') {
        // Handle potential legacy data where primaryCategory might be undefined but category exists
        result = result.filter(task => {
            // @ts-ignore
            const pCat = task.primaryCategory || task.category;
            return pCat === activePrimaryFilter;
        });
    }

    // 4. Secondary Category Filter
    if (activeSecondaryFilter !== 'All') {
        result = result.filter(task => (task.secondaryCategory || 'Geral') === activeSecondaryFilter);
    }

    // 5. Date Filter
    if (dateFilterType) {
        if (filterStartDate) {
            result = result.filter(task => {
                const dateToCheck = dateFilterType === 'creation' ? task.taskDate : task.completionDate;
                if (!dateToCheck) return false;
                return dateToCheck.split('T')[0] >= filterStartDate;
            });
        }
        if (filterEndDate) {
            result = result.filter(task => {
                const dateToCheck = dateFilterType === 'creation' ? task.taskDate : task.completionDate;
                if (!dateToCheck) return false;
                return dateToCheck.split('T')[0] <= filterEndDate;
            });
        }
    }
    
    // Default sort: Today > Priority (ascending numbers) > Date
    return result.sort((a, b) => {
        // 1. Today check
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;

        // 2. Priority check
        const prioDiff = (a.priority || 100) - (b.priority || 100);
        if (prioDiff !== 0) return prioDiff;
        
        // 3. Date check
        return new Date(a.taskDate).getTime() - new Date(b.taskDate).getTime();
    });

  }, [tasks, activePriorityFilter, activePrimaryFilter, activeSecondaryFilter, filterStartDate, filterEndDate, dateFilterType, filterToday]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm flex flex-col h-full">
      <div className="flex flex-col mb-6 gap-4">
        <div className="flex justify-between items-end border-b pb-2">
            <h2 className="text-xl font-bold text-slate-800">{title} <span className="text-sm font-normal text-slate-400 ml-2">({filteredTasks.length})</span></h2>
            {dateFilterType && (
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Filtro: Data de {dateFilterType === 'creation' ? 'Criação' : 'Conclusão'}
                </span>
            )}
        </div>
        
        <div className="flex flex-col gap-3">
            {/* Quick Filter: Today */}
            <div>
                <button
                    onClick={() => setFilterToday(!filterToday)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                        filterToday
                        ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm ring-1 ring-amber-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600'
                    }`}
                >
                    <StarIcon className={`w-4 h-4 ${filterToday ? 'fill-amber-600' : ''}`} />
                    {filterToday ? 'Exibindo Apenas "Hoje"' : 'Filtrar Apenas "Hoje"'}
                </button>
            </div>

            {/* Priority Filter (Buttons) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-xs font-bold text-slate-400 uppercase min-w-[60px]">Prioridade:</span>
                {priorityFilterOptions.map(option => (
                    <button
                    key={option}
                    onClick={() => setActivePriorityFilter(option)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all border ${
                        activePriorityFilter === option
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                    >
                    {priorityDisplay[String(option)]}
                    </button>
                ))}
            </div>

            {/* Category Filters (Dropdowns) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <span className="text-xs font-bold text-slate-400 uppercase min-w-[60px] hidden sm:block">Categorias:</span>
                
                <div className="grid grid-cols-2 gap-3 flex-1">
                    {/* Primary Category Dropdown */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-0.5 sm:hidden">Cat. Primária</label>
                        <select
                            value={activePrimaryFilter}
                            onChange={(e) => setActivePrimaryFilter(e.target.value as PrimaryCategory | 'All')}
                            className="w-full px-3 py-1.5 text-xs bg-white text-slate-700 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:border-blue-400"
                        >
                            {primaryCategoryOptions.map(option => (
                                <option key={option} value={option}>{option === 'All' ? 'Todas Primárias' : option}</option>
                            ))}
                        </select>
                    </div>

                    {/* Secondary Category Dropdown */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-0.5 sm:hidden">Cat. Secundária</label>
                        <select
                            value={activeSecondaryFilter}
                            onChange={(e) => setActiveSecondaryFilter(e.target.value as SecondaryCategory | 'All')}
                            className="w-full px-3 py-1.5 text-xs bg-white text-slate-700 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:border-blue-400"
                        >
                            {secondaryCategoryOptions.map(option => (
                                <option key={option} value={option}>{option === 'All' ? 'Todas Secundárias' : option}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

             {/* Date Range Filter */}
             {dateFilterType && (
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">
                    <span className="text-xs font-bold text-slate-700 uppercase min-w-[60px]">Período:</span>
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            className="px-2 py-1 text-xs bg-white text-slate-900 border border-slate-300 rounded shadow-sm focus:outline-none focus:border-blue-500"
                            aria-label="Data Inicial"
                        />
                        <span className="text-xs text-slate-500">até</span>
                        <input 
                            type="date" 
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            className="px-2 py-1 text-xs bg-white text-slate-900 border border-slate-300 rounded shadow-sm focus:outline-none focus:border-blue-500"
                            aria-label="Data Final"
                        />
                        {(filterStartDate || filterEndDate) && (
                             <button 
                                onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                                className="ml-2 text-xs text-red-600 hover:text-red-800 font-bold hover:underline"
                             >
                                Limpar
                             </button>
                        )}
                    </div>
                </div>
             )}
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <ul className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-1">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onToggleToday={onToggleToday}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
            />
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-lg flex-1 flex flex-col justify-center">
          <p className="text-slate-400">
            Nenhuma tarefa encontrada.
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskList;