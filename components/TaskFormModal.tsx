
import React, { useState, useEffect, FormEvent } from 'react';
import { Task, PriorityLevel, PrimaryCategory, SecondaryCategory, TaskStatus } from '../types';
import { StarIcon } from './Icons';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed' | 'completionDate'>) => void;
  taskToEdit?: Task | null;
}

const priorityOptions: { value: PriorityLevel; label: string }[] = [
  { value: 0, label: '0 - Imediato (Crítico)' },
  { value: 1, label: '1 - Urgente' },
  { value: 10, label: '10 - Alta' },
  { value: 100, label: '100 - Normal' },
  { value: 1000, label: '1000 - Baixa/Backlog' },
];

const secondaryOptions: SecondaryCategory[] = [
  'Geral',
  'Água',
  'Anvisa',
  'Brinde/Evento',
  'Calibração',
  'Corte a Laser',
  'Desenho Técnico',
  'Embalagem',
  'ESD',
  'ETO',
  'Gravação a Laser',
  'Inventário',
  'Manufatura',
  'Mestrado',
  'Partículas',
  'Solda a Laser',
  'Visita'
];

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  
  // Workflow State
  const [priority, setPriority] = useState<PriorityLevel>(100);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.Pending);
  const [lastAction, setLastAction] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [parallelAction, setParallelAction] = useState('');
  const [isToday, setIsToday] = useState(false);

  // Categorization State
  const [primaryCategory, setPrimaryCategory] = useState<PrimaryCategory>(PrimaryCategory.SAE);
  const [secondaryCategory, setSecondaryCategory] = useState<SecondaryCategory>('Geral');

  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  // Discard Confirmation State
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  
  // Reset form when opening/closing/switching tasks
  useEffect(() => {
    if (isOpen) {
        setShowDiscardConfirm(false);
        if (taskToEdit) {
            setName(taskToEdit.name);
            setDescription(taskToEdit.description);
            setNotes(taskToEdit.notes);
            setPriority(taskToEdit.priority);
            
            // Handle Legacy Data mapping for Category -> PrimaryCategory
            // @ts-ignore - ignoring strict check for legacy 'category' field existence
            const legacyCategory = taskToEdit.category; 
            setPrimaryCategory(taskToEdit.primaryCategory || legacyCategory || PrimaryCategory.SAE);
            setSecondaryCategory(taskToEdit.secondaryCategory || 'Geral');
            
            setStatus(taskToEdit.status || TaskStatus.Pending);
            setLastAction(taskToEdit.lastAction || '');
            setNextAction(taskToEdit.nextAction || '');
            setParallelAction(taskToEdit.parallelAction || '');
            setIsToday(!!taskToEdit.isToday);

            setTaskDate(new Date(taskToEdit.taskDate).toISOString().split('T')[0]);
            setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
        } else {
            // Reset form for new task
            setName('');
            setDescription('');
            setNotes('');
            setPriority(100);
            setStatus(TaskStatus.Pending);
            setLastAction('');
            setNextAction('');
            setParallelAction('');
            setIsToday(false);
            setPrimaryCategory(PrimaryCategory.SAE);
            setSecondaryCategory('Geral');
            setTaskDate(new Date().toISOString().split('T')[0]);
            setDueDate('');
        }
    }
  }, [isOpen, taskToEdit]);

  const hasUnsavedChanges = () => {
    if (taskToEdit) {
        const editDate = new Date(taskToEdit.taskDate).toISOString().split('T')[0];
        const editDueDate = taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '';
        // @ts-ignore
        const editPrimary = taskToEdit.primaryCategory || taskToEdit.category || PrimaryCategory.SAE;
        const editSecondary = taskToEdit.secondaryCategory || 'Geral';

        return name !== taskToEdit.name ||
               description !== taskToEdit.description ||
               notes !== taskToEdit.notes ||
               priority !== taskToEdit.priority ||
               status !== taskToEdit.status ||
               lastAction !== (taskToEdit.lastAction || '') ||
               nextAction !== (taskToEdit.nextAction || '') ||
               parallelAction !== (taskToEdit.parallelAction || '') ||
               isToday !== (!!taskToEdit.isToday) ||
               primaryCategory !== editPrimary ||
               secondaryCategory !== editSecondary ||
               taskDate !== editDate ||
               dueDate !== editDueDate;
    } else {
        // For new task, checks against defaults
        return name !== '' ||
               description !== '' ||
               notes !== '' ||
               priority !== 100 ||
               status !== TaskStatus.Pending ||
               lastAction !== '' ||
               nextAction !== '' ||
               parallelAction !== '' ||
               isToday !== false ||
               primaryCategory !== PrimaryCategory.SAE ||
               secondaryCategory !== 'Geral' ||
               dueDate !== '';
    }
  };

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges()) {
        setShowDiscardConfirm(true);
    } else {
        onClose();
    }
  };

  const confirmDiscard = () => {
      setShowDiscardConfirm(false);
      onClose();
  };

  const cancelDiscard = () => {
      setShowDiscardConfirm(false);
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      name,
      description,
      notes,
      priority,
      primaryCategory,
      secondaryCategory,
      status,
      lastAction,
      nextAction,
      parallelAction: status === TaskStatus.Waiting ? parallelAction : '',
      isToday,
      taskDate: new Date(taskDate).toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
  };
  
  if (!isOpen) return null;

  const isEditing = !!taskToEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleCloseAttempt}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b bg-slate-50 rounded-t-xl sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
           
           {/* Quick Today Toggle in Header */}
           <button 
                type="button"
                onClick={() => setIsToday(!isToday)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold transition-colors ${isToday ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-300 text-slate-500 hover:border-amber-300 hover:text-amber-500'}`}
           >
               <StarIcon className={`w-4 h-4 ${isToday ? 'fill-amber-600' : ''}`} />
               {isToday ? 'Fazer Hoje' : 'Marcar p/ Hoje'}
           </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1">Nome da Tarefa</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
             </div>
             <div>
                <label htmlFor="priority" className="block text-sm font-bold text-slate-700 mb-1">Prioridade</label>
                <select id="priority" value={priority} onChange={e => setPriority(Number(e.target.value) as PriorityLevel)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {priorityOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
               <label htmlFor="status" className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                <select id="status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="primaryCategory" className="block text-sm font-bold text-slate-700 mb-1">Cat. Primária</label>
                <select id="primaryCategory" value={primaryCategory} onChange={e => setPrimaryCategory(e.target.value as PrimaryCategory)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {Object.values(PrimaryCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="secondaryCategory" className="block text-sm font-bold text-slate-700 mb-1">Cat. Secundária</label>
                <select id="secondaryCategory" value={secondaryCategory} onChange={e => setSecondaryCategory(e.target.value as SecondaryCategory)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {secondaryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
          </div>

          {/* Workflow Fields */}
          <div className="space-y-3">
            <div>
                <label htmlFor="lastAction" className="block text-sm font-medium text-slate-600 mb-1">Última coisa feita</label>
                <input type="text" id="lastAction" value={lastAction} onChange={e => setLastAction(e.target.value)} placeholder="O que foi concluído recentemente..." className="w-full px-3 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-md focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"/>
            </div>
            
            <div>
                <label htmlFor="nextAction" className="block text-sm font-bold text-blue-700 mb-1">Próxima coisa a fazer</label>
                <input type="text" id="nextAction" value={nextAction} onChange={e => setNextAction(e.target.value)} placeholder="Qual o próximo passo imediato?" className="w-full px-3 py-2 bg-blue-50 text-slate-900 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>

            {/* Conditional Parallel Action */}
            {status === TaskStatus.Waiting && (
                <div className="animate-fadeIn">
                     <label htmlFor="parallelAction" className="block text-sm font-bold text-purple-700 mb-1">Se aguardando, pode fazer algo em paralelo?</label>
                     <input type="text" id="parallelAction" value={parallelAction} onChange={e => setParallelAction(e.target.value)} placeholder="Ação alternativa enquanto aguarda..." className="w-full px-3 py-2 bg-purple-50 text-slate-900 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"/>
                </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Descrição Completa</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="taskDate" className="block text-sm font-medium text-slate-700 mb-1">Data de Criação</label>
                <input type="date" id="taskDate" value={taskDate} onChange={e => setTaskDate(e.target.value)} required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">Vencimento (Opcional)</label>
                <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>

           <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Observações Extras</label>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t mt-4">
            <button type="button" onClick={handleCloseAttempt} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">{isEditing ? 'Salvar Alterações' : 'Salvar Tarefa'}</button>
          </div>
        </form>

        {/* Discard Confirmation Overlay */}
        {showDiscardConfirm && (
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] flex items-center justify-center rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white p-6 rounded-lg shadow-2xl border border-slate-200 max-w-sm w-full transform animate-fadeIn">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Descartar alterações?</h3>
                    <p className="text-sm text-slate-600 mb-6">Você tem alterações não salvas. Tem certeza que deseja descartar as alterações?</p>
                    <div className="flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={cancelDiscard}
                            className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-md"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button" 
                            onClick={confirmDiscard}
                            className="px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"
                        >
                            Descartar
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskFormModal;