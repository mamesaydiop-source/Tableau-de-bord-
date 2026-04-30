import {
  Briefcase, TrendingUp, Clock, CheckCircle, XCircle,
  Calendar, Target, ArrowRight, Plus,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useJobs } from '../../context/JobContext'
import { useAccounting } from '../../context/AccountingContext'
import { STATUS_META } from '../../types/jobs'
import type { ApplicationStatus } from '../../types/jobs'
import { format, parseISO, isAfter, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'

const STATUS_ORDER: ApplicationStatus[] = [
  'envoyee', 'en_attente', 'entretien', 'test_technique', 'offre', 'accepte', 'refuse',
]

const PIE_COLORS = ['#3B82F6','#EAB308','#8B5CF6','#F97316','#14B8A6','#22C55E','#EF4444','#6B7280']

export default function JobDashboard() {
  const { state, selectApplication } = useJobs()
  const { setView } = useAccounting()
  const { applications, profile } = state

  const total = applications.length
  const active = applications.filter(a =>
    !['refuse', 'abandonne', 'accepte'].includes(a.status)
  ).length
  const accepted = applications.filter(a => a.status === 'accepte').length
  const interviews = applications.filter(a =>
    ['entretien', 'test_technique'].includes(a.status)
  ).length
  const responseRate = total > 0
    ? Math.round(
        (applications.filter(a => a.status !== 'brouillon' && a.status !== 'envoyee').length / total) * 100
      )
    : 0

  // By status for pie
  const pieData = STATUS_ORDER.map(s => ({
    name: STATUS_META[s].label,
    value: applications.filter(a => a.status === s).length,
  })).filter(d => d.value > 0)

  // By month for bar
  const monthMap: Record<string, number> = {}
  applications.forEach(a => {
    if (!a.appliedAt) return
    const key = format(parseISO(a.appliedAt), 'MMM yy', { locale: fr })
    monthMap[key] = (monthMap[key] ?? 0) + 1
  })
  const barData = Object.entries(monthMap).slice(-6).map(([month, count]) => ({ month, count }))

  // Recent applications
  const recent = [...applications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Follow-ups due
  const followUps = applications.filter(a => {
    if (!a.followUpAt) return false
    return !isAfter(parseISO(a.followUpAt), new Date())
  })

  const statCards = [
    { label: 'Total candidatures', value: total, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'En cours', value: active, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Entretiens', value: interviews, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Taux de réponse', value: `${responseRate}%`, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Acceptées', value: accepted, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Relances dues', value: followUps.length, icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      {profile.firstName && (
        <div className="bg-gradient-to-r from-ohada-blue to-blue-700 text-white rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">Bonjour,</p>
            <h2 className="text-xl font-bold">{profile.firstName} {profile.lastName}</h2>
            {profile.targetPosition && (
              <p className="text-blue-200 text-sm mt-0.5">Objectif : {profile.targetPosition}</p>
            )}
          </div>
          <button
            onClick={() => setView('job-new' as never)}
            className="flex items-center gap-2 bg-white text-ohada-blue font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
          >
            <Plus size={16} />
            Nouvelle candidature
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                <Icon size={18} className={card.color} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Répartition par statut</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false} fontSize={11}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              Aucune candidature pour l'instant
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Candidatures par mois</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Candidatures" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Dernières candidatures</h3>
            <button onClick={() => setView('job-list' as never)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucune candidature</p>
          ) : (
            <ul className="space-y-2">
              {recent.map(app => {
                const meta = STATUS_META[app.status]
                return (
                  <li
                    key={app.id}
                    onClick={() => { selectApplication(app.id); setView('job-detail' as never) }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                      {app.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{app.position}</p>
                      <p className="text-xs text-gray-500 truncate">{app.companyName}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border} flex-shrink-0`}>
                      {meta.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Follow-ups */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Target size={16} className="text-orange-500" />
            Relances à faire
          </h3>
          {followUps.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucune relance prévue</p>
          ) : (
            <ul className="space-y-2">
              {followUps.map(app => (
                <li
                  key={app.id}
                  onClick={() => { selectApplication(app.id); setView('job-detail' as never) }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors border border-orange-100"
                >
                  <XCircle size={16} className="text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{app.position}</p>
                    <p className="text-xs text-gray-500 truncate">{app.companyName}</p>
                  </div>
                  <span className="text-xs text-orange-600 font-medium flex-shrink-0">
                    {app.followUpAt ? format(parseISO(app.followUpAt), 'd MMM', { locale: fr }) : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
