import { useState } from 'react'
import {
  User, Mail, Phone, MapPin, Linkedin, Github, Globe,
  Plus, Trash2, Save, Briefcase, GraduationCap, Award, Languages,
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useJobs } from '../../context/JobContext'
import type { UserProfile, WorkExperience, Education, Certification, Language, LanguageLevel } from '../../types/jobs'

type Tab = 'infos' | 'competences' | 'experiences' | 'formation' | 'certifications'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'infos',          label: 'Informations',   icon: User },
  { id: 'competences',    label: 'Compétences',    icon: Languages },
  { id: 'experiences',    label: 'Expériences',    icon: Briefcase },
  { id: 'formation',      label: 'Formation',      icon: GraduationCap },
  { id: 'certifications', label: 'Certifications', icon: Award },
]

const LEVELS: LanguageLevel[] = ['débutant', 'intermédiaire', 'avancé', 'natif']

export default function ProfileManager() {
  const { state, updateProfile } = useJobs()
  const [profile, setProfile] = useState<UserProfile>({ ...state.profile })
  const [activeTab, setActiveTab] = useState<Tab>('infos')
  const [saved, setSaved] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newLang, setNewLang] = useState({ name: '', level: 'intermédiaire' as LanguageLevel })

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    updateProfile(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const addSkill = () => {
    const skill = newSkill.trim()
    if (skill && !profile.skills.includes(skill)) {
      set('skills', [...profile.skills, skill])
      setNewSkill('')
    }
  }

  const removeSkill = (s: string) => set('skills', profile.skills.filter(x => x !== s))

  const addLanguage = () => {
    if (!newLang.name.trim()) return
    set('languages', [...profile.languages, { id: uuidv4(), ...newLang }])
    setNewLang({ name: '', level: 'intermédiaire' })
  }

  const removeLanguage = (id: string) => set('languages', profile.languages.filter(l => l.id !== id))

  // Experience CRUD
  const addExperience = () => {
    const exp: WorkExperience = {
      id: uuidv4(), company: '', position: '', startDate: '', endDate: '',
      current: false, description: '', skills: [],
    }
    set('experiences', [...profile.experiences, exp])
  }

  const updateExp = (id: string, changes: Partial<WorkExperience>) => {
    set('experiences', profile.experiences.map(e => e.id === id ? { ...e, ...changes } : e))
  }

  const removeExp = (id: string) => set('experiences', profile.experiences.filter(e => e.id !== id))

  // Education CRUD
  const addEducation = () => {
    const edu: Education = {
      id: uuidv4(), school: '', degree: '', field: '',
      startDate: '', endDate: '', current: false,
    }
    set('education', [...profile.education, edu])
  }

  const updateEdu = (id: string, changes: Partial<Education>) => {
    set('education', profile.education.map(e => e.id === id ? { ...e, ...changes } : e))
  }

  const removeEdu = (id: string) => set('education', profile.education.filter(e => e.id !== id))

  // Certifications CRUD
  const addCert = () => {
    const cert: Certification = { id: uuidv4(), name: '', issuer: '', date: '', url: '' }
    set('certifications', [...profile.certifications, cert])
  }

  const updateCert = (id: string, changes: Partial<Certification>) => {
    set('certifications', profile.certifications.map(c => c.id === id ? { ...c, ...changes } : c))
  }

  const removeCert = (id: string) => set('certifications', profile.certifications.filter(c => c.id !== id))

  const inp = (label: string, value: string, onChange: (v: string) => void, opts?: { type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={opts?.type ?? 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={opts?.placeholder ?? ''}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">Mon profil</h2>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-ohada-blue text-white hover:bg-blue-800'
          }`}
        >
          <Save size={14} />
          {saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-ohada-blue shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── Tab: Infos ─── */}
      {activeTab === 'infos' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inp('Prénom', profile.firstName, v => set('firstName', v))}
            {inp('Nom', profile.lastName, v => set('lastName', v))}
            {inp('Titre professionnel', profile.title, v => set('title', v), { placeholder: 'Ex: Développeur Full Stack' })}
            {inp('Email', profile.email, v => set('email', v), { type: 'email' })}
            {inp('Téléphone', profile.phone, v => set('phone', v), { type: 'tel' })}
            {inp('Adresse', profile.address, v => set('address', v))}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-600 border-t pt-3">Liens professionnels</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Linkedin size={11} /> LinkedIn</label>
                <input type="url" value={profile.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Github size={11} /> GitHub</label>
                <input type="url" value={profile.githubUrl} onChange={e => set('githubUrl', e.target.value)}
                  placeholder="https://github.com/…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Globe size={11} /> Portfolio</label>
                <input type="url" value={profile.portfolioUrl} onChange={e => set('portfolioUrl', e.target.value)}
                  placeholder="https://…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t pt-3">
            <h4 className="text-xs font-semibold text-gray-600">Objectif professionnel</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inp('Poste ciblé', profile.targetPosition, v => set('targetPosition', v), { placeholder: 'Ex: Lead Developer' })}
              {inp('Salaire min souhaité', profile.targetSalaryMin.toString(), v => set('targetSalaryMin', parseInt(v) || 0), { type: 'number' })}
              {inp('Salaire max souhaité', profile.targetSalaryMax.toString(), v => set('targetSalaryMax', parseInt(v) || 0), { type: 'number' })}
            </div>
          </div>

          <div className="border-t pt-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Bio / Résumé</label>
            <textarea value={profile.bio} onChange={e => set('bio', e.target.value)} rows={4}
              placeholder="Décrivez-vous en quelques phrases…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      )}

      {/* ─── Tab: Compétences ─── */}
      {activeTab === 'competences' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Compétences techniques</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills.map(skill => (
                <span key={skill} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Ajouter une compétence…"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={addSkill} className="px-3 py-2 bg-ohada-blue text-white rounded-lg hover:bg-blue-800 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Langues</h4>
            <div className="space-y-2 mb-3">
              {profile.languages.map(lang => (
                <div key={lang.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm font-medium text-gray-700">{lang.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{lang.level}</span>
                  <button onClick={() => removeLanguage(lang.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLang.name}
                onChange={e => setNewLang(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Langue"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newLang.level}
                onChange={e => setNewLang(prev => ({ ...prev, level: e.target.value as LanguageLevel }))}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={addLanguage} className="px-3 py-2 bg-ohada-blue text-white rounded-lg hover:bg-blue-800 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Expériences ─── */}
      {activeTab === 'experiences' && (
        <div className="space-y-4">
          {profile.experiences.map((exp, i) => (
            <div key={exp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400">Expérience {i + 1}</span>
                <button onClick={() => removeExp(exp.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SmallInput label="Entreprise" value={exp.company} onChange={v => updateExp(exp.id, { company: v })} />
                <SmallInput label="Poste" value={exp.position} onChange={v => updateExp(exp.id, { position: v })} />
                <SmallInput label="Début" value={exp.startDate} onChange={v => updateExp(exp.id, { startDate: v })} type="date" />
                <div>
                  <SmallInput label="Fin" value={exp.endDate ?? ''} onChange={v => updateExp(exp.id, { endDate: v })} type="date" />
                  <label className="flex items-center gap-2 mt-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={exp.current} onChange={e => updateExp(exp.id, { current: e.target.checked, endDate: '' })}
                      className="rounded" />
                    Poste actuel
                  </label>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={exp.description} onChange={e => updateExp(exp.id, { description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          ))}
          <button onClick={addExperience}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
            <Plus size={16} /> Ajouter une expérience
          </button>
        </div>
      )}

      {/* ─── Tab: Formation ─── */}
      {activeTab === 'formation' && (
        <div className="space-y-4">
          {profile.education.map((edu, i) => (
            <div key={edu.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400">Formation {i + 1}</span>
                <button onClick={() => removeEdu(edu.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SmallInput label="École / Université" value={edu.school} onChange={v => updateEdu(edu.id, { school: v })} />
                <SmallInput label="Diplôme" value={edu.degree} onChange={v => updateEdu(edu.id, { degree: v })} placeholder="Ex: Master, Licence…" />
                <SmallInput label="Domaine" value={edu.field} onChange={v => updateEdu(edu.id, { field: v })} placeholder="Ex: Informatique" />
                <SmallInput label="Début" value={edu.startDate} onChange={v => updateEdu(edu.id, { startDate: v })} type="date" />
                <div>
                  <SmallInput label="Fin" value={edu.endDate ?? ''} onChange={v => updateEdu(edu.id, { endDate: v })} type="date" />
                  <label className="flex items-center gap-2 mt-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={edu.current} onChange={e => updateEdu(edu.id, { current: e.target.checked, endDate: '' })}
                      className="rounded" />
                    En cours
                  </label>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addEducation}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
            <Plus size={16} /> Ajouter une formation
          </button>
        </div>
      )}

      {/* ─── Tab: Certifications ─── */}
      {activeTab === 'certifications' && (
        <div className="space-y-4">
          {profile.certifications.map((cert, i) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400">Certification {i + 1}</span>
                <button onClick={() => removeCert(cert.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SmallInput label="Nom" value={cert.name} onChange={v => updateCert(cert.id, { name: v })} />
                <SmallInput label="Émetteur" value={cert.issuer} onChange={v => updateCert(cert.id, { issuer: v })} placeholder="Ex: Google, AWS, Microsoft…" />
                <SmallInput label="Date" value={cert.date} onChange={v => updateCert(cert.id, { date: v })} type="date" />
                <SmallInput label="Lien de vérification" value={cert.url} onChange={v => updateCert(cert.id, { url: v })} type="url" placeholder="https://…" />
              </div>
            </div>
          ))}
          <button onClick={addCert}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
            <Plus size={16} /> Ajouter une certification
          </button>
        </div>
      )}
    </div>
  )
}

function SmallInput({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? ''}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}
