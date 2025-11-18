
import React, { useState, FormEvent, useMemo } from 'react';
import { Task, PriorityLevel, TaskStatus } from '../types';
import { TrashIcon, ClockIcon, PencilIcon, ChevronDownIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id:string) => void;
  onDelete: (id:string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (taskId: string, subtaskText: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const priorityConfig: Record<PriorityLevel, { color: string; label: string }> = {
  0: { color: 'bg-red-600', label: '0' },
  1: { color: 'bg-orange-500', label: '1' },
  10: { color: 'bg-amber-400', label: '10' },
  100: { color: 'bg-blue-400', label: '100' },
  1000: { color: 'bg-slate-300', label: '1k' },
};

const statusConfig: Record<TaskStatus, { bg: string; text: string; border: string }> = {
    [TaskStatus.Pending]: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    [TaskStatus.InProgress]: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    [TaskStatus.Waiting]: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    [TaskStatus.Completed]: { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100' },
};

const formatDate = (isoString: string | null) => {
    if (!isoString) return '';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(isoString));
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit, onAddSubtask, onToggleSubtask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < today;

  const currentPriority = priorityConfig[task.priority] || priorityConfig[100];
  const currentStatus = statusConfig[task.status] || statusConfig[TaskStatus.Pending];

  const handleAddSubtask = (e: FormEvent) => {
    e.preventDefault();
    onAddSubtask(task.id, newSubtaskText);
    setNewSubtaskText('');
  };
  
  const subtaskProgress = useMemo(() => {
    if (!task.subtasks || task.subtasks.length === 0) {
        return { completed: 0, total: 0, percentage: 0 };
    }
    const completed = task.subtasks.filter(st => st.completed).length;
    const total = task.subtasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  }, [task.subtasks]);

  // Support for legacy data display
  // @ts-ignore
  const displayPrimary = task.primaryCategory || task.category; 
  const displaySecondary = task.secondaryCategory || 'Geral';

  return (
    <li className={`flex flex-col rounded-lg border-2 transition-all hover:shadow-md ${isOverdue ? 'border-red-300' : 'border-transparent'} ${currentStatus.bg} ${currentStatus.border}`}>
      <div className="flex items-stretch min-h-[80px]">
        {/* Priority Strip */}
        <div className={`w-8 flex flex-col items-center justify-center rounded-l-md text-white font-bold text-xs ${currentPriority.color}`}>
            <span className="-rotate-90 whitespace-nowrap">{currentPriority.label}</span>
        </div>
        
        <div className="flex-1 p-3 flex flex-col gap-2">
            {/* Header Row: Checkbox, Name, Status Badge, Actions */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="checkbox"
                        checked={task.completed || task.status === TaskStatus.Completed}
                        onChange={() => onToggle(task.id)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                             <span className={`font-bold text-lg ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {task.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${currentStatus.border} ${currentStatus.bg} ${currentStatus.text}`}>
                                {task.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs mt-0.5">
                            <span className="font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">
                                {displayPrimary}
                            </span>
                            {displaySecondary && displaySecondary !== 'Geral' && (
                                <>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-500 italic">
                                        {displaySecondary}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={() => onEdit(task)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Workflow Actions Display */}
            {!task.completed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                    {/* Last Action (Subtle) */}
                    {task.lastAction && (
                        <div className="text-xs text-slate-500 border-l-2 border-slate-300 pl-2">
                            <span className="font-semibold block uppercase text-[10px] tracking-wide">Última coisa feita:</span>
                            {task.lastAction}
                        </div>
                    )}
                    
                    {/* Next Action (Prominent) */}
                    {task.nextAction && (
                        <div className="text-sm text-slate-800 border-l-4 border-blue-500 pl-2 bg-white/50 py-1 rounded-r-md">
                            <span className="font-bold text-blue-600 block text-xs uppercase tracking-wide mb-0.5">Próxima coisa a fazer:</span>
                            {task.nextAction}
                        </div>
                    )}
                </div>
            )}

            {/* Parallel Action Warning (Only if Waiting) */}
            {task.status === TaskStatus.Waiting && task.parallelAction && !task.completed && (
                <div className="mt-2 bg-purple-100 border border-purple-200 p-2 rounded-md flex items-start gap-2 animate-pulse-slow">
                    <div className="text-purple-600 mt-0.5">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h-2.433a1.75 1.75 0 0 0-.865.226l-2.343 1.171a.75.75 0 0 0-.257 1.064c.215.33.654.57.969.57h18.25c.314 0 .752-.24.967-.57a.75.75 0 0 0-.257-1.064l-2.343-1.172a1.75 1.75 0 0 0-.865-.226h-1.263l-.248.246Z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M9.75 2.5c-2.314 0-4.293 1.463-5.074 3.5h10.648c-.78-2.037-2.76-3.5-5.074-3.5ZM3.503 7.5a6.25 6.25 0 0 1 12.494 0H3.503Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-purple-800 block">AGUARDANDO - Pode fazer em paralelo:</span>
                        <span className="text-sm text-purple-900">{task.parallelAction}</span>
                    </div>
                </div>
            )}

            {/* Progress Bar for Subtasks */}
            {subtaskProgress.total > 0 && (
                <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${task.completed ? 'bg-slate-400' : 'bg-blue-600'}`} style={{ width: `${subtaskProgress.percentage}%` }}></div>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{subtaskProgress.completed}/{subtaskProgress.total}</span>
                </div>
            )}
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
       <div className="px-4 pb-4 bg-white/50 border-t border-slate-200/60">
           
           {task.description && (
            <div className="mt-3 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                <span className="font-bold text-xs text-slate-400 uppercase block mb-1">Descrição</span>
                {task.description}
            </div>
           )}

           <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Checklist / Sub-tarefas</h4>
                <ul className="space-y-2 mb-3">
                    {(!task.subtasks || task.subtasks.length === 0) && (
                         <p className="text-sm text-slate-400 italic">Nenhuma sub-tarefa.</p>
                    )}
                    {task.subtasks?.map(subtask => (
                    <li key={subtask.id} className="flex items-center gap-3 group">
                        <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() => onToggleSubtask(task.id, subtask.id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
                        />
                        <span className={`text-sm ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {subtask.text}
                        </span>
                    </li>
                    ))}
                </ul>

                <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <input
                        type="text"
                        value={newSubtaskText}
                        onChange={(e) => setNewSubtaskText(e.target.value)}
                        placeholder="Nova sub-tarefa..."
                        className="flex-1 px-3 py-1.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-md font-semibold hover:bg-slate-300">Add</button>
                </form>
           </div>

           <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-end">
                {task.notes && (
                    <div className="flex-1 mr-4">
                        <p className="text-xs p-2 bg-yellow-50 border border-yellow-100 rounded-md text-slate-600 italic">
                             <span className="not-italic font-bold text-yellow-600 block mb-1">Obs:</span> {task.notes}
                        </p>
                    </div>
                )}
                <div className="text-[10px] text-slate-400 text-right flex flex-col gap-0.5">
                    <span>Criada: {formatDate(task.taskDate)}</span>
                    {task.dueDate && (
                        <span className={`${isOverdue ? 'text-red-500 font-bold' : ''}`}>Vence: {formatDate(task.dueDate)}</span>
                    )}
                    {task.completionDate && <span>Concluída: {formatDate(task.completionDate)}</span>}
                </div>
           </div>
       </div>
      )}
    </li>
  );
};

export default TaskItem;
