export interface Project {
  id: string;
  name: string;
  location: string;
  contractor: string;
  contractorFiscalCode: string;
  contractorPhone: string;
  contractorEmail: string;
  subcontractors: string;
  client: string;
  contract: string;
  contractAmount: string;
  startDate: string;
  endDate: string;
  description?: string;
  createdAt: string;
}

export type PersonnelRole = 'RUP' | 'DirettoreLavori' | 'DirettoreTecnico' | 'CSE' | 'AssistenteDL' | 'Operaio';

export const PERSONNEL_ROLE_LABELS: Record<PersonnelRole, string> = {
  RUP: 'R.U.P.',
  DirettoreLavori: 'Direttore dei Lavori',
  DirettoreTecnico: 'Direttore Tecnico',
  CSE: 'C.S.E.',
  AssistenteDL: 'Assistente al D.L.',
  Operaio: 'Operaio',
};

export interface PersonnelMember {
  id: string;
  role: PersonnelRole;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  supplier?: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  attendance: 'intera' | 'mezza';
}

export interface Equipment {
  id: string;
  name: string;
  hours?: number;
  notes?: string;
}

export type DocumentCategory =
  | 'verbale_inizio'
  | 'ordine_servizio'
  | 'verbale_constatazione'
  | 'verbale_fine';

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  verbale_inizio: 'Verbale di Inizio Lavori',
  ordine_servizio: 'Ordine di Servizio',
  verbale_constatazione: 'Verbale di Constatazione',
  verbale_fine: 'Verbale di Fine Lavori',
};

export interface ProjectDocument {
  id: string;
  projectId?: string;
  category: DocumentCategory;
  name: string;
  dataUrl: string;
  uploadedAt: string;
  sizeBytes: number;
}

export interface WorkEntry {
  id: string;
  date: string;
  weather: string;
  temperature: string;
  workDescription: string;
  materials: Material[];
  workers: Worker[];
  equipment: Equipment[];
  safetyNotes: string;
  additionalNotes: string;
  photos?: string[];
}