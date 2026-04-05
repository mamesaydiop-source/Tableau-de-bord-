import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import { useAccounting } from '../../context/AccountingContext'
import { formatMontant } from '../../utils/format'

interface CRRow {
  ref: string
  label: string
  montant: number
  isSubtotal?: boolean
  isTotal?: boolean
  isResult?: boolean
}

function CRSection({
  title, rows, color,
}: {
  title: string
  rows: CRRow[]
  color: string
}) {
  const { state } = useAccounting()
  const currency = state.company.currency

  return (
    <div className={`rounded-xl overflow-hidden shadow-sm border ${color}`}>
      <div className="px-4 py-3 bg-current">
        <h3 className="font-bold text-sm text-white">{title}</h3>
      </div>
      <table className="w-full bg-white">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase w-12">Réf.</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Libellé</th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Exercice N</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-gray-50 ${
                row.isTotal ? 'bg-gray-100 font-bold' :
                row.isSubtotal ? 'bg-gray-50 font-semibold' :
                row.isResult ? 'bg-ohada-gold/10 font-bold' :
                i % 2 === 0 ? '' : 'bg-gray-50/40'
              }`}
            >
              <td className="px-4 py-2.5 font-mono text-xs text-blue-600 font-semibold">{row.ref}</td>
              <td className={`px-4 py-2.5 text-sm ${row.isTotal || row.isResult ? 'font-bold' : 'text-gray-700'}`}>
                {row.label}
              </td>
              <td className={`px-4 py-2.5 text-sm text-right font-medium ${
                row.montant < 0 ? 'text-red-600' :
                row.isResult ? row.montant >= 0 ? 'text-green-700' : 'text-red-700' :
                'text-gray-800'
              }`}>
                {formatMontant(row.montant, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CompteResultat() {
  const {
    state, activeFiscalYear,
    getChiffreAffaires, getTotalCharges, getTotalProduits, getResultatNet,
  } = useAccounting()
  const currency = state.company.currency

  const ca      = getChiffreAffaires()
  const charges = getTotalCharges()
  const produits = getTotalProduits()
  const resultat = getResultatNet()

  // Breakdown of charges (approximation from entries)
  const chargesPerso = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('66')).reduce((a, l) => a + l.debit - l.credit, 0), 0)
  const chargesFinancieres = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('67')).reduce((a, l) => a + l.debit - l.credit, 0), 0)
  const dotations = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('68')).reduce((a, l) => a + l.debit - l.credit, 0), 0)
  const autresCharges = Math.max(0, charges - chargesPerso - chargesFinancieres - dotations)

  // Breakdown of produits
  const prodFinanciers = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('77')).reduce((a, l) => a + l.credit - l.debit, 0), 0)
  const autresProduits = Math.max(0, produits - ca - prodFinanciers)

  // HAO
  const chargesHAO = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('8') && ['81','83','87'].some(p => l.accountCode.startsWith(p))).reduce((a, l) => a + l.debit - l.credit, 0), 0)
  const produitsHAO = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => ['82','84','88'].some(p => l.accountCode.startsWith(p))).reduce((a, l) => a + l.credit - l.debit, 0), 0)
  const impots = state.entries.reduce((s, e) =>
    s + e.lines.filter(l => l.accountCode.startsWith('881')).reduce((a, l) => a + l.debit - l.credit, 0), 0)

  const resultatAO = (ca + autresProduits) - (autresCharges + chargesPerso + dotations)
  const resultatFinancier = prodFinanciers - chargesFinancieres
  const resultatHAO = produitsHAO - chargesHAO

  const prodRows: CRRow[] = [
    { ref: 'TA', label: 'Chiffre d\'Affaires (CA)', montant: ca },
    { ref: 'RA', label: 'Subventions d\'exploitation', montant: 0 },
    { ref: 'TB', label: 'Autres produits d\'exploitation', montant: autresProduits },
    { ref: 'TC', label: 'TOTAL PRODUITS D\'EXPLOITATION', montant: ca + autresProduits, isSubtotal: true },
    { ref: 'TJ', label: 'Revenus financiers', montant: prodFinanciers },
    { ref: 'TK', label: 'TOTAL PRODUITS FINANCIERS', montant: prodFinanciers, isSubtotal: true },
    { ref: 'TL', label: 'Produits HAO', montant: produitsHAO },
    { ref: 'TW', label: 'TOTAL PRODUITS HAO', montant: produitsHAO, isSubtotal: true },
    { ref: 'TX', label: 'TOTAL GÉNÉRAL DES PRODUITS', montant: produits, isTotal: true },
  ]

  const chgRows: CRRow[] = [
    { ref: 'RA', label: 'Achats de marchandises et variations de stocks', montant: autresCharges * 0.4 },
    { ref: 'RB', label: 'Transports', montant: autresCharges * 0.05 },
    { ref: 'RC', label: 'Services extérieurs', montant: autresCharges * 0.15 },
    { ref: 'RD', label: 'Impôts et taxes', montant: autresCharges * 0.1 },
    { ref: 'RE', label: 'Autres charges d\'exploitation', montant: autresCharges * 0.3 },
    { ref: 'RG', label: 'Charges de personnel', montant: chargesPerso },
    { ref: 'RH', label: 'Dotations aux amortissements et provisions', montant: dotations },
    { ref: 'RJ', label: 'TOTAL CHARGES D\'EXPLOITATION', montant: autresCharges + chargesPerso + dotations, isSubtotal: true },
    { ref: 'RM', label: 'RÉSULTAT D\'EXPLOITATION (RE)', montant: resultatAO, isSubtotal: true },
    { ref: 'RN', label: 'Frais financiers et charges assimilées', montant: chargesFinancieres },
    { ref: 'RO', label: 'TOTAL CHARGES FINANCIÈRES', montant: chargesFinancieres, isSubtotal: true },
    { ref: 'RP', label: 'RÉSULTAT FINANCIER', montant: resultatFinancier, isSubtotal: true },
    { ref: 'RS', label: 'RÉSULTAT DES AO', montant: resultatAO + resultatFinancier, isSubtotal: true },
    { ref: 'RU', label: 'Charges HAO', montant: chargesHAO },
    { ref: 'RV', label: 'RÉSULTAT HAO', montant: resultatHAO, isSubtotal: true },
    { ref: 'RW', label: 'Participation des travailleurs', montant: 0 },
    { ref: 'RX', label: 'Impôt sur le résultat', montant: impots },
    { ref: 'RZ', label: 'TOTAL GÉNÉRAL DES CHARGES', montant: charges, isTotal: true },
    { ref: '—', label: 'RÉSULTAT NET DE L\'EXERCICE', montant: resultat, isResult: true },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`rounded-xl p-5 text-white ${resultat >= 0 ? 'bg-green-700' : 'bg-red-700'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {resultat >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            <div>
              <h2 className="text-lg font-bold">COMPTE DE RÉSULTAT {activeFiscalYear?.label}</h2>
              <p className="text-sm opacity-80">{state.company.name} · SYSCOHADA Révisé</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">
            <Download size={14} /> Exporter PDF
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xs opacity-70 uppercase tracking-wide">Total Produits</p>
            <p className="text-xl font-bold">{formatMontant(produits, currency)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xs opacity-70 uppercase tracking-wide">Total Charges</p>
            <p className="text-xl font-bold">{formatMontant(charges, currency)}</p>
          </div>
          <div className="bg-white/30 rounded-lg p-3 text-center border-2 border-white/30">
            <p className="text-xs opacity-70 uppercase tracking-wide">Résultat Net</p>
            <p className="text-2xl font-bold">{formatMontant(resultat, currency)}</p>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest px-1">PRODUITS</h3>
          <CRSection title="Produits des Activités Ordinaires & HAO" rows={prodRows} color="border-green-200 bg-green-700" />
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest px-1">CHARGES & RÉSULTAT</h3>
          <CRSection title="Charges et Résultat de l'Exercice" rows={chgRows} color="border-red-200 bg-red-700" />
        </div>
      </div>

      {/* Soldes intermédiaires de gestion */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Soldes Intermédiaires de Gestion (SIG)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Chiffre d\'Affaires', value: ca, color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'Résultat d\'Exploitation', value: resultatAO, color: resultatAO >= 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700' },
            { label: 'Résultat Financier', value: resultatFinancier, color: resultatFinancier >= 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700' },
            { label: 'Résultat Net', value: resultat, color: resultat >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 border ${s.color}`}>
              <p className="text-xs font-medium leading-tight">{s.label}</p>
              <p className="text-lg font-bold mt-2">{formatMontant(s.value, currency)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
