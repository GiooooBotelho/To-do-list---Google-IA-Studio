
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
  Other = 'Outro',
}

export type SecondaryCategory = 
  | 'Geral'
  | 'Água'
  | 'Anvisa'
  | 'Calibração'
  | 'Corte a Laser'
  | 'Embalagem'
  | 'ESD'
  | 'ETO'
  | 'Gravação a Laser'
  | 'Inventário'
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

  // Categorization
  primaryCategory: PrimaryCategory;
  secondaryCategory: SecondaryCategory;

  taskDate: string;
  dueDate: string | null;
  completionDate: string | null;
  completed: boolean;
  subtasks?: Subtask[];
}
