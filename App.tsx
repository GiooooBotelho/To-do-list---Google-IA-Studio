
import React, { useState, useMemo } from 'react';
import { Task, Subtask, TaskStatus } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskFormModal from './components/TaskFormModal';
import { PlusIcon } from './components/Icons';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';

const App: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks_v2', []); // Changed key to reset state for new types
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const openModalForNew = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed' | 'completionDate'>) => {
    // Determine if completed based on status
    const isCompleted = taskData.status === TaskStatus.Completed;

    if (editingTask) {
      // Update existing task
      const updatedTask: Task = { 
          ...editingTask, 
          ...taskData,
          completed: isCompleted,
          completionDate: isCompleted ? (editingTask.completionDate || new Date().toISOString()) : null
      };
      setTasks(tasks.map(t => (t.id === editingTask.id ? updatedTask : t)));
    } else {
      // Add new task
      const newTask: Task = {
        id: crypto.randomUUID(),
        ...taskData,
        completed: isCompleted,
        completionDate: isCompleted ? new Date().toISOString() : null,
      };
      setTasks([...tasks, newTask]);
    }
    closeModal();
  };


  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map(task => {
        if (task.id === id) {
            const newCompletedState = !task.completed;
            return {
                ...task,
                completed: newCompletedState,
                status: newCompletedState ? TaskStatus.Completed : TaskStatus.Pending, // Auto-switch status
                completionDate: newCompletedState ? new Date().toISOString() : null,
            }
        }
        return task;
      })
    );
  };

  const toggleTaskToday = (id: string) => {
    setTasks(tasks.map(task => {
        if (task.id === id) {
            return { ...task, isToday: !task.isToday };
        }
        return task;
    }));
  };
  
  const addSubtask = (taskId: string, subtaskText: string) => {
    if (!subtaskText.trim()) return;
    setTasks(tasks.map(task => {
        if (task.id === taskId) {
            const newSubtask: Subtask = {
                id: crypto.randomUUID(),
                text: subtaskText,
                completed: false
            };
            const existingSubtasks = task.subtasks || [];
            return { ...task, subtasks: [...existingSubtasks, newSubtask] };
        }
        return task;
    }));
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
      setTasks(tasks.map(task => {
          if (task.id === taskId && task.subtasks) {
              const updatedSubtasks = task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                      return { ...subtask, completed: !subtask.completed };
                  }
                  return subtask;
              });
              return { ...task, subtasks: updatedSubtasks };
          }
          return task;
      }));
  };

  const requestDelete = (id: string) => {
    setTaskToDelete(id);
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      setTaskToDelete(null);
    }
  };


  const { pendingTasks, completedTasks } = useMemo(() => {
    const pending = tasks
      .filter(task => !task.completed && task.status !== TaskStatus.Completed)
      .sort((a, b) => {
         // 1. Sort by "Today" status (True first)
         if (a.isToday && !b.isToday) return -1;
         if (!a.isToday && b.isToday) return 1;

         // 2. Sort by Priority (asc)
         const prioDiff = (a.priority || 100) - (b.priority || 100);
         if (prioDiff !== 0) return prioDiff;
         
         // 3. Sort by Date
         return new Date(a.taskDate).getTime() - new Date(b.taskDate).getTime();
      });

    const completed = tasks
      .filter(task => task.completed || task.status === TaskStatus.Completed)
      .sort((a, b) => new Date(b.completionDate!).getTime() - new Date(a.completionDate!).getTime());
      
    return { pendingTasks: pending, completedTasks: completed };
  }, [tasks]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header onAddTask={openModalForNew} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <TaskList
            title="A Fazer / Executando"
            tasks={pendingTasks}
            onToggle={toggleTaskCompletion}
            onToggleToday={toggleTaskToday}
            onDelete={requestDelete}
            onEdit={openModalForEdit}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtaskCompletion}
            dateFilterType="creation"
          />
          <TaskList
            title="Concluídas"
            tasks={completedTasks}
            onToggle={toggleTaskCompletion}
            onToggleToday={toggleTaskToday}
            onDelete={requestDelete}
            onEdit={openModalForEdit}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtaskCompletion}
            dateFilterType="completion"
          />
        </div>
      </main>

      <div className="fixed bottom-6 right-6 lg:hidden">
        <button
          onClick={openModalForNew}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
          aria-label="Adicionar Nova Tarefa"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveTask}
        taskToEdit={editingTask}
      />

      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        taskName={tasks.find(t => t.id === taskToDelete)?.name || ''}
      />
    </div>
  );
};

export default App;
