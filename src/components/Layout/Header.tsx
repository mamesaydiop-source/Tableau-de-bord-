import { Bell, Calendar, RefreshCw } from 'lucide-react'
import { useAccounting } from '../../context/AccountingContext'
import { formatDateLong } from '../../utils/format'

const VIEW_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard:       { title: 'Tableau de Bord',       subtitle: 'Vue d\'ensemble financière' },
  journal:         { title: 'Journal Général',        subtitle: 'Toutes les écritures comptables' },
  'new-entry':     { title: 'Nouvelle Écriture',      subtitle: 'Saisie d\'une opération comptable' },
  evidences:       { title: 'Pièces Justificatives',  subtitle: 'Gestion des preuves et documents' },
  bilan:           { title: 'Bilan Comptable',        subtitle: 'État de la situation financière' },
  'compte-resultat': { title: 'Compte de Résultat',  subtitle: 'Résultat des activités ordinaires et HAO' },
  'cash-flow':     { title: 'Flux de Trésorerie',     subtitle: 'Tableau des flux de trésorerie OHADA' },
  ratios:          { title: 'Ratios Financiers',      subtitle: 'Analyse et diagnostic OHADA' },
  'plan-comptable':{ title: 'Plan Comptable',         subtitle: 'SYSCOHADA Révisé – Classes 1 à 8' },
  parametres:      { title: 'Paramètres',             subtitle: 'Configuration de l\'entreprise' },
}

export default function Header() {
  const { state, activeFiscalYear } = useAccounting()
  const { title, subtitle } = VIEW_TITLES[state.activeView] ?? { title: '', subtitle: '' }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shadow-sm">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-gray-800 leading-tight">{title}</h1>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>

      {/* Fiscal Year */}
      {activeFiscalYear && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
          <Calendar size={14} className="text-blue-600" />
          <span className="text-xs font-semibold text-blue-700">
            Exercice {activeFiscalYear.label}
          </span>
        </div>
      )}

      {/* Date */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
        <RefreshCw size={12} />
        <span>{formatDateLong(new Date().toISOString())}</span>
      </div>

      {/* Notification bell placeholder */}
      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Bell size={18} className="text-gray-600" />
        {state.entries.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-ohada-gold" />
        )}
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-ohada-blue flex items-center justify-center text-white text-xs font-bold select-none">
        {state.company.name.charAt(0)}
      </div>
    </header>
  )
}
