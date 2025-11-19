
export type PriorityLevel = 0 | 1 | 10 | 100 | 1000;

export enum TaskStatus {
  Pending = 'Pendente',
  InProgress = 'Executando',
  Waiting = 'Aguardando',
  Completed = 'Concluída',
}

export enum PrimaryCategory {
  SAE = 'SAE',
  Printing3D = '3D Printing',
  MasterListPDM = 'Master List/PDM',
  Project = 'Projeto',
  Other = 'Outro',
}

export type SecondaryCategory = 
  | 'Geral'
  | 'Água'
  | 'Anvisa'
  | 'Brinde/Evento'
  | 'Calibração'
  | 'Corte a Laser'
  | 'Desenho Técnico'
  | 'Embalagem'
  | 'ESD'
  | 'ETO'
  | 'Gravação a Laser'
  | 'Inventário'
  | 'Manufatura'
  | 'Mestrado'
  | 'Partículas'
  | 'Solda a Laser'
  | 'Visita';

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
  
  // Workflow fields
  priority: PriorityLevel;
  status: TaskStatus;
  lastAction: string; 
  nextAction: string; 
  parallelAction?: string; 
  isToday?: boolean; // New field for "Today" focus

  // Categorization
  primaryCategory: PrimaryCategory;
  secondaryCategory: SecondaryCategory;

  taskDate: string;
  dueDate: string | null;
  completionDate: string | null;
  completed: boolean;
  subtasks?: Subtask[];
}