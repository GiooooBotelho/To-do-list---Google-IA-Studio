import React, { useState, FormEvent, useMemo } from 'react';
import { Task, Priority } from '../types';
import { TrashIcon, ClockIcon, PencilIcon, ChevronDownIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id:string) => void;
  onDelete: (id:string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (taskId: string, subtaskText: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const priorityClasses: Record<Priority, string> = {
  [Priority.High]: 'bg-red-500',
  [Priority.Medium]: 'bg-yellow-500',
  [Priority.Low]: 'bg-green-500',
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

  return (
    <li className={`flex flex-col p-4 rounded-lg border transition-all hover:shadow-md ${isOverdue ? 'bg-red-50 border-red-400 hover:border-red-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
      <div className="flex items-start gap-3 w-full">
        <div className={`w-1.5 h-12 mt-1 rounded-full ${priorityClasses[task.priority]}`}></div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                   <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggle(task.id)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {task.name}
                  </span>
                  {subtaskProgress.total > 0 && (
                      <span className="text-xs text-slate-500 font-mono">({subtaskProgress.completed}/{subtaskProgress.total})</span>
                  )}
              </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 hover:text-blue-600 transition-colors" aria-label="Mostrar sub-tarefas">
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              <button
                  onClick={() => onEdit(task)}
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                  aria-label="Editar tarefa"
              >
                  <PencilIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDelete(task.id)} 
                className="text-slate-400 hover:text-red-600 transition-colors"
                aria-label="Deletar tarefa"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className={`mt-1 text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
              {task.description}
            </p>
          )}

          {subtaskProgress.total > 0 && (
            <div className="mt-2">
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${subtaskProgress.percentage}%` }}></div>
                </div>
            </div>
           )}

        </div>
      </div>
      
       <div className={`pl-10 pr-4 pt-3 mt-3 border-t border-slate-200 ${isExpanded ? 'block' : 'hidden'}`}>
           <h4 className="text-sm font-semibold text-slate-600 mb-2">Sub-tarefas</h4>
           
           {(!task.subtasks || task.subtasks.length === 0) ? (
              <p className="text-sm text-slate-500 italic my-2">Nenhuma sub-tarefa adicionada.</p>
           ) : (
             <ul className="space-y-2">
                {task.subtasks.map(subtask => (
                  <li key={subtask.id} className="flex items-center gap-3">
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
           )}

            <form onSubmit={handleAddSubtask} className="flex gap-2 mt-3">
                <input
                    type="text"
                    value={newSubtaskText}
                    // FIX: Corrected typo from setNewSubkeyaskText to setNewSubtaskText
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    placeholder="Adicionar nova sub-tarefa..."
                    className="flex-1 px-3 py-1.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="submit" className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">Adicionar</button>
            </form>
       </div>

      <div className="pl-10 mt-3 pt-3 border-t border-slate-200">
        {task.notes && (
          <p className="mb-2 text-xs p-2 bg-slate-100 rounded-md text-slate-500 italic">
            Obs: {task.notes}
          </p>
        )}
        <div className="text-xs text-slate-400 flex items-center flex-wrap gap-x-4 gap-y-1">
           <span>Prioridade: {task.priority}</span>
           <span>Categoria: {task.category}</span>
           <span>Criada em: {formatDate(task.taskDate)}</span>
            {task.dueDate && (
             <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
               <ClockIcon className="w-3.5 h-3.5" />
               Vence em: {formatDate(task.dueDate)}
             </span>
           )}
           {task.completed && task.completionDate && (
               <span>Concluída em: {formatDate(task.completionDate)}</span>
           )}
        </div>
      </div>
    </li>
  );
};

export default TaskItem;