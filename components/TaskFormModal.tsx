import React, { useState, useEffect, FormEvent } from 'react';
import { Task, Priority, Category } from '../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed' | 'completionDate'>) => void;
  taskToEdit?: Task | null;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [category, setCategory] = useState<Category>(Category.SAE);
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  
  useEffect(() => {
    if (isOpen) {
        if (taskToEdit) {
            setName(taskToEdit.name);
            setDescription(taskToEdit.description);
            setNotes(taskToEdit.notes);
            setPriority(taskToEdit.priority);
            setCategory(taskToEdit.category);
            setTaskDate(new Date(taskToEdit.taskDate).toISOString().split('T')[0]);
            setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
        } else {
            // Reset form for new task
            setName('');
            setDescription('');
            setNotes('');
            setPriority(Priority.Medium);
            setCategory(Category.SAE);
            setTaskDate(new Date().toISOString().split('T')[0]);
            setDueDate('');
        }
    }
  }, [isOpen, taskToEdit]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      name,
      description,
      notes,
      priority,
      category,
      taskDate: new Date(taskDate).toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
    // The parent component now handles closing the modal.
  };
  
  if (!isOpen) return null;

  const isEditing = !!taskToEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome da Tarefa</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="taskDate" className="block text-sm font-medium text-slate-700 mb-1">Data da Tarefa</label>
                <input type="date" id="taskDate" value={taskDate} onChange={e => setTaskDate(e.target.value)} required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">Vencimento (Opcional)</label>
                <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">{isEditing ? 'Salvar Alterações' : 'Salvar Tarefa'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;