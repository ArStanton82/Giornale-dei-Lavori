import React, { useState } from 'react';
import { X, Building2, MapPin, User, Calendar, HardHat, Users, FileText, Euro, Hash, Phone, Mail } from 'lucide-react';
import { Project } from '../types';

interface NewProjectModalProps {
  onProjectCreate: (project: Project) => void;
  onClose: () => void;
}

export function NewProjectModal({ onProjectCreate, onClose }: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contractor: '',
    contractorFiscalCode: '',
    contractorPhone: '',
    contractorEmail: '',
    subcontractors: '',
    client: '',
    contract: '',
    contractAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountClean = formData.contractAmount.trim();
    const normalized = amountClean.replace(/\./g, '').replace(',', '.');
    if (amountClean && isNaN(parseFloat(normalized))) {
      alert('Importo non valido. Usa il formato: 250.000,00');
      return;
    }
    const project: Project = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };
    onProjectCreate(project);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Nuovo cantiere</h2>
            <p className="text-gray-400 text-sm mt-0.5">Inserisci i dettagli del progetto</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="modal-label">Nome cantiere *</label>
            <div className="relative">
              <Building2 className="modal-input-icon" />
              <input name="name" type="text" required value={formData.name} onChange={handleChange}
                className="modal-input pl-10" placeholder="Es. Ristrutturazione Via Roma" />
            </div>
          </div>

          <div>
            <label className="modal-label">Ubicazione *</label>
            <div className="relative">
              <MapPin className="modal-input-icon" />
              <input name="location" type="text" required value={formData.location} onChange={handleChange}
                className="modal-input pl-10" placeholder="Es. Via Roma 12, Milano" />
            </div>
          </div>

          <div>
            <label className="modal-label">Ditta Appaltatrice *</label>
            <div className="relative">
              <HardHat className="modal-input-icon" />
              <input name="contractor" type="text" required value={formData.contractor} onChange={handleChange}
                className="modal-input pl-10" placeholder="Es. Impresa Edile Rossi Srl" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="modal-label">C.F./P.IVA</label>
              <div className="relative">
                <Hash className="modal-input-icon" />
                <input name="contractorFiscalCode" type="text" value={formData.contractorFiscalCode} onChange={handleChange}
                  className="modal-input pl-10" placeholder="Es. IT12345678901" />
              </div>
            </div>
            <div>
              <label className="modal-label">Telefono</label>
              <div className="relative">
                <Phone className="modal-input-icon" />
                <input name="contractorPhone" type="tel" value={formData.contractorPhone} onChange={handleChange}
                  className="modal-input pl-10" placeholder="Es. 02 1234567" />
              </div>
            </div>
            <div>
              <label className="modal-label">Mail</label>
              <div className="relative">
                <Mail className="modal-input-icon" />
                <input name="contractorEmail" type="email" value={formData.contractorEmail} onChange={handleChange}
                  className="modal-input pl-10" placeholder="info@ditta.it" />
              </div>
            </div>
          </div>

          <div>
            <label className="modal-label">Subappaltatori <span className="text-gray-500">(opzionale)</span></label>
            <div className="relative">
              <Users className="modal-input-icon" />
              <input name="subcontractors" type="text" value={formData.subcontractors} onChange={handleChange}
                className="modal-input pl-10" placeholder="Es. Bianchi Impianti, Verdi Serramenti" />
            </div>
          </div>

          <div>
            <label className="modal-label">Committente *</label>
            <div className="relative">
              <User className="modal-input-icon" />
              <input name="client" type="text" required value={formData.client} onChange={handleChange}
                className="modal-input pl-10" placeholder="Es. Comune di Milano" />
            </div>
          </div>

          <div>
            <label className="modal-label">Contratto e CIG *</label>
            <div className="relative">
              <FileText className="modal-input-icon" />
              <input name="contract" type="text" required value={formData.contract} onChange={handleChange}
                className="modal-input pl-10" placeholder="Es. Contr. n.123/2024 — CIG: ABC123" />
            </div>
          </div>

          <div>
            <label className="modal-label">Importo Lavori *</label>
            <div className="relative">
              <Euro className="modal-input-icon" />
              <input name="contractAmount" type="text" required value={formData.contractAmount} onChange={handleChange}
                className="modal-input pl-10" placeholder="Es. 250.000,00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="modal-label">Data Inizio Lavori *</label>
              <div className="relative">
                <Calendar className="modal-input-icon" />
                <input name="startDate" type="date" required value={formData.startDate} onChange={handleChange}
                  className="modal-input pl-10" />
              </div>
            </div>
            <div>
              <label className="modal-label">Data Fine Prevista</label>
              <div className="relative">
                <Calendar className="modal-input-icon" />
                <input name="endDate" type="date" value={formData.endDate} onChange={handleChange}
                  className="modal-input pl-10" />
              </div>
            </div>
          </div>

          <div>
            <label className="modal-label">Descrizione <span className="text-gray-500">(opzionale)</span></label>
            <textarea name="description" rows={3} value={formData.description} onChange={handleChange}
              className="modal-input" placeholder="Breve descrizione del progetto..." />
          </div>

          <div className="flex gap-3 pt-2 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-medium text-sm">
              Annulla
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors">
              Crea cantiere
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
