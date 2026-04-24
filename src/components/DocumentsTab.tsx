import { useRef, useState } from 'react';
import { Upload, FileText, Trash2, Download, ChevronDown, ChevronUp } from 'lucide-react';
import {
  ProjectDocument,
  DocumentCategory,
  DOCUMENT_CATEGORY_LABELS,
} from '../types';

interface DocumentsTabProps {
  documents: ProjectDocument[];
  onChange: (docs: ProjectDocument[]) => void;
}

const CATEGORIES: DocumentCategory[] = [
  'verbale_inizio',
  'ordine_servizio',
  'verbale_constatazione',
  'verbale_fine',
];

const CATEGORY_ICONS: Record<DocumentCategory, string> = {
  verbale_inizio: 'VIL',
  ordine_servizio: 'OS',
  verbale_constatazione: 'VC',
  verbale_fine: 'VFL',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DocumentsTab({ documents, onChange }: DocumentsTabProps) {
  const inputRefs = useRef<Record<DocumentCategory, HTMLInputElement | null>>({} as never);
  const [collapsed, setCollapsed] = useState<Record<DocumentCategory, boolean>>({} as never);
  const [uploading, setUploading] = useState<DocumentCategory | null>(null);

  const docsByCategory = (cat: DocumentCategory) =>
    documents.filter((d) => d.category === cat);

  const toggleCollapse = (cat: DocumentCategory) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const handleFileChange = (cat: DocumentCategory, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploading(cat);
    let pending = files.length;
    const newDocs: ProjectDocument[] = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newDocs.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          category: cat,
          name: file.name,
          dataUrl: reader.result as string,
          uploadedAt: new Date().toISOString(),
          sizeBytes: file.size,
        });
        pending -= 1;
        if (pending === 0) {
          onChange([...documents, ...newDocs]);
          setUploading(null);
        }
      };
      reader.onerror = () => {
        pending -= 1;
        if (pending === 0) setUploading(null);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    if (!confirm('Eliminare questo documento?')) return;
    onChange(documents.filter((d) => d.id !== id));
  };

  const handleDownload = (doc: ProjectDocument) => {
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Documenti</h2>
          <p className="text-gray-400 mt-1">
            {documents.length === 0
              ? 'Nessun documento caricato'
              : `${documents.length} ${documents.length !== 1 ? 'documenti caricati' : 'documento caricato'}`}
          </p>
        </div>
      </div>

      {CATEGORIES.map((cat) => {
        const docs = docsByCategory(cat);
        const isCollapsed = collapsed[cat];
        const isUploading = uploading === cat;
        const isMulti = cat === 'ordine_servizio' || cat === 'verbale_constatazione';

        return (
          <div key={cat} className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            {/* Category header */}
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
              onClick={() => toggleCollapse(cat)}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                  {CATEGORY_ICONS[cat]}
                </span>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">{DOCUMENT_CATEGORY_LABELS[cat]}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {docs.length === 0
                      ? 'Nessun file'
                      : `${docs.length} ${docs.length !== 1 ? 'file' : 'file'}`}
                    {isMulti && ' · multipli ammessi'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {docs.length > 0 && (
                  <span className="bg-blue-600/20 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                    {docs.length}
                  </span>
                )}
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </button>

            {/* Expanded body */}
            {!isCollapsed && (
              <div className="px-5 pb-5 border-t border-white/5">
                {/* Upload button */}
                <div className="mt-4">
                  <input
                    ref={(el) => { inputRefs.current[cat] = el; }}
                    type="file"
                    accept="application/pdf"
                    multiple={isMulti}
                    className="hidden"
                    onChange={(e) => handleFileChange(cat, e)}
                  />
                  <button
                    onClick={() => inputRefs.current[cat]?.click()}
                    disabled={isUploading || (!isMulti && docs.length >= 1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10
                               text-gray-300 hover:text-white text-sm font-medium transition-colors
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading
                      ? 'Caricamento...'
                      : !isMulti && docs.length >= 1
                      ? 'Documento gia caricato'
                      : isMulti
                      ? 'Carica PDF'
                      : 'Carica PDF'}
                  </button>
                  {!isMulti && docs.length >= 1 && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Elimina il documento esistente per sostituirlo.
                    </p>
                  )}
                </div>

                {/* File list */}
                {docs.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {docs.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3"
                      >
                        <FileText className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {formatBytes(doc.sizeBytes)} · {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                          title="Scarica"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
