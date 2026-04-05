import {
  TrendingUp, TrendingDown, Scale, Banknote,
  FileText, Paperclip, PlusCircle, BarChart3,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useAccounting } from '../../context/AccountingContext'
import { formatMontant, formatDate } from '../../utils/format'
import { computeFinancialRatios } from '../../utils/financial-ratios'

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon size={22} className={color} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {trend === 'up'
            ? <TrendingUp size={12} className="text-green-500" />
            : trend === 'down'
            ? <TrendingDown size={12} className="text-red-500" />
            : null}
          <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400'}>
            {trend === 'up' ? 'En hausse' : trend === 'down' ? 'En baisse' : 'Stable'}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Quick Action Button ──────────────────────────────────────────────────────

function QuickAction({ label, icon: Icon, onClick, color }: {
  label: string
  icon: React.ElementType
  onClick: () => void
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all hover:shadow-md ${color}`}
    >
      <Icon size={24} />
      <span className="text-xs font-medium text-center">{label}</span>
    </button>
  )
}

const COLORS = ['#1A3A6B', '#D4A017', '#2E7D32', '#C62828', '#1565C0', '#6A1B9A']

export default function Overview() {
  const {
    state, setView,
    getChiffreAffaires, getTotalCharges, getTotalProduits, getResultatNet,
    getActifTotal, getTresorerie, getCapitauxPropres, getDettesFinancieres,
    getActifCirculant, getPassifCirculant, getStocks, getCreancesClients,
    getDettesF, getImmobilisationsNettes,
  } = useAccounting()

  const ca         = getChiffreAffaires()
  const charges    = getTotalCharges()
  const produits   = getTotalProduits()
  const resultat   = getResultatNet()
  const actifTotal = getActifTotal()
  const tresorerie = getTresorerie()
  const cpropres   = getCapitauxPropres()
  const currency   = state.company.currency

  // ─── Chart data: last 6 months of entries ────────────────────────────────
  const monthlyData = (() => {
    const now = new Date()
    const months: { name: string; produits: number; charges: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push({ name: d.toLocaleDateString('fr', { month: 'short' }), produits: 0, charges: 0 })
      for (const entry of state.entries) {
        if (!entry.date.startsWith(key)) continue
        for (const line of entry.lines) {
          if (line.accountCode.startsWith('7')) months[months.length - 1].produits += line.credit - line.debit
          if (line.accountCode.startsWith('6')) months[months.length - 1].charges += line.debit - line.credit
        }
      }
    }
    return months.map(m => ({ ...m, produits: Math.max(0, m.produits), charges: Math.max(0, m.charges) }))
  })()

  // ─── Pie: structure actif ─────────────────────────────────────────────────
  const immob  = getImmobilisationsNettes()
  const stocks = getStocks()
  const crea   = getCreancesClients()
  const treso  = Math.max(0, tresorerie)
  const pieData = [
    { name: 'Immobilisations', value: immob },
    { name: 'Stocks', value: stocks },
    { name: 'Créances', value: crea },
    { name: 'Trésorerie', value: treso },
  ].filter(d => d.value > 0)

  // ─── Key ratios ───────────────────────────────────────────────────────────
  const ratios = computeFinancialRatios({
    chiffreAffaires: ca, totalCharges: charges, totalProduits: produits,
    resultatNet: resultat, actifTotal, passifTotal: actifTotal,
    capitauxPropres: cpropres, dettesFinancieres: getDettesFinancieres(),
    actifCirculant: getActifCirculant(), passifCirculant: getPassifCirculant(),
    tresorerie, creancesClients: getCreancesClients(), dettesF: getDettesF(),
    stocks, immobilisationsNettes: immob,
  })

  const keyRatios = ratios.filter(r => ['liquidite_generale', 'autonomie_financiere', 'marge_nette', 'tresorerie_nette'].includes(r.id))

  const statusColor: Record<string, string> = {
    bon:    'text-green-600 bg-green-50 border-green-200',
    moyen:  'text-yellow-600 bg-yellow-50 border-yellow-200',
    mauvais:'text-red-600 bg-red-50 border-red-200',
    neutre: 'text-gray-500 bg-gray-50 border-gray-200',
  }

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Chiffre d'Affaires"
          value={formatMontant(ca, currency)}
          icon={TrendingUp}
          color="text-blue-600"
          trend={ca > 0 ? 'up' : 'neutral'}
        />
        <KpiCard
          label="Résultat Net"
          value={formatMontant(resultat, currency)}
          icon={resultat >= 0 ? TrendingUp : TrendingDown}
          color={resultat >= 0 ? 'text-green-600' : 'text-red-600'}
          trend={resultat >= 0 ? 'up' : 'down'}
        />
        <KpiCard
          label="Total Actif"
          value={formatMontant(actifTotal, currency)}
          icon={Scale}
          color="text-purple-600"
        />
        <KpiCard
          label="Trésorerie"
          value={formatMontant(tresorerie, currency)}
          icon={Banknote}
          color={tresorerie >= 0 ? 'text-emerald-600' : 'text-red-600'}
          trend={tresorerie >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Évolution Produits / Charges (6 mois)</h3>
          {monthlyData.some(d => d.produits > 0 || d.charges > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A3A6B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1A3A6B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCharg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C62828" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C62828" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v} />
                <Tooltip formatter={(v: number) => formatMontant(v, currency)} />
                <Area type="monotone" dataKey="produits" name="Produits" stroke="#1A3A6B" fill="url(#gProd)" strokeWidth={2} />
                <Area type="monotone" dataKey="charges"  name="Charges"  stroke="#C62828" fill="url(#gCharg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Aucune écriture enregistrée
            </div>
          )}
        </div>

        {/* Pie: structure actif */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Structure de l'Actif</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ fontSize: 10 }}>{v}</span>} />
                <Tooltip formatter={(v: number) => formatMontant(v, currency)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Aucun actif enregistré
            </div>
          )}
        </div>
      </div>

      {/* Key Ratios */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Ratios Clés OHADA</h3>
          <button onClick={() => setView('ratios')} className="text-xs text-blue-600 hover:underline">
            Voir tous →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {keyRatios.map(r => (
            <div key={r.id} className={`rounded-lg p-3 border ${statusColor[r.status]}`}>
              <p className="text-xs font-medium leading-tight">{r.label}</p>
              <p className="text-lg font-bold mt-1">
                {r.value === null ? 'N/D' : r.unit === '%' ? `${r.value.toFixed(1)}%` : r.unit === 'x' ? `${r.value.toFixed(2)}x` : r.unit === 'FCFA' ? formatMontant(r.value, currency) : r.value.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText size={15} /> Dernières Écritures
            </h3>
            <button onClick={() => setView('journal')} className="text-xs text-blue-600 hover:underline">Voir tout →</button>
          </div>
          {state.entries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune écriture</p>
          ) : (
            <div className="space-y-2">
              {state.entries.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                    {e.journal}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{e.libelle}</p>
                    <p className="text-xs text-gray-400">{formatDate(e.date)} · {e.reference}</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 flex-shrink-0">
                    {formatMontant(e.lines.reduce((s, l) => s + l.debit, 0), currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions Rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction label="Nouvelle Écriture"    icon={PlusCircle}  onClick={() => setView('new-entry')}      color="border-blue-200 text-blue-600 hover:bg-blue-50" />
            <QuickAction label="Ajouter Document"     icon={Paperclip}   onClick={() => setView('evidences')}      color="border-orange-200 text-orange-600 hover:bg-orange-50" />
            <QuickAction label="Voir Bilan"           icon={Scale}       onClick={() => setView('bilan')}          color="border-green-200 text-green-600 hover:bg-green-50" />
            <QuickAction label="Analyser Ratios"      icon={BarChart3}   onClick={() => setView('ratios')}         color="border-purple-200 text-purple-600 hover:bg-purple-50" />
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-700">📊 SYSCOHADA Révisé 2017</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {state.entries.length} écriture(s) · {state.evidences.length} pièce(s) justificative(s)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
