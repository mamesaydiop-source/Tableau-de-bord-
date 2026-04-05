import { useState } from 'react'
import { Search, Download, Trash2, ChevronDown, ChevronUp, FileText, Plus } from 'lucide-react'
import { useAccounting } from '../../context/AccountingContext'
import { formatMontant, formatDate } from '../../utils/format'
import { exportJournalPDF } from '../../utils/pdf-export'
import type { JournalEntry, JournalType } from '../../types'

const JOURNAL_COLORS: Record<JournalType, string> = {
  AC: 'bg-orange-100 text-orange-700',
  VT: 'bg-green-100 text-green-700',
  BQ: 'bg-blue-100 text-blue-700',
  CA: 'bg-emerald-100 text-emerald-700',
  OD: 'bg-purple-100 text-purple-700',
  AN: 'bg-gray-100 text-gray-700',
}

function EntryRow({ entry, onDelete }: { entry: JournalEntry; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const { state } = useAccounting()
  const currency = state.company.currency
  const total = entry.lines.reduce((s, l) => s + l.debit, 0)

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
        onClick={() => setExpanded(v => !v)}
      >
        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{formatDate(entry.date)}</td>
        <td className="px-4 py-3 text-sm font-mono text-gray-500">{entry.reference}</td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${JOURNAL_COLORS[entry.journal]}`}>
            {entry.journal}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-800">{entry.libelle}</td>
        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
          {formatMontant(total, currency)}
        </td>
        <td className="px-4 py-3 text-center text-xs text-gray-400">{entry.lines.length}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            {entry.evidences.length > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                📎 {entry.evidences.length}
              </span>
            )}
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
            {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
          </div>
        </td>
      </tr>

      {/* Expanded lines */}
      {expanded && (
        <tr>
          <td colSpan={7} className="bg-blue-50 border-b border-blue-100">
            <div className="px-6 py-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 uppercase tracking-wide">
                    <th className="text-left pb-1">Compte</th>
                    <th className="text-left pb-1">Libellé</th>
                    <th className="text-right pb-1">Débit</th>
                    <th className="text-right pb-1">Crédit</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.lines.map(line => (
                    <tr key={line.id} className="border-t border-blue-100">
                      <td className="py-1 font-mono font-semibold text-blue-700">{line.accountCode}</td>
                      <td className="py-1 text-gray-700">{line.accountLabel}</td>
                      <td className="py-1 text-right font-medium text-gray-800">
                        {line.debit > 0 ? formatMontant(line.debit, currency) : '—'}
                      </td>
                      <td className="py-1 text-right font-medium text-gray-800">
                        {line.credit > 0 ? formatMontant(line.credit, currency) : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-blue-200 font-bold">
                    <td colSpan={2} className="py-1 text-right text-gray-600">Totaux</td>
                    <td className="py-1 text-right text-green-700">
                      {formatMontant(entry.lines.reduce((s, l) => s + l.debit, 0), currency)}
                    </td>
                    <td className="py-1 text-right text-green-700">
                      {formatMontant(entry.lines.reduce((s, l) => s + l.credit, 0), currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function Journal() {
  const { state, deleteEntry, setView } = useAccounting()
  const [search, setSearch] = useState('')
  const [filterJournal, setFilterJournal] = useState<string>('all')

  const filtered = state.entries.filter(e => {
    const matchSearch = !search || e.libelle.toLowerCase().includes(search.toLowerCase()) || e.reference.toLowerCase().includes(search.toLowerCase())
    const matchJournal = filterJournal === 'all' || e.journal === filterJournal
    return matchSearch && matchJournal
  })

  const totalDebit  = filtered.reduce((s, e) => s + e.lines.reduce((a, l) => a + l.debit, 0), 0)
  const totalCredit = filtered.reduce((s, e) => s + e.lines.reduce((a, l) => a + l.credit, 0), 0)
  const currency = state.company.currency

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par libellé ou référence..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={filterJournal}
          onChange={e => setFilterJournal(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">Tous les journaux</option>
          <option value="AC">AC – Achats</option>
          <option value="VT">VT – Ventes</option>
          <option value="BQ">BQ – Banque</option>
          <option value="CA">CA – Caisse</option>
          <option value="OD">OD – Opér. Diverses</option>
          <option value="AN">AN – À Nouveau</option>
        </select>
        <button
          onClick={() => exportJournalPDF(filtered, state.company)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          <Download size={14} /> PDF
        </button>
        <button
          onClick={() => setView('new-entry')}
          className="flex items-center gap-2 px-4 py-2 bg-ohada-blue text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
        >
          <Plus size={14} /> Nouvelle Écriture
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Écritures', value: filtered.length.toString(), color: 'text-blue-700' },
          { label: 'Total Débit', value: formatMontant(totalDebit, currency), color: 'text-gray-800' },
          { label: 'Total Crédit', value: formatMontant(totalCredit, currency), color: 'text-gray-800' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText size={40} className="mb-3 opacity-40" />
            <p className="font-medium">Aucune écriture trouvée</p>
            <button onClick={() => setView('new-entry')} className="mt-4 text-sm text-blue-600 hover:underline">
              Créer la première écriture →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Date', 'Référence', 'Journal', 'Libellé', 'Montant', 'Lignes', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    onDelete={() => deleteEntry(entry.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
