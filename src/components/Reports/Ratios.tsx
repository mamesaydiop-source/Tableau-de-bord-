import { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { Info } from 'lucide-react'
import { useAccounting } from '../../context/AccountingContext'
import { computeFinancialRatios, formatRatioValue } from '../../utils/financial-ratios'
import type { FinancialRatio, RatioCategory } from '../../types'

const CATEGORY_META: Record<RatioCategory, { label: string; color: string; bg: string }> = {
  rentabilite: { label: 'Rentabilité',        color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  liquidite:   { label: 'Liquidité',          color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200' },
  solvabilite: { label: 'Solvabilité',        color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  activite:    { label: 'Activité / Gestion', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  equilibre:   { label: 'Équilibre Financier',color: 'text-ohada-blue', bg: 'bg-blue-50 border-blue-300' },
}

const STATUS_META = {
  bon:     { label: 'Bon',     color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500' },
  moyen:   { label: 'Moyen',   color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  mauvais: { label: 'Mauvais', color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500' },
  neutre:  { label: 'N/D',     color: 'text-gray-500',   bg: 'bg-gray-100',   dot: 'bg-gray-400' },
}

function RatioCard({ ratio }: { ratio: FinancialRatio }) {
  const [showInfo, setShowInfo] = useState(false)
  const status = STATUS_META[ratio.status]
  const catMeta = CATEGORY_META[ratio.category]
  const pct = ratio.benchmark && ratio.value !== null
    ? Math.min(100, Math.max(0, ((ratio.value - ratio.benchmark.min) / (ratio.benchmark.max - ratio.benchmark.min)) * 100))
    : null

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${catMeta.bg} relative`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className={`text-xs font-semibold leading-tight ${catMeta.color}`}>{ratio.label}</p>
        <button
          onClick={() => setShowInfo(v => !v)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <Info size={13} />
        </button>
      </div>

      {/* Value */}
      <p className={`text-2xl font-bold mt-2 ${ratio.value === null ? 'text-gray-400' : status.color}`}>
        {formatRatioValue(ratio.value, ratio.unit)}
      </p>

      {/* Benchmark bar */}
      {pct !== null && (
        <div className="mt-2">
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                ratio.status === 'bon' ? 'bg-green-500' :
                ratio.status === 'moyen' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>{formatRatioValue(ratio.benchmark!.min, ratio.unit)}</span>
            <span>{formatRatioValue(ratio.benchmark!.max, ratio.unit)}</span>
          </div>
        </div>
      )}

      {/* Status badge */}
      <div className="flex items-center gap-1.5 mt-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
        <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
      </div>

      {/* Formula */}
      <p className="text-xs text-gray-400 mt-1 font-mono">{ratio.formula}</p>

      {/* Tooltip description */}
      {showInfo && (
        <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
          {ratio.description}
          {ratio.benchmark && (
            <p className="mt-1 text-gray-300">
              Norme : {formatRatioValue(ratio.benchmark.min, ratio.unit)} – {formatRatioValue(ratio.benchmark.max, ratio.unit)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function RatiosDashboard() {
  const [activeCategory, setActiveCategory] = useState<RatioCategory | 'all'>('all')
  const {
    getChiffreAffaires, getTotalCharges, getTotalProduits, getResultatNet,
    getActifTotal, getCapitauxPropres, getDettesFinancieres,
    getActifCirculant, getPassifCirculant, getTresorerie,
    getCreancesClients, getDettesF, getStocks, getImmobilisationsNettes,
  } = useAccounting()

  const ratios = computeFinancialRatios({
    chiffreAffaires:     getChiffreAffaires(),
    totalCharges:        getTotalCharges(),
    totalProduits:       getTotalProduits(),
    resultatNet:         getResultatNet(),
    actifTotal:          getActifTotal(),
    passifTotal:         getActifTotal(),
    capitauxPropres:     getCapitauxPropres(),
    dettesFinancieres:   getDettesFinancieres(),
    actifCirculant:      getActifCirculant(),
    passifCirculant:     getPassifCirculant(),
    tresorerie:          getTresorerie(),
    creancesClients:     getCreancesClients(),
    dettesF:             getDettesF(),
    stocks:              getStocks(),
    immobilisationsNettes: getImmobilisationsNettes(),
  })

  const displayed = activeCategory === 'all'
    ? ratios
    : ratios.filter(r => r.category === activeCategory)

  // Score global (% de ratios "bon")
  const validRatios = ratios.filter(r => r.value !== null)
  const score = validRatios.length === 0 ? 0
    : Math.round((validRatios.filter(r => r.status === 'bon').length / validRatios.length) * 100)

  // Radar data
  const radarData = Object.entries(CATEGORY_META).map(([cat, meta]) => {
    const catRatios = ratios.filter(r => r.category === cat && r.value !== null)
    const bonCount = catRatios.filter(r => r.status === 'bon').length
    const score = catRatios.length > 0 ? Math.round((bonCount / catRatios.length) * 100) : 0
    return { subject: meta.label, score }
  })

  const scoreBg = score >= 70 ? 'from-green-600 to-green-700'
    : score >= 40 ? 'from-yellow-500 to-orange-600'
    : 'from-red-600 to-red-700'

  return (
    <div className="space-y-5">
      {/* Header with score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`bg-gradient-to-br ${scoreBg} rounded-xl p-5 text-white col-span-1`}>
          <p className="text-sm font-semibold opacity-80 uppercase tracking-wide">Score Financier Global</p>
          <p className="text-5xl font-bold mt-2">{score}<span className="text-2xl">%</span></p>
          <p className="text-sm opacity-70 mt-1">
            {validRatios.filter(r => r.status === 'bon').length}/{validRatios.length} ratios favorables
          </p>
          <div className="w-full h-2 bg-white/30 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${score}%` }} />
          </div>
        </div>

        {/* Radar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 col-span-2">
          <p className="text-xs font-semibold text-gray-600 mb-2">Performance par Catégorie (%)</p>
          <ResponsiveContainer width="100%" height={170}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <Radar dataKey="score" stroke="#1A3A6B" fill="#1A3A6B" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip formatter={(v: number) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'all' ? 'bg-ohada-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous ({ratios.length})
        </button>
        {(Object.entries(CATEGORY_META) as [RatioCategory, typeof CATEGORY_META[RatioCategory]][]).map(([cat, meta]) => {
          const count = ratios.filter(r => r.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === cat ? `${meta.bg} ${meta.color} border-current` : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent'
              }`}
            >
              {meta.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {Object.entries(STATUS_META).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
            <span>{v.label}</span>
          </div>
        ))}
        <span className="ml-2 text-gray-400">· Cliquer sur ℹ pour l'interprétation</span>
      </div>

      {/* Ratio grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayed.map(r => <RatioCard key={r.id} ratio={r} />)}
      </div>

      {/* OHADA note */}
      <div className="bg-ohada-blue/5 border border-ohada-blue/20 rounded-xl p-4 text-xs text-gray-600">
        <p className="font-semibold text-ohada-blue mb-1">📋 Référentiel OHADA – SYSCOHADA Révisé 2017</p>
        <p>
          Les normes utilisées sont conformes aux dispositions de l'Acte Uniforme OHADA relatif au droit comptable
          et à l'information financière (AUDCIF), adopté le 26 janvier 2017. Les ratios d'équilibre financier
          (FRNG, BFR, TN) suivent la méthodologie du Plan Comptable Général OHADA (PCG-OHADA).
        </p>
      </div>
    </div>
  )
}
