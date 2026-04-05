import { useState, useCallback } from 'react'
import { PlusCircle, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useAccounting } from '../../context/AccountingContext'
import { OHADA_ACCOUNTS, searchAccounts } from '../../data/ohada-accounts'
import { today, shortRef } from '../../utils/format'
import type { JournalLine, JournalType } from '../../types'

const JOURNAL_TYPES: { value: JournalType; label: string }[] = [
  { value: 'AC', label: 'AC – Achats' },
  { value: 'VT', label: 'VT – Ventes' },
  { value: 'BQ', label: 'BQ – Banque' },
  { value: 'CA', label: 'CA – Caisse' },
  { value: 'OD', label: 'OD – Opérations Diverses' },
  { value: 'AN', label: 'AN – À Nouveau' },
]

interface LineError {
  accountCode?: string
  amount?: string
}

function AccountAutocomplete({
  value, onChange,
}: {
  value: string
  onChange: (code: string, label: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const results = query.length >= 2 ? searchAccounts(query).slice(0, 10) : []

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Code ou libellé..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto">
          {results.map(a => (
            <button
              key={a.code}
              type="button"
              onMouseDown={() => { onChange(a.code, a.label); setQuery(`${a.code} – ${a.label}`); setOpen(false) }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-50 last:border-0"
            >
              <span className="font-mono font-semibold text-blue-700">{a.code}</span>
              <span className="text-gray-600 ml-2">{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const emptyLine = (): JournalLine => ({
  id: uuidv4(),
  accountCode: '',
  accountLabel: '',
  debit: 0,
  credit: 0,
})

export default function TransactionForm() {
  const { addEntry, setView } = useAccounting()

  const [date, setDate] = useState(today())
  const [reference, setReference] = useState(shortRef())
  const [journal, setJournal] = useState<JournalType>('OD')
  const [libelle, setLibelle] = useState('')
  const [lines, setLines] = useState<JournalLine[]>([emptyLine(), emptyLine()])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const totalDebit  = lines.reduce((s, l) => s + (Number(l.debit)  || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.01

  const updateLine = useCallback((id: string, patch: Partial<JournalLine>) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  }, [])

  const removeLine = useCallback((id: string) => {
    setLines(prev => prev.filter(l => l.id !== id))
  }, [])

  const addLine = () => setLines(prev => [...prev, emptyLine()])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!date) errs.date = 'Date requise'
    if (!libelle.trim()) errs.libelle = 'Libellé requis'
    lines.forEach((l, i) => {
      if (!l.accountCode) errs[`line_${i}_code`] = 'Compte requis'
      if (l.debit === 0 && l.credit === 0) errs[`line_${i}_amt`] = 'Montant requis'
    })
    if (!isBalanced) errs.balance = 'L\'écriture n\'est pas équilibrée (Débit ≠ Crédit)'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    addEntry({ date, reference, libelle, journal, lines, evidences: [] })
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setView('journal') }, 1500)
  }

  const handleReset = () => {
    setLines([emptyLine(), emptyLine()])
    setLibelle('')
    setReference(shortRef())
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-5">

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle size={18} />
          <span className="font-medium">Écriture enregistrée avec succès !</span>
        </div>
      )}

      {/* Header fields */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <PlusCircle size={16} className="text-blue-600" /> En-tête de l'Écriture
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">N° Pièce *</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Journal *</label>
            <select
              value={journal}
              onChange={e => setJournal(e.target.value as JournalType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {JOURNAL_TYPES.map(j => (
                <option key={j.value} value={j.value}>{j.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Libellé *</label>
            <input
              type="text"
              value={libelle}
              onChange={e => setLibelle(e.target.value)}
              placeholder="Description de l'opération"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.libelle && <p className="text-red-500 text-xs mt-1">{errors.libelle}</p>}
          </div>
        </div>
      </div>

      {/* Lines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Lignes d'Écriture</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isBalanced ? '✓ Équilibrée' : '✗ Déséquilibrée'}
          </span>
        </div>

        <div className="p-5 space-y-3">
          {/* Column headers */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
            <div className="col-span-4">Compte</div>
            <div className="col-span-4">Libellé du Compte</div>
            <div className="col-span-2 text-right">Débit</div>
            <div className="col-span-2 text-right">Crédit</div>
          </div>

          {lines.map((line, i) => {
            const acc = OHADA_ACCOUNTS.find(a => a.code === line.accountCode)
            return (
              <div key={line.id} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-12 md:col-span-4">
                  <AccountAutocomplete
                    value={line.accountCode}
                    onChange={(code, label) => updateLine(line.id, { accountCode: code, accountLabel: label })}
                  />
                  {errors[`line_${i}_code`] && (
                    <p className="text-red-500 text-xs mt-0.5">{errors[`line_${i}_code`]}</p>
                  )}
                </div>
                <div className="col-span-12 md:col-span-4">
                  <input
                    type="text"
                    value={line.accountLabel || acc?.label || ''}
                    onChange={e => updateLine(line.id, { accountLabel: e.target.value })}
                    placeholder="Libellé du compte"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-5 md:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.debit || ''}
                    onChange={e => updateLine(line.id, { debit: parseFloat(e.target.value) || 0, credit: 0 })}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-5 md:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.credit || ''}
                    onChange={e => updateLine(line.id, { credit: parseFloat(e.target.value) || 0, debit: 0 })}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-2 md:col-span-0 flex justify-end md:block">
                  {lines.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Totals */}
          <div className="grid grid-cols-12 gap-3 pt-3 border-t border-gray-100">
            <div className="col-span-8 text-right text-sm font-semibold text-gray-600">TOTAUX</div>
            <div className={`col-span-2 text-right text-sm font-bold ${isBalanced ? 'text-green-700' : 'text-red-600'}`}>
              {totalDebit.toLocaleString('fr-SN')}
            </div>
            <div className={`col-span-2 text-right text-sm font-bold ${isBalanced ? 'text-green-700' : 'text-red-600'}`}>
              {totalCredit.toLocaleString('fr-SN')}
            </div>
          </div>

          {errors.balance && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle size={14} />
              {errors.balance}
            </div>
          )}
        </div>

        {/* Add line */}
        <div className="px-5 pb-4">
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <PlusCircle size={16} /> Ajouter une ligne
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Réinitialiser
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setView('journal')}
            className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-ohada-blue text-white rounded-lg hover:bg-blue-800 font-medium text-sm shadow-sm"
          >
            <Save size={16} /> Enregistrer l'Écriture
          </button>
        </div>
      </div>
    </form>
  )
}
