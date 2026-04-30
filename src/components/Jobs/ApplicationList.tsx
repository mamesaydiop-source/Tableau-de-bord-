import { useState } from 'react'
import { Search, Plus, Filter, Trash2, Eye, Edit2, MapPin, Calendar } from 'lucide-react'
import { useJobs } from '../../context/JobContext'
import { useAccounting } from '../../context/AccountingContext'
import { STATUS_META } from '../../types/jobs'
import type { ApplicationStatus, ContractType } from '../../types/jobs'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

const ALL_STATUSES: ApplicationStatus[] = [
  'brouillon', 'envoyee', 'en_attente', 'entretien', 'test_technique', 'offre', 'accepte', 'refuse', 'abandonne',
]

export default function ApplicationList() {
  const { state, deleteApplication, selectApplication } = useJobs()
  const { setView } = useAccounting()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all')
  const [filterContract, setFilterContract] = useState<ContractType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'status'>('date')

  const contracts: ContractType[] = ['CDI', 'CDD', 'stage', 'alternance', 'freelance', 'autre']

  const filtered = state.applications
    .filter(a => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        a.companyName.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'all' || a.status === filterStatus
      const matchContract = filterContract === 'all' || a.contractType === filterContract
      return matchSearch && matchStatus && matchContract
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'company') return a.companyName.localeCompare(b.companyName)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return 0
    })

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par entreprise, poste, ville…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as ApplicationStatus | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Tous les statuts</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>

          {/* Contract filter */}
          <select
            value={filterContract}
            onChange={e => setFilterContract(e.target.value as ContractType | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Tous les contrats</option>
            {contracts.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'date' | 'company' | 'status')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="date">Trier par date</option>
            <option value="company">Trier par entreprise</option>
            <option value="status">Trier par statut</option>
          </select>

          {/* New button */}
          <button
            onClick={() => { selectApplication(null); setView('job-new' as never) }}
            className="flex items-center gap-2 bg-ohada-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors flex-shrink-0"
          >
            <Plus size={16} />
            Nouvelle
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <Filter size={12} />
          <span>{filtered.length} candidature{filtered.length !== 1 ? 's' : ''} affichée{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">Aucune candidature trouvée</p>
          <button
            onClick={() => setView('job-new' as never)}
            className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <Plus size={14} /> Ajouter une candidature
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const meta = STATUS_META[app.status]
            return (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
                    {app.companyName.charAt(0).toUpperCase()}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{app.position}</h3>
                        <p className="text-sm text-gray-600">{app.companyName}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${meta.bg} ${meta.color} ${meta.border}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {app.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {app.location}
                          {app.remote !== 'non' && ` · ${app.remote === 'total' ? 'Full remote' : 'Hybride'}`}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">{app.contractType}</span>
                      {app.source && <span className="text-gray-400">{app.source}</span>}
                      {app.appliedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {format(parseISO(app.appliedAt), 'd MMM yyyy', { locale: fr })}
                        </span>
                      )}
                    </div>

                    {app.notes && (
                      <p className="mt-2 text-xs text-gray-400 line-clamp-1">{app.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => { selectApplication(app.id); setView('job-detail' as never) }}
                      className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Voir"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => { selectApplication(app.id); setView('job-edit' as never) }}
                      className="p-2 rounded-lg hover:bg-yellow-50 text-gray-500 hover:text-yellow-600 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer la candidature chez ${app.companyName} ?`)) {
                          deleteApplication(app.id)
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
