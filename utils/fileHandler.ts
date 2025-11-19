
import * as XLSX from 'xlsx';
import { Task, TaskStatus, PriorityLevel, PrimaryCategory, SecondaryCategory } from '../types';

// Helper to flatten a task for Excel
const formatTaskForExport = (task: Task): any => {
    return {
        ID: task.id,
        Nome: task.name,
        Descrição: task.description,
        Observações: task.notes,
        Prioridade: task.priority,
        Status: task.status,
        'Categoria Primária': task.primaryCategory,
        'Categoria Secundária': task.secondaryCategory,
        'Última Ação': task.lastAction,
        'Próxima Ação': task.nextAction,
        'Ação Paralela': task.parallelAction,
        'Fazer Hoje': task.isToday ? 'Sim' : 'Não',
        'Data Criação': task.taskDate,
        'Data Vencimento': task.dueDate,
        'Data Conclusão': task.completionDate,
        Concluída: task.completed ? 'Sim' : 'Não',
        // Serialize subtasks to JSON string to preserve structure
        Subtarefas: JSON.stringify(task.subtasks || [])
    };
};

// Helper to parse a row back to a Task
const parseImportedRow = (row: any): Task => {
    // Basic validation
    if (!row.Nome && !row.name) {
        throw new Error("Formato inválido: Coluna 'Nome' é obrigatória.");
    }

    const id = row.ID || crypto.randomUUID();
    const isCompleted = row.Concluída === 'Sim' || row.Concluída === true || row.completed === true;
    
    return {
        id: String(id),
        name: String(row.Nome || row.name || ''),
        description: String(row.Descrição || row.description || ''),
        notes: String(row.Observações || row.notes || ''),
        priority: Number(row.Prioridade || row.priority || 100) as PriorityLevel,
        status: (row.Status || row.status || TaskStatus.Pending) as TaskStatus,
        primaryCategory: (row['Categoria Primária'] || row.primaryCategory || 'SAE') as PrimaryCategory,
        secondaryCategory: (row['Categoria Secundária'] || row.secondaryCategory || 'Geral') as SecondaryCategory,
        
        lastAction: String(row['Última Ação'] || row.lastAction || ''),
        nextAction: String(row['Próxima Ação'] || row.nextAction || ''),
        parallelAction: String(row['Ação Paralela'] || row.parallelAction || ''),
        isToday: row['Fazer Hoje'] === 'Sim' || row['Fazer Hoje'] === true || row.isToday === true,
        
        taskDate: String(row['Data Criação'] || row.taskDate || new Date().toISOString()),
        dueDate: row['Data Vencimento'] ? String(row['Data Vencimento']) : null,
        completionDate: row['Data Conclusão'] ? String(row['Data Conclusão']) : (isCompleted ? new Date().toISOString() : null),
        completed: isCompleted,
        
        // Try to parse subtasks, fallback to empty array if failed
        subtasks: (() => {
            try {
                const val = row.Subtarefas || row.subtasks;
                if (typeof val === 'string') return JSON.parse(val);
                if (Array.isArray(val)) return val;
                return [];
            } catch (e) {
                return [];
            }
        })()
    };
};

export const exportTasksToFile = (tasks: Task[], format: 'xlsx' | 'csv') => {
    const formattedData = tasks.map(formatTaskForExport);
    
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tarefas");

    const fileName = `minhas_tarefas_${new Date().toISOString().split('T')[0]}.${format}`;
    
    // SheetJS handles the download trigger
    XLSX.writeFile(workbook, fileName, { bookType: format });
};

export const importTasksFromFile = (file: File): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    reject(new Error("Falha ao ler o arquivo."));
                    return;
                }

                // Use 'array' type for ArrayBuffer which is more robust than 'binary' string
                const workbook = XLSX.read(data, { type: 'array' });
                
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Get raw JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                // Transform to Task objects with error tolerance
                const tasks: Task[] = [];
                
                jsonData.forEach((row: any) => {
                    try {
                        const task = parseImportedRow(row);
                        tasks.push(task);
                    } catch (err) {
                        console.warn('Skipping invalid row:', row, err);
                    }
                });

                resolve(tasks);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        
        // readAsArrayBuffer is the standard way to read files for XLSX library
        reader.readAsArrayBuffer(file);
    });
};
