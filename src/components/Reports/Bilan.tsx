import { Download, Scale } from 'lucide-react'
import { useAccounting } from '../../context/AccountingContext'
import { formatMontant } from '../../utils/format'
import { exportBilanPDF } from '../../utils/pdf-export'

interface BilanSection {
  title: string
  rows: { code: string; label: string; net: number; section: string }[]
  total: number
  headerColor: string
  textColor: string
}

function BilanTable({ section }: { section: BilanSection }) {
  const { state } = useAccounting()
  const currency = state.company.currency
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
      <div className={`px-5 py-3 flex items-center justify-between ${section.headerColor}`}>
        <h3 className={`font-bold text-sm ${section.textColor}`}>{section.title}</h3>
        <span className={`font-bold text-sm ${section.textColor}`}>
          {formatMontant(section.total, currency)}
        </span>
      </div>
      <table className="w-full bg-white">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase w-20">Réf.</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Libellé</th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Net (N)</th>
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row, i) => (
            <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
              <td className="px-4 py-2.5 font-mono text-xs text-blue-600 font-semibold">{row.code}</td>
              <td className="px-4 py-2.5 text-sm text-gray-700">{row.label}</td>
              <td className="px-4 py-2.5 text-sm text-right font-medium text-gray-800">
                {formatMontant(row.net, currency)}
              </td>
            </tr>
          ))}
          {section.rows.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-400">—</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className={`border-t-2 ${section.headerColor}`}>
            <td colSpan={2} className={`px-4 py-2.5 text-sm font-bold ${section.textColor}`}>
              TOTAL {section.title}
            </td>
            <td className={`px-4 py-2.5 text-right font-bold text-sm ${section.textColor}`}>
              {formatMontant(section.total, currency)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function Bilan() {
  const {
    state, activeFiscalYear,
    getImmobilisationsNettes, getStocks, getCreancesClients, getTresorerie,
    getActifTotal, getCapitauxPropres, getDettesFinancieres,
    getPassifCirculant, getPassifTotal,
  } = useAccounting()
  const currency = state.company.currency

  const immob    = getImmobilisationsNettes()
  const stocks   = getStocks()
  const creances = getCreancesClients()
  const tresorie = Math.max(0, getTresorerie())
  const actifTotal = getActifTotal()

  const cpropres  = getCapitauxPropres()
  const dfin      = getDettesFinancieres()
  const pcirc     = getPassifCirculant()
  const passifTotal = getPassifTotal()

  const actifSections: BilanSection[] = [
    {
      title: 'ACTIF IMMOBILISÉ',
      headerColor: 'bg-blue-700',
      textColor: 'text-white',
      total: immob,
      rows: [
        { code: 'AI', label: 'Immobilisations incorporelles', net: 0, section: 'actif_immobilise' },
        { code: 'AJ', label: 'Immobilisations corporelles', net: immob, section: 'actif_immobilise' },
        { code: 'AQ', label: 'Immobilisations financières', net: 0, section: 'actif_immobilise' },
      ].filter(r => r.net !== 0),
    },
    {
      title: 'ACTIF CIRCULANT',
      headerColor: 'bg-blue-500',
      textColor: 'text-white',
      total: stocks + creances,
      rows: [
        { code: 'BB', label: 'Stocks et encours', net: stocks, section: 'actif_circulant' },
        { code: 'BH', label: 'Créances clients et comptes rattachés', net: creances, section: 'actif_circulant' },
      ].filter(r => r.net !== 0),
    },
    {
      title: 'TRÉSORERIE ACTIF',
      headerColor: 'bg-blue-400',
      textColor: 'text-white',
      total: tresorie,
      rows: [
        { code: 'BT', label: 'Valeurs à encaisser', net: 0, section: 'tresorerie_actif' },
        { code: 'BU', label: 'Banques, chèques postaux, caisse', net: tresorie, section: 'tresorerie_actif' },
      ].filter(r => r.net !== 0),
    },
  ]

  const passifSections: BilanSection[] = [
    {
      title: 'CAPITAUX PROPRES',
      headerColor: 'bg-green-700',
      textColor: 'text-white',
      total: cpropres,
      rows: [
        { code: 'CA', label: 'Capital', net: state.company.capital, section: 'capitaux_propres' },
        { code: 'CD', label: 'Réserves', net: 0, section: 'capitaux_propres' },
        { code: 'CJ', label: 'Résultat net de l\'exercice', net: cpropres - state.company.capital, section: 'capitaux_propres' },
      ].filter(r => r.net !== 0),
    },
    {
      title: 'DETTES FINANCIÈRES',
      headerColor: 'bg-green-500',
      textColor: 'text-white',
      total: dfin,
      rows: [
        { code: 'DA', label: 'Emprunts et dettes financières', net: dfin, section: 'dettes_financieres' },
      ].filter(r => r.net !== 0),
    },
    {
      title: 'PASSIF CIRCULANT',
      headerColor: 'bg-green-400',
      textColor: 'text-white',
      total: pcirc,
      rows: [
        { code: 'DH', label: 'Fournisseurs et comptes rattachés', net: pcirc * 0.7, section: 'passif_circulant' },
        { code: 'DJ', label: 'Dettes fiscales et sociales', net: pcirc * 0.3, section: 'passif_circulant' },
      ].filter(r => r.net !== 0),
    },
  ]

  const allRows = [...actifSections, ...passifSections].flatMap(s =>
    s.rows.map(r => ({ ...r, section: s.title }))
  )

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-ohada-blue rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale size={24} />
            <div>
              <h2 className="text-lg font-bold">BILAN AU {activeFiscalYear ? `31/12/${activeFiscalYear.label}` : '—'}</h2>
              <p className="text-blue-200 text-sm">{state.company.name} · SYSCOHADA Révisé</p>
            </div>
          </div>
          <button
            onClick={() => exportBilanPDF(
              allRows.map(r => ({ label: r.label, net: r.net, section: r.section })),
              state.company,
              activeFiscalYear?.label ?? ''
            )}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={14} /> Exporter PDF
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-blue-200 text-xs uppercase tracking-wide">Total Actif</p>
            <p className="text-2xl font-bold">{formatMontant(actifTotal, currency)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-blue-200 text-xs uppercase tracking-wide">Total Passif</p>
            <p className="text-2xl font-bold">{formatMontant(passifTotal, currency)}</p>
          </div>
        </div>

        {Math.abs(actifTotal - passifTotal) > 1 && actifTotal > 0 && (
          <div className="mt-3 bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2 text-xs text-red-200">
            ⚠ Bilan déséquilibré – Écart : {formatMontant(Math.abs(actifTotal - passifTotal), currency)}. Vérifiez les écritures.
          </div>
        )}
      </div>

      {/* Bilan grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* ACTIF */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest px-1">ACTIF</h3>
          {actifSections.map(s => (
            <BilanTable key={s.title} section={s} />
          ))}
          <div className="bg-blue-900 text-white rounded-xl px-5 py-3 flex justify-between items-center">
            <span className="font-bold text-sm">TOTAL GÉNÉRAL ACTIF</span>
            <span className="font-bold text-lg">{formatMontant(actifTotal, currency)}</span>
          </div>
        </div>

        {/* PASSIF */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest px-1">PASSIF</h3>
          {passifSections.map(s => (
            <BilanTable key={s.title} section={s} />
          ))}
          <div className="bg-green-900 text-white rounded-xl px-5 py-3 flex justify-between items-center">
            <span className="font-bold text-sm">TOTAL GÉNÉRAL PASSIF</span>
            <span className="font-bold text-lg">{formatMontant(passifTotal, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
