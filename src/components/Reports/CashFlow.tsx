import { Download, ArrowLeftRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAccounting } from '../../context/AccountingContext'
import { formatMontant } from '../../utils/format'

interface CashRow {
  ref: string
  label: string
  montant: number
  isSection?: boolean
  isTotal?: boolean
}

function CashTable({ title, rows, totalLabel, total, color }: {
  title: string
  rows: CashRow[]
  totalLabel: string
  total: number
  color: string
}) {
  const { state } = useAccounting()
  const currency = state.company.currency
  return (
    <div className={`rounded-xl overflow-hidden shadow-sm border ${color}`}>
      <div className="px-5 py-3 bg-current flex justify-between items-center">
        <h3 className="font-bold text-sm text-white">{title}</h3>
        <span className={`font-bold text-sm ${total >= 0 ? 'text-green-200' : 'text-red-200'}`}>
          {formatMontant(total, currency)}
        </span>
      </div>
      <table className="w-full bg-white">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase w-12">Réf.</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Libellé</th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase w-36">Montant (N)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-gray-50 ${row.isTotal ? 'bg-gray-100 font-bold' : i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
              <td className="px-4 py-2 font-mono text-xs text-blue-600 font-semibold">{row.ref}</td>
              <td className={`px-4 py-2 text-sm ${row.isTotal ? 'font-bold' : 'text-gray-700'}`}>{row.label}</td>
              <td className={`px-4 py-2 text-sm text-right font-medium ${row.montant < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                {row.montant !== 0 ? formatMontant(row.montant, currency) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td colSpan={2} className="px-4 py-2.5 text-sm font-bold text-gray-700">{totalLabel}</td>
            <td className={`px-4 py-2.5 text-right font-bold text-sm ${total >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {formatMontant(total, currency)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function CashFlow() {
  const {
    state, activeFiscalYear,
    getResultatNet, getChiffreAffaires, getTresorerie,
    getImmobilisationsNettes, getCapitauxPropres, getDettesFinancieres,
  } = useAccounting()
  const currency = state.company.currency

  const resultat   = getResultatNet()
  const tresorerie = getTresorerie()
  const immob      = getImmobilisationsNettes()
  const cp         = getCapitauxPropres()
  const dfin       = getDettesFinancieres()

  // Dotations aux amortissements (approx depuis les comptes 68x)
  const dotations = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('68')).reduce((a, l) => a + l.debit - l.credit, 0), 0)

  // Variation BFR (approx)
  const varClients = -state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('411')).reduce((a, l) => a + (l.debit - l.credit), 0), 0)
  const varFourn = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('401')).reduce((a, l) => a + (l.credit - l.debit), 0), 0)
  const varStocks = -state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('3')).reduce((a, l) => a + (l.debit - l.credit), 0), 0)

  const fluxExploitation = resultat + dotations + varClients + varFourn + varStocks

  // Investissement : achats/cessions d'immo
  const acquisImmo = -state.entries.reduce((s, e) =>
    s + e.lines.filter(l =>
      l.accountCode.startsWith('2') &&
      !l.accountCode.startsWith('28') &&
      !l.accountCode.startsWith('29')
    ).reduce((a, l) => a + (l.debit - l.credit), 0), 0)
  const cessionImmo = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('821')).reduce((a, l) => a + (l.credit - l.debit), 0), 0)
  const fluxInvestissement = acquisImmo + cessionImmo

  // Financement
  const augCapital = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('10')).reduce((a, l) => a + (l.credit - l.debit), 0), 0)
  const nouvellesDettesFin = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('16')).reduce((a, l) => a + (l.credit - l.debit), 0), 0)
  const remboursements = -state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('16')).reduce((a, l) => a + (l.debit - l.credit), 0), 0)
  const fluxFinancement = augCapital + nouvellesDettesFin + remboursements

  const variationTresorerie = fluxExploitation + fluxInvestissement + fluxFinancement

  // Rows
  const exploitRows: CashRow[] = [
    { ref: 'ZA', label: 'Résultat net de l\'exercice', montant: resultat },
    { ref: 'ZB', label: 'Dotations aux amortissements et provisions', montant: dotations },
    { ref: 'ZC', label: 'Variation des créances clients', montant: varClients },
    { ref: 'ZD', label: 'Variation des dettes fournisseurs', montant: varFourn },
    { ref: 'ZE', label: 'Variation des stocks', montant: varStocks },
  ]

  const investRows: CashRow[] = [
    { ref: 'ZF', label: 'Acquisitions d\'immobilisations', montant: acquisImmo },
    { ref: 'ZG', label: 'Produits de cessions d\'immobilisations', montant: cessionImmo },
  ]

  const finRows: CashRow[] = [
    { ref: 'ZH', label: 'Augmentation de capital', montant: augCapital },
    { ref: 'ZI', label: 'Nouveaux emprunts', montant: nouvellesDettesFin },
    { ref: 'ZJ', label: 'Remboursements d\'emprunts', montant: remboursements },
  ]

  // Chart data
  const chartData = [
    { name: 'Exploitation', montant: fluxExploitation },
    { name: 'Investissement', montant: fluxInvestissement },
    { name: 'Financement', montant: fluxFinancement },
    { name: 'Variation Tréso', montant: variationTresorerie },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-ohada-blue rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeftRight size={24} />
            <div>
              <h2 className="text-lg font-bold">TABLEAU DES FLUX DE TRÉSORERIE {activeFiscalYear?.label}</h2>
              <p className="text-blue-200 text-sm">{state.company.name} · SYSCOHADA Révisé – Méthode Indirecte</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">
            <Download size={14} /> Exporter PDF
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Flux Exploitation', value: fluxExploitation },
            { label: 'Flux Investissement', value: fluxInvestissement },
            { label: 'Flux Financement', value: fluxFinancement },
            { label: 'Variation Trésorerie', value: variationTresorerie },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-blue-200 text-xs uppercase tracking-wide">{s.label}</p>
              <p className={`text-lg font-bold ${s.value >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatMontant(s.value, currency)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trésorerie reconciliation */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Réconciliation de Trésorerie</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="px-4 py-2 bg-gray-100 rounded-lg">
            <span className="text-gray-500">Trésorerie N-1 :</span>
            <span className="font-bold ml-2">{formatMontant(tresorerie - variationTresorerie, currency)}</span>
          </div>
          <span className="text-gray-400 font-bold">+</span>
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-blue-600">Variation :</span>
            <span className={`font-bold ml-2 ${variationTresorerie >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {formatMontant(variationTresorerie, currency)}
            </span>
          </div>
          <span className="text-gray-400 font-bold">=</span>
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-700">Trésorerie N :</span>
            <span className="font-bold text-green-800 ml-2">{formatMontant(tresorerie, currency)}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Visualisation des Flux</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : String(v)} />
            <Tooltip formatter={(v: number) => formatMontant(v, currency)} />
            <Bar dataKey="montant" name="Flux" radius={[4,4,0,0]}
              fill="#1A3A6B"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tables */}
      <div className="space-y-4">
        <CashTable
          title="I. FLUX DE TRÉSORERIE LIÉS AUX ACTIVITÉS D'EXPLOITATION"
          rows={exploitRows}
          totalLabel="Flux Net d'Exploitation (A)"
          total={fluxExploitation}
          color="border-blue-200 bg-blue-700"
        />
        <CashTable
          title="II. FLUX DE TRÉSORERIE LIÉS AUX ACTIVITÉS D'INVESTISSEMENT"
          rows={investRows}
          totalLabel="Flux Net d'Investissement (B)"
          total={fluxInvestissement}
          color="border-orange-200 bg-orange-700"
        />
        <CashTable
          title="III. FLUX DE TRÉSORERIE LIÉS AUX ACTIVITÉS DE FINANCEMENT"
          rows={finRows}
          totalLabel="Flux Net de Financement (C)"
          total={fluxFinancement}
          color="border-green-200 bg-green-700"
        />
        <div className="bg-ohada-blue text-white rounded-xl px-5 py-4 flex justify-between items-center">
          <div>
            <p className="font-bold">VARIATION DE TRÉSORERIE NETTE (A+B+C)</p>
            <p className="text-blue-200 text-xs mt-0.5">= Flux Exploitation + Investissement + Financement</p>
          </div>
          <p className={`text-2xl font-bold ${variationTresorerie >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {formatMontant(variationTresorerie, currency)}
          </p>
        </div>
      </div>
    </div>
  )
}
