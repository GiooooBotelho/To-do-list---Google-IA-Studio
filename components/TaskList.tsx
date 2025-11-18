import React, { useState, useMemo } from 'react';
import { Task, Priority, Category } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (taskId: string, subtaskText: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const priorityFilterOptions: Array<'All' | Priority> = ['All', Priority.High, Priority.Medium, Priority.Low];
const categoryFilterOptions: Array<'All' | Category> = ['All', ...Object.values(Category)];

const priorityDisplay: Record<'All' | Priority, string> = {
    'All': 'Todas',
    [Priority.High]: 'Alta',
    [Priority.Medium]: 'Média',
    [Priority.Low]: 'Baixa',
};

const categoryDisplay: Record<'All' | Category, string> = {
    'All': 'Todas',
    [Category.SAE]: 'SAE',
    [Category.Printing3D]: '3D Printing',
    [Category.MasterListPDM]: 'Master List/PDM',
    [Category.Other]: 'Outro',
};

const TaskList: React.FC<TaskListProps> = ({ title, tasks, onToggle, onDelete, onEdit, onAddSubtask, onToggleSubtask }) => {
  const [activePriorityFilter, setActivePriorityFilter] = useState<'All' | Priority>('All');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'All' | Category>('All');

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (activePriorityFilter !== 'All') {
      result = result.filter(task => task.priority === activePriorityFilter);
    }
    
    if (activeCategoryFilter !== 'All') {
      result = result.filter(task => task.category === activeCategoryFilter);
    }

    return result;
  }, [tasks, activePriorityFilter, activeCategoryFilter]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-500 min-w-[70px]">Prioridade:</span>
                {priorityFilterOptions.map(option => (
                    <button
                    key={option}
                    onClick={() => setActivePriorityFilter(option)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                        activePriorityFilter === option
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    >
                    {priorityDisplay[option]}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                 <span className="text-sm font-medium text-slate-500 min-w-[70px]">Categoria:</span>
                {categoryFilterOptions.map(option => (
                    <button
                    key={option}
                    onClick={() => setActiveCategoryFilter(option)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                        activeCategoryFilter === option
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    >
                    {categoryDisplay[option]}
                    </button>
                ))}
            </div>
        </div>
      </div>
      {filteredTasks.length > 0 ? (
        <ul className="space-y-3">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
            />
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">
            {tasks.length === 0 
              ? 'Nenhuma tarefa aqui.'
              : `Nenhuma tarefa corresponde aos filtros selecionados.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskList;