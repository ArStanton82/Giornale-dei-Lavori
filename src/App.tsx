import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { NewProjectModal } from './components/NewProjectModal';
import { WorkEntryForm } from './components/WorkEntryForm';
import { WorkEntryCard } from './components/WorkEntryCard';
import { PersonnelTab } from './components/PersonnelTab';
import { DocumentsTab } from './components/DocumentsTab';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDocumentStorage } from './hooks/useDocumentStorage';
import { exportToPDF } from './utils/pdfExport';
import { exportToWord } from './utils/wordExport';
import { Project, WorkEntry, PersonnelMember, ProjectDocument } from './types';
import { Plus, BookOpen, Users, FolderOpen } from 'lucide-react';

type Tab = 'registro' | 'personale' | 'documenti';

function App() {
  const [projects, setProjects] = useLocalStorage<Project[]>('giornale-projects', []);
  const [allEntries, setAllEntries] = useLocalStorage<Record<string, WorkEntry[]>>('giornale-entries-v2', {});
  const [allPersonnel, setAllPersonnel] = useLocalStorage<Record<string, PersonnelMember[]>>('giornale-personnel', {});
  const { getProjectDocs, setProjectDocs, deleteProjectDocs } = useDocumentStorage();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('registro');
  const [exporting, setExporting] = useState<'pdf' | 'word' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const entries: WorkEntry[] = activeProjectId ? (allEntries[activeProjectId] ?? []) : [];
  const personnel: PersonnelMember[] = activeProjectId ? (allPersonnel[activeProjectId] ?? []) : [];
  const documents: ProjectDocument[] = activeProjectId ? getProjectDocs(activeProjectId) : [];

  const setEntries = (updater: WorkEntry[] | ((prev: WorkEntry[]) => WorkEntry[])) => {
    if (!activeProjectId) return;
    setAllEntries(prev => {
      const current = prev[activeProjectId] ?? [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [activeProjectId]: next };
    });
  };

  const handlePersonnelChange = (updated: PersonnelMember[]) => {
    if (!activeProjectId) return;
    setAllPersonnel(prev => ({ ...prev, [activeProjectId]: updated }));
  };

  const handleDocumentsChange = (updated: ProjectDocument[]) => {
    if (!activeProjectId) return;
    setProjectDocs(activeProjectId, updated);
  };

  const handleProjectCreate = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
    setShowNewProjectModal(false);
    setActiveProjectId(newProject.id);
    setActiveTab('registro');
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setAllEntries(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setAllPersonnel(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    deleteProjectDocs(id);
    if (activeProjectId === id) setActiveProjectId(null);
  };

  const handleSaveEntry = (entry: WorkEntry) => {
    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    } else {
      setEntries(prev => [...prev, entry]);
    }
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: WorkEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa giornata?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleExportPDF = async () => {
    if (!activeProject || exporting) return;
    setExporting('pdf');
    setExportError(null);
    try {
      await exportToPDF(activeProject, sortedEntriesAsc);
    } catch (err) {
      console.error('PDF export error:', err);
      setExportError('Errore PDF: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExporting(null);
    }
  };

  const handleExportWord = async () => {
    if (!activeProject || exporting) return;
    setExporting('word');
    setExportError(null);
    try {
      await exportToWord(activeProject, sortedEntriesAsc);
    } catch (err) {
      console.error('Word export error:', err);
      setExportError('Errore Word: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExporting(null);
    }
  };

  const handleBackToHome = () => {
    setActiveProjectId(null);
    setShowForm(false);
    setEditingEntry(null);
    setActiveTab('registro');
  };

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  );
  const sortedEntriesAsc = useMemo(
    () => [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [entries]
  );

  // Home screen
  if (!activeProjectId) {
    return (
      <>
        <HomePage
          projects={projects}
          onSelectProject={(p) => setActiveProjectId(p.id)}
          onAddProject={() => setShowNewProjectModal(true)}
          onDeleteProject={handleDeleteProject}
        />
        {showNewProjectModal && (
          <NewProjectModal
            onProjectCreate={handleProjectCreate}
            onClose={() => setShowNewProjectModal(false)}
          />
        )}
      </>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header
          project={activeProject}
          onExportPDF={handleExportPDF}
          onExportWord={handleExportWord}
          onNewProject={handleBackToHome}
          onGoHome={handleBackToHome}
          backLabel="Archivio"
          exporting={exporting}
        />
        <div className="py-8">
          <WorkEntryForm
            onSave={handleSaveEntry}
            onCancel={() => { setShowForm(false); setEditingEntry(null); }}
            initialEntry={editingEntry || undefined}
            savedPersonnel={personnel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        project={activeProject}
        onExportPDF={handleExportPDF}
        onExportWord={handleExportWord}
        onNewProject={handleBackToHome}
        onGoHome={handleBackToHome}
        backLabel="Archivio"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {exportError && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-500/40 text-red-300 text-sm flex items-center justify-between">
            <span>{exportError}</span>
            <button onClick={() => setExportError(null)} className="ml-4 text-red-400 hover:text-red-200">&times;</button>
          </div>
        )}
        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-8 bg-gray-900 border border-white/10 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('registro')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === 'registro'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Registro Giornaliero
          </button>
          <button
            onClick={() => setActiveTab('personale')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === 'personale'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="h-4 w-4" />
            Personale
            {personnel.length > 0 && (
              <span className="ml-0.5 bg-white/15 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                {personnel.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('documenti')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === 'documenti'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            Documenti
            {documents.length > 0 && (
              <span className="ml-0.5 bg-white/15 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                {documents.length}
              </span>
            )}
          </button>
        </div>

        {/* Registro tab */}
        {activeTab === 'registro' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Registro Giornaliero</h2>
                <p className="text-gray-400 mt-1">
                  {entries.length === 0
                    ? 'Nessuna giornata registrata'
                    : `${entries.length} ${entries.length !== 1 ? 'giornate registrate' : 'giornata registrata'}`}
                </p>
              </div>
              <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Nuova Giornata</span>
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto bg-gray-900 rounded-2xl border border-white/10 p-8">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Inizia a registrare le tue giornate
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Clicca su "Nuova Giornata" per iniziare a tenere traccia dei lavori, materiali e manodopera del tuo cantiere.
                  </p>
                  <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2 mx-auto">
                    <Plus className="h-5 w-5" />
                    <span>Prima Giornata</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedEntries.map((entry) => (
                  <WorkEntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Personale tab */}
        {activeTab === 'personale' && (
          <PersonnelTab personnel={personnel} onChange={handlePersonnelChange} />
        )}

        {/* Documenti tab */}
        {activeTab === 'documenti' && (
          <DocumentsTab documents={documents} onChange={handleDocumentsChange} />
        )}
      </main>
    </div>
  );
}

export default App;
