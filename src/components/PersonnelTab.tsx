import { useState } from 'react';
import { Plus, Trash2, User, Phone, Mail, Building2, ChevronDown } from 'lucide-react';
import { PersonnelMember, PersonnelRole, PERSONNEL_ROLE_LABELS } from '../types';

const ROLES: PersonnelRole[] = ['RUP', 'DirettoreLavori', 'DirettoreTecnico', 'CSE', 'AssistenteDL', 'Operaio'];

const ROLE_COLORS: Record<PersonnelRole, string> = {
  RUP: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  DirettoreLavori: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  DirettoreTecnico: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  CSE: 'bg-red-500/15 text-red-400 border-red-500/30',
  AssistenteDL: 'bg-green-500/15 text-green-400 border-green-500/30',
  Operaio: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

interface PersonnelTabProps {
  personnel: PersonnelMember[];
  onChange: (personnel: PersonnelMember[]) => void;
}

const emptyForm = (): Omit<PersonnelMember, 'id'> => ({
  role: 'RUP',
  name: '',
  company: '',
  phone: '',
  email: '',
});

export function PersonnelTab({ personnel, onChange }: PersonnelTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const member: PersonnelMember = { id: Date.now().toString(), ...form };
    onChange([...personnel, member]);
    setForm(emptyForm());
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    onChange(personnel.filter(m => m.id !== id));
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const grouped = ROLES.reduce<Record<PersonnelRole, PersonnelMember[]>>((acc, role) => {
    acc[role] = personnel.filter(m => m.role === role);
    return acc;
  }, {} as Record<PersonnelRole, PersonnelMember[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Personale</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {personnel.length === 0 ? 'Nessun membro aggiunto' : `${personnel.length} membro${personnel.length !== 1 ? 'i' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Nuovo membro</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role */}
            <div>
              <label className="form-label">Ruolo *</label>
              <div className="relative">
                <select name="role" value={form.role} onChange={handleFieldChange}
                  className="input-field appearance-none pr-8">
                  {ROLES.map(r => (
                    <option key={r} value={r}>{PERSONNEL_ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="form-label">Nome e Cognome *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input name="name" type="text" value={form.name} onChange={handleFieldChange}
                  className="input-field pl-9" placeholder="Es. Mario Rossi" />
              </div>
            </div>

            {/* Company / Grade / Mansione */}
            <div>
              <label className="form-label">
                {form.role === 'Operaio' ? 'Mansione' : 'Grado'}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input name="company" type="text" value={form.company} onChange={handleFieldChange}
                  className="input-field pl-9"
                  placeholder={form.role === 'Operaio' ? 'Es. Preposto, Elettricista, Idraulico…' : 'Es. Ing., Arch., Geom…'} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">Telefono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input name="phone" type="tel" value={form.phone} onChange={handleFieldChange}
                  className="input-field pl-9" placeholder="Es. 333 1234567" />
              </div>
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input name="email" type="email" value={form.email} onChange={handleFieldChange}
                  className="input-field pl-9" placeholder="Es. mario.rossi@email.it" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); }}
              className="btn-secondary">
              Annulla
            </button>
            <button type="button" onClick={handleAdd} disabled={!form.name.trim()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              Aggiungi membro
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {personnel.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-900 border border-white/10 rounded-2xl">
          <User className="h-10 w-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Nessun membro del personale</p>
          <p className="text-gray-600 text-sm mt-1">Aggiungi R.U.P., Direttore dei Lavori, Operai e altro</p>
        </div>
      )}

      {/* Grouped list */}
      {ROLES.map(role => {
        const members = grouped[role];
        if (members.length === 0) return null;
        return (
          <div key={role}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_COLORS[role]}`}>
                {PERSONNEL_ROLE_LABELS[role]}
              </span>
              <span className="text-gray-600 text-xs">{members.length}</span>
            </div>
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.id}
                  className="flex items-center justify-between bg-gray-900 border border-white/10 rounded-xl px-4 py-3 group hover:border-white/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                    <span className="font-medium text-white text-sm truncate">{member.name}</span>
                    <div className="flex flex-wrap gap-3">
                      {member.company && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Building2 className="h-3 w-3" />
                          {member.company}
                        </span>
                      )}
                      {member.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />{member.phone}
                        </span>
                      )}
                      {member.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />{member.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(member.id)}
                    className="ml-3 p-1.5 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
