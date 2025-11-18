export enum Priority {
  Low = 'Baixa',
  Medium = 'Média',
  High = 'Alta',
}

export enum Category {
  SAE = 'SAE',
  Printing3D = '3D Printing',
  MasterListPDM = 'Master List/PDM',
  Other = 'Outro',
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  notes: string;
  priority: Priority;
  category: Category;
  taskDate: string;
  dueDate: string | null;
  completionDate: string | null;
  completed: boolean;
  subtasks?: Subtask[];
}