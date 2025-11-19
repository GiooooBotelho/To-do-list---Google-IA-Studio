
import React, { useState, FormEvent, useMemo } from 'react';
import { Task, PriorityLevel, TaskStatus } from '../types';
import { TrashIcon, PencilIcon, ChevronDownIcon, StarIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id:string) => void;
  onToggleToday: (id:string) => void;
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
    [TaskStatus.Pending]: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
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

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onToggleToday, onDelete, onEdit, onAddSubtask, onToggleSubtask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < today;

  const currentPriority = priorityConfig[task.priority] || priorityConfig[100];
  const currentStatus = statusConfig[task.status] || statusConfig[TaskStatus.Pending];

  // Today Styling override
  const isToday = !!task.isToday && !task.completed;
  const containerClasses = isToday 
    ? `ring-2 ring-amber-400 bg-yellow-50/80 border-amber-200` 
    : `${currentStatus.bg} ${currentStatus.border}`;

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
    <li className={`flex flex-col rounded-lg border transition-all hover:shadow-md ${isOverdue ? 'border-red-300' : 'border-transparent'} ${containerClasses}`}>
      <div className="flex items-stretch">
        {/* Priority Strip */}
        <div className={`w-6 flex flex-col items-center justify-center rounded-l-md text-white font-bold text-[10px] ${currentPriority.color}`}>
            <span className="-rotate-90 whitespace-nowrap">{currentPriority.label}</span>
        </div>
        
        {/* Main Compact Content Grid */}
        <div className="flex-1 py-2 px-3 grid grid-cols-1 lg:grid-cols-12 gap-2 items-center min-h-[50px]">
            
            {/* Col 1: Checkbox & Name (Expanded to span 9) */}
            <div className="lg:col-span-9 flex items-center gap-2 overflow-hidden">
                <input
                    type="checkbox"
                    checked={task.completed || task.status === TaskStatus.Completed}
                    onChange={() => onToggle(task.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                />
                <div className="flex flex-col truncate flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.name}
                        </span>
                        {isToday && (
                             <StarIcon className="w-3 h-3 text-amber-500 fill-current flex-shrink-0" />
                        )}
                    </div>
                    {/* Mobile-only info (kept for mobile context) */}
                    <div className="flex lg:hidden items-center gap-1 text-[10px] opacity-70 truncate">
                         <span className="uppercase font-bold text-[9px]">{task.status}</span>
                         <span>•</span>
                         <span>{displayPrimary}</span>
                         {task.nextAction && (
                             <>
                                <span>•</span>
                                <span className="text-blue-600 font-medium truncate">Próx: {task.nextAction}</span>
                             </>
                         )}
                    </div>
                </div>
            </div>

            {/* Col 2: Meta & Controls (Span 3) - Right Aligned */}
            <div className="lg:col-span-3 flex items-center justify-end gap-2 pl-2 lg:border-l border-slate-200/50">
                 {/* Desktop Categories/Status */}
                 <div className="hidden lg:flex flex-col items-end gap-0.5 mr-1 min-w-0">
                    <div className="flex gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${currentStatus.border} ${currentStatus.bg} ${currentStatus.text}`}>
                            {task.status}
                        </span>
                    </div>
                    <div className="flex gap-1 text-[9px] justify-end w-full">
                        <span className="font-medium text-slate-500 bg-white/50 px-1 rounded border border-slate-100 whitespace-nowrap">{displayPrimary}</span>
                        {displaySecondary && displaySecondary !== 'Geral' && (
                             <span className="text-slate-400 italic max-w-[80px] truncate" title={displaySecondary}>{displaySecondary}</span>
                        )}
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex items-center gap-0.5">
                    {!task.completed && (
                        <button 
                            onClick={() => onToggleToday(task.id)} 
                            title={isToday ? "Remover de Hoje" : "Fazer Hoje"}
                            className={`p-1 rounded hover:bg-slate-200/50 transition-colors ${isToday ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
                        >
                            <StarIcon className={`w-4 h-4 ${isToday ? 'fill-current' : ''}`} />
                        </button>
                    )}
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Detalhes">
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={() => onEdit(task)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Progress Bar - Slimline */}
      {subtaskProgress.total > 0 && (
        <div className="bg-slate-100 h-1 w-full">
            <div 
                className={`h-full transition-all duration-500 ${task.completed ? 'bg-slate-400' : 'bg-blue-500'}`} 
                style={{ width: `${subtaskProgress.percentage}%` }}
            ></div>
        </div>
      )}
      
      {/* Expanded Content */}
      {isExpanded && (
       <div className="px-4 pb-4 bg-white/50 border-t border-slate-200/60 text-sm">
           
           {/* Action/Workflow Context Section */}
           {(task.nextAction || task.lastAction || (task.status === TaskStatus.Waiting && task.parallelAction)) && (
               <div className="mt-3 flex flex-col gap-2">
                    {task.nextAction && (
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-xs">
                            <span className="font-bold text-blue-600 uppercase min-w-[60px]">Próxima:</span>
                            <span className="text-slate-800 font-medium">{task.nextAction}</span>
                        </div>
                    )}
                    
                    {task.status === TaskStatus.Waiting && task.parallelAction && (
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 p-2 bg-purple-50 border border-purple-200 rounded-md text-xs">
                            <span className="font-bold text-purple-600 uppercase min-w-[60px]">Paralelo:</span>
                            <span className="text-slate-800">{task.parallelAction}</span>
                        </div>
                    )}

                    {task.lastAction && (
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 p-2 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-500">
                             <span className="font-bold text-slate-400 uppercase min-w-[60px]">Última:</span>
                             <span className="italic">{task.lastAction}</span>
                        </div>
                    )}
               </div>
           )}

           {task.description && (
            <div className="mt-3 text-slate-600 bg-white p-2 rounded border border-slate-200 text-xs shadow-sm">
                <span className="font-bold text-slate-400 uppercase block mb-1 text-[10px]">Descrição</span>
                {task.description}
            </div>
           )}

           <div className="mt-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Sub-tarefas ({subtaskProgress.completed}/{subtaskProgress.total})</h4>
                <ul className="space-y-1 mb-2">
                    {(!task.subtasks || task.subtasks.length === 0) && (
                         <p className="text-xs text-slate-400 italic">Nenhuma sub-tarefa.</p>
                    )}
                    {task.subtasks?.map(subtask => (
                    <li key={subtask.id} className="flex items-center gap-2 group">
                        <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() => onToggleSubtask(task.id, subtask.id)}
                            className="h-3 w-3 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
                        />
                        <span className={`text-xs ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
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
                        className="flex-1 px-2 py-1 text-xs bg-white text-slate-900 border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded font-semibold hover:bg-slate-300">Add</button>
                </form>
           </div>

           <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-end">
                <div className="flex-1 mr-4">
                     {task.notes && (
                        <p className="text-xs p-1.5 bg-yellow-50 border border-yellow-100 rounded text-slate-600 italic">
                             <span className="not-italic font-bold text-yellow-600 text-[10px] mr-1">Obs:</span>{task.notes}
                        </p>
                    )}
                </div>
                <div className="text-[10px] text-slate-400 text-right flex flex-col gap-0.5 whitespace-nowrap">
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
