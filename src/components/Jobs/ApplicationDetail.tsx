import { ArrowLeft, Edit2, Trash2, MapPin, Calendar, ExternalLink, User, Tag, Clock } from 'lucide-react'
import { useJobs } from '../../context/JobContext'
import { useAccounting } from '../../context/AccountingContext'
import { STATUS_META } from '../../types/jobs'
import type { ApplicationStatus } from '../../types/jobs'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

const STATUS_FLOW: ApplicationStatus[] = [
  'envoyee', 'en_attente', 'entretien', 'test_technique', 'offre', 'accepte',
]

export default function ApplicationDetail() {
  const { selectedApplication, deleteApplication, updateStatus, selectApplication } = useJobs()
  const { setView } = useAccounting()

  if (!selectedApplication) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>Aucune candidature sélectionnée</p>
        <button onClick={() => setView('job-list' as never)} className="mt-2 text-sm text-blue-600 hover:underline">
          Retour à la liste
        </button>
      </div>
    )
  }

  const app = selectedApplication
  const meta = STATUS_META[app.status]

  const handleDelete = () => {
    if (confirm(`Supprimer la candidature chez ${app.companyName} ?`)) {
      deleteApplication(app.id)
      setView('job-list' as never)
    }
  }

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    updateStatus(app.id, newStatus)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => setView('job-list' as never)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">{app.position}</h2>
          <p className="text-sm text-gray-500">{app.companyName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('job-edit' as never)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Edit2 size={14} /> Modifier
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Statut actuel</h3>
          <span className={`text-sm px-3 py-1 rounded-full border font-medium ${meta.bg} ${meta.color} ${meta.border}`}>
            {meta.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map(s => {
            const m = STATUS_META[s]
            const isActive = app.status === s
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  isActive
                    ? `${m.bg} ${m.color} ${m.border} font-semibold`
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {m.label}
              </button>
            )
          })}
          <button
            onClick={() => handleStatusChange('refuse')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              app.status === 'refuse'
                ? 'bg-red-100 text-red-700 border-red-300 font-semibold'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            Refusé
          </button>
          <button
            onClick={() => handleStatusChange('abandonne')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              app.status === 'abandonne'
                ? 'bg-gray-100 text-gray-600 border-gray-300 font-semibold'
                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Abandonné
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Détails du poste</h3>
          <div className="space-y-2 text-sm">
            <Row label="Contrat" value={app.contractType} />
            {app.location && (
              <Row label="Lieu" value={
                <span className="flex items-center gap-1">
                  <MapPin size={12} />{app.location}
                  {app.remote !== 'non' && ` · ${app.remote === 'total' ? 'Full remote' : 'Hybride'}`}
                </span>
              } />
            )}
            {(app.salaryMin || app.salaryMax) && (
              <Row label="Salaire" value={
                `${app.salaryMin ? app.salaryMin.toLocaleString() : '?'} – ${app.salaryMax ? app.salaryMax.toLocaleString() : '?'} ${app.currency}`
              } />
            )}
            <Row label="Source" value={app.source} />
            {app.jobUrl && (
              <Row label="Offre" value={
                <a href={app.jobUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                  Voir l'annonce <ExternalLink size={11} />
                </a>
              } />
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Dates clés</h3>
          <div className="space-y-2 text-sm">
            {app.appliedAt && (
              <Row label="Candidature envoyée" value={
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {format(parseISO(app.appliedAt), 'd MMMM yyyy', { locale: fr })}
                </span>
              } />
            )}
            {app.deadlineAt && (
              <Row label="Date limite" value={format(parseISO(app.deadlineAt), 'd MMMM yyyy', { locale: fr })} />
            )}
            {app.followUpAt && (
              <Row label="Relance prévue" value={
                <span className="flex items-center gap-1 text-orange-600">
                  <Clock size={12} />
                  {format(parseISO(app.followUpAt), 'd MMMM yyyy', { locale: fr })}
                </span>
              } />
            )}
            <Row label="Créée le" value={format(parseISO(app.createdAt), 'd MMM yyyy', { locale: fr })} />
          </div>
        </div>
      </div>

      {/* Contact */}
      {(app.contactName || app.contactEmail || app.contactPhone) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
            <User size={14} /> Contact recruteur
          </h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {app.contactName && <Row label="Nom" value={app.contactName} />}
            {app.contactEmail && (
              <Row label="Email" value={
                <a href={`mailto:${app.contactEmail}`} className="text-blue-600 hover:underline">{app.contactEmail}</a>
              } />
            )}
            {app.contactPhone && (
              <Row label="Téléphone" value={
                <a href={`tel:${app.contactPhone}`} className="text-blue-600 hover:underline">{app.contactPhone}</a>
              } />
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {app.tags.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-2 flex-wrap">
          <Tag size={14} className="text-gray-400" />
          {app.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {app.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Notes</h3>
          <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap">{app.notes}</p>
        </div>
      )}

      {/* Timeline */}
      {app.timeline.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Historique</h3>
          <div className="mt-3 relative pl-5">
            <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gray-200" />
            {app.timeline.slice().reverse().map(event => {
              const em = STATUS_META[event.status]
              return (
                <div key={event.id} className="relative mb-4 last:mb-0">
                  <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 border-white ${em.bg}`} />
                  <div className="ml-2">
                    <span className={`text-xs font-semibold ${em.color}`}>{em.label}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {format(parseISO(event.date), 'd MMM yyyy HH:mm', { locale: fr })}
                    </span>
                    {event.note && <p className="text-xs text-gray-500 mt-0.5">{event.note}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 w-32 flex-shrink-0">{label}</span>
      <span className="text-gray-700 font-medium">{value}</span>
    </div>
  )
}
