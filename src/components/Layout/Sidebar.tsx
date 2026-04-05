import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Paperclip,
  Scale,
  TrendingUp,
  ArrowLeftRight,
  BarChart3,
  List,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { useAccounting } from '../../context/AccountingContext'
import type { ActiveView } from '../../types'

interface NavItem {
  id: ActiveView
  label: string
  icon: React.ElementType
  group?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',       label: 'Tableau de Bord',      icon: LayoutDashboard, group: 'general' },
  { id: 'new-entry',       label: 'Nouvelle Écriture',    icon: PlusCircle,       group: 'comptabilite' },
  { id: 'journal',         label: 'Journal Général',      icon: BookOpen,         group: 'comptabilite' },
  { id: 'plan-comptable',  label: 'Plan Comptable',       icon: List,             group: 'comptabilite' },
  { id: 'evidences',       label: 'Pièces Justificatives',icon: Paperclip,        group: 'evidences' },
  { id: 'bilan',           label: 'Bilan',                icon: Scale,            group: 'rapports' },
  { id: 'compte-resultat', label: 'Compte de Résultat',   icon: TrendingUp,       group: 'rapports' },
  { id: 'cash-flow',       label: 'Flux de Trésorerie',   icon: ArrowLeftRight,   group: 'rapports' },
  { id: 'ratios',          label: 'Ratios Financiers',    icon: BarChart3,        group: 'rapports' },
  { id: 'parametres',      label: 'Paramètres',           icon: Settings,         group: 'config' },
]

const GROUP_LABELS: Record<string, string> = {
  general:       'Général',
  comptabilite:  'Comptabilité',
  evidences:     'Documents',
  rapports:      'Rapports OHADA',
  config:        'Configuration',
}

export default function Sidebar() {
  const { state, setView } = useAccounting()
  const grouped = NAV_ITEMS.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group ?? 'other'
    if (!acc[g]) acc[g] = []
    acc[g].push(item)
    return acc
  }, {})

  return (
    <aside className="w-64 min-h-screen bg-ohada-blue flex flex-col shadow-xl">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-blue-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-ohada-gold flex items-center justify-center text-white font-bold text-lg select-none">
            ₣
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SYSCOHADA</p>
            <p className="text-blue-300 text-xs leading-tight">Tableau de Bord</p>
          </div>
        </div>
      </div>

      {/* Company */}
      <div className="px-4 py-3 border-b border-blue-800">
        <p className="text-blue-300 text-xs uppercase tracking-wide font-semibold mb-0.5">Entreprise</p>
        <p className="text-white text-sm font-medium truncate">{state.company.name}</p>
        <p className="text-blue-300 text-xs">{state.company.currency} · {state.company.ninea}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <p className="px-2 mb-1 text-blue-400 text-xs uppercase tracking-widest font-semibold">
              {GROUP_LABELS[group]}
            </p>
            {items.map(item => {
              const Icon = item.icon
              const active = state.activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    active
                      ? 'bg-ohada-gold text-white shadow-md'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {active && <ChevronRight size={14} />}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-blue-800">
        <p className="text-blue-400 text-xs text-center">
          OHADA · SYSCOHADA Révisé 2017
        </p>
      </div>
    </aside>
  )
}
