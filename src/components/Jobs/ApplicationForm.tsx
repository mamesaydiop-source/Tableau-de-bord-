import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Briefcase } from 'lucide-react'
import { useJobs } from '../../context/JobContext'
import { useAccounting } from '../../context/AccountingContext'
import type { JobApplication, ApplicationStatus, ContractType, ApplicationSource } from '../../types/jobs'

interface FormData {
  companyName: string
  position: string
  contractType: ContractType
  location: string
  remote: 'non' | 'partiel' | 'total'
  salaryMin: string
  salaryMax: string
  currency: string
  status: ApplicationStatus
  appliedAt: string
  deadlineAt: string
  notes: string
  contactName: string
  contactEmail: string
  contactPhone: string
  jobUrl: string
  source: ApplicationSource
  followUpAt: string
  tags: string
}

const EMPTY_FORM: FormData = {
  companyName: '', position: '', contractType: 'CDI', location: '',
  remote: 'non', salaryMin: '', salaryMax: '', currency: 'XOF',
  status: 'envoyee', appliedAt: new Date().toISOString().split('T')[0],
  deadlineAt: '', notes: '', contactName: '', contactEmail: '',
  contactPhone: '', jobUrl: '', source: 'LinkedIn', followUpAt: '', tags: '',
}

const SOURCES: ApplicationSource[] = [
  'LinkedIn', 'Indeed', 'Welcome to the Jungle', 'Candidature spontanée', 'Réseau', 'Site entreprise', 'Autre',
]

const CONTRACT_TYPES: ContractType[] = ['CDI', 'CDD', 'stage', 'alternance', 'freelance', 'autre']

const STATUSES: ApplicationStatus[] = [
  'brouillon', 'envoyee', 'en_attente', 'entretien', 'test_technique', 'offre', 'accepte', 'refuse', 'abandonne',
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  brouillon: 'Brouillon', envoyee: 'Envoyée', en_attente: 'En attente',
  entretien: 'Entretien', test_technique: 'Test technique', offre: 'Offre reçue',
  accepte: 'Accepté', refuse: 'Refusé', abandonne: 'Abandonné',
}

function appToForm(app: JobApplication): FormData {
  return {
    companyName: app.companyName,
    position: app.position,
    contractType: app.contractType,
    location: app.location,
    remote: app.remote,
    salaryMin: app.salaryMin?.toString() ?? '',
    salaryMax: app.salaryMax?.toString() ?? '',
    currency: app.currency,
    status: app.status,
    appliedAt: app.appliedAt ? app.appliedAt.split('T')[0] : '',
    deadlineAt: app.deadlineAt ? app.deadlineAt.split('T')[0] : '',
    notes: app.notes,
    contactName: app.contactName ?? '',
    contactEmail: app.contactEmail ?? '',
    contactPhone: app.contactPhone ?? '',
    jobUrl: app.jobUrl ?? '',
    source: app.source,
    followUpAt: app.followUpAt ? app.followUpAt.split('T')[0] : '',
    tags: app.tags.join(', '),
  }
}

export default function ApplicationForm() {
  const { state, addApplication, updateApplication, selectedApplication } = useJobs()
  const { setView } = useAccounting()
  const isEditing = state.selectedApplicationId !== null && selectedApplication !== null

  const [form, setForm] = useState<FormData>(
    isEditing && selectedApplication ? appToForm(selectedApplication) : EMPTY_FORM
  )
  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    if (isEditing && selectedApplication) {
      setForm(appToForm(selectedApplication))
    }
  }, [isEditing, selectedApplication])

  const set = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const e: Partial<FormData> = {}
    if (!form.companyName.trim()) e.companyName = 'Champ requis'
    if (!form.position.trim()) e.position = 'Champ requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const data = {
      companyName: form.companyName.trim(),
      position: form.position.trim(),
      contractType: form.contractType,
      location: form.location.trim(),
      remote: form.remote,
      salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
      currency: form.currency,
      status: form.status,
      appliedAt: form.appliedAt || undefined,
      deadlineAt: form.deadlineAt || undefined,
      notes: form.notes.trim(),
      contactName: form.contactName.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      jobUrl: form.jobUrl.trim() || undefined,
      source: form.source,
      followUpAt: form.followUpAt || undefined,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }

    if (isEditing && selectedApplication) {
      updateApplication({ ...selectedApplication, ...data })
    } else {
      addApplication(data)
    }
    setView('job-list' as never)
  }

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )

  const input = (field: keyof FormData, type = 'text', placeholder = '') => (
    <input
      type={type}
      value={form[field] as string}
      onChange={e => set(field, e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        errors[field] ? 'border-red-400' : 'border-gray-200'
      }`}
    />
  )

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('job-list' as never)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Briefcase size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">
            {isEditing ? 'Modifier la candidature' : 'Nouvelle candidature'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Entreprise & Poste */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">Informations principales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Entreprise *" error={errors.companyName}>
              {input('companyName', 'text', 'Ex: Google, Sonatel…')}
            </Field>
            <Field label="Poste *" error={errors.position}>
              {input('position', 'text', 'Ex: Développeur Full Stack')}
            </Field>
            <Field label="Type de contrat">
              <select value={form.contractType} onChange={e => set('contractType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {CONTRACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Statut">
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">Localisation & Salaire</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Ville / Lieu">{input('location', 'text', 'Ex: Dakar, Paris, Remote…')}</Field>
            <Field label="Télétravail">
              <select value={form.remote} onChange={e => set('remote', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="non">Sur site</option>
                <option value="partiel">Hybride</option>
                <option value="total">Full remote</option>
              </select>
            </Field>
            <Field label="Salaire min">
              <div className="flex">
                {input('salaryMin', 'number', '0')}
              </div>
            </Field>
            <Field label="Salaire max">
              {input('salaryMax', 'number', '0')}
            </Field>
            <Field label="Devise">
              <select value={form.currency} onChange={e => set('currency', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="XOF">XOF (FCFA)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="MAD">MAD (DH)</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Dates & Source */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">Dates & Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Date de candidature">{input('appliedAt', 'date')}</Field>
            <Field label="Date limite">{input('deadlineAt', 'date')}</Field>
            <Field label="Relance prévue">{input('followUpAt', 'date')}</Field>
            <Field label="Source">
              <select value={form.source} onChange={e => set('source', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Lien de l'offre" error={errors.jobUrl}>
              {input('jobUrl', 'url', 'https://…')}
            </Field>
            <Field label="Tags (séparés par des virgules)">
              {input('tags', 'text', 'Ex: IA, startup, international')}
            </Field>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">Contact recruteur</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Nom">{input('contactName', 'text', 'Ex: Marie Dupont')}</Field>
            <Field label="Email">{input('contactEmail', 'email', 'recruteur@…')}</Field>
            <Field label="Téléphone">{input('contactPhone', 'tel', '+221…')}</Field>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-2">
          <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">Notes & Préparation</h3>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={4}
            placeholder="Notes sur le poste, préparation entretien, points importants…"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-4">
          <button
            type="button"
            onClick={() => setView('job-list' as never)}
            className="px-5 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-ohada-blue text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Save size={15} />
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter la candidature'}
          </button>
        </div>
      </form>
    </div>
  )
}
