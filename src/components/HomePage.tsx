import { useState } from 'react';
import { Plus, MapPin, Calendar, User, Trash2, ArrowRight, HardHat, Users } from 'lucide-react';
import { Project } from '../types';

interface HomePageProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onAddProject: () => void;
  onDeleteProject: (id: string) => void;
}

export function HomePage({ projects, onSelectProject, onAddProject, onDeleteProject }: HomePageProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Eliminare questo cantiere? Tutti i dati verranno persi.')) {
      onDeleteProject(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <HardHat className="h-4.5 w-4.5 text-white" style={{ width: '18px', height: '18px' }} />
            </div>
            <span className="font-semibold text-white tracking-tight text-lg">Giornale di Cantiere</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <p className="text-blue-400 text-sm font-medium tracking-wide uppercase mb-3">Archivio</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          I tuoi cantieri
        </h1>
        <p className="text-gray-400 mt-3 text-lg max-w-xl">
          Seleziona un cantiere per aprire il registro o aggiungine uno nuovo.
        </p>
      </section>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {projects.length === 0 ? (
          <div className="empty-state-card">
            <img
              src="https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Cantiere"
              className="empty-state-img"
            />
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                <HardHat className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nessun cantiere</h3>
              <p className="text-gray-400 mb-7 max-w-sm mx-auto">
                Aggiungi il tuo primo cantiere per iniziare a tenere il registro giornaliero.
              </p>
              <button onClick={onAddProject} className="home-add-btn mx-auto">
                <Plus className="h-4 w-4" />
                <span>Aggiungi cantiere</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`project-card group ${hoveredId === project.id ? 'project-card-active' : ''}`}
                onClick={() => onSelectProject(project)}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="project-card-title">{project.name}</h3>
                    <div className="mt-3 space-y-1.5">
                      <div className="project-card-meta">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-blue-400" />
                        <span>{project.location}</span>
                      </div>
                      <div className="project-card-meta">
                        <HardHat className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
                        <span>{project.contractor}</span>
                      </div>
                      <div className="project-card-meta">
                        <User className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
                        <span>{project.client}</span>
                      </div>
                      {project.subcontractors && (
                        <div className="project-card-meta">
                          <Users className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
                          <span>{project.subcontractors}</span>
                        </div>
                      )}
                      <div className="project-card-meta">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
                        <span>{new Date(project.startDate).toLocaleDateString('it-IT')}</span>
                      </div>
                    </div>
                    {project.description && (
                      <p className="project-card-desc mt-3 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                      title="Elimina cantiere"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ArrowRight className={`h-5 w-5 text-blue-500 mt-auto transition-transform duration-200 ${hoveredId === project.id ? 'translate-x-1' : ''}`} />
                  </div>
                </div>
              </div>
            ))}

            {/* Add card */}
            <button
              onClick={onAddProject}
              className="add-project-card"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                <Plus className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-blue-400">Aggiungi cantiere</span>
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-5">
        <p className="text-center text-xs text-gray-600">
          Sviluppato da{' '}
          <a
            href="https://github.com/ArStanton82"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
          >
            ArStanton82
          </a>
        </p>
      </footer>
    </div>
  );
}
