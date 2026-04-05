import { useState } from 'react'
import { Save, CheckCircle, Building2, Calendar } from 'lucide-react'
import { useAccounting } from '../../context/AccountingContext'
import { v4 as uuidv4 } from 'uuid'
import type { Company } from '../../types'

const CURRENCIES = [
  { value: 'XOF', label: 'XOF – Franc CFA (UEMOA)' },
  { value: 'XAF', label: 'XAF – Franc CFA (CEMAC)' },
  { value: 'GNF', label: 'GNF – Franc Guinéen' },
  { value: 'MGA', label: 'MGA – Ariary Malgache' },
  { value: 'EUR', label: 'EUR – Euro' },
]

export default function Parametres() {
  const { state, updateCompany, dispatch } = useAccounting()
  const [company, setCompany] = useState<Company>({ ...state.company })
  const [saved, setSaved] = useState(false)
  const [newFyYear, setNewFyYear] = useState('')

  const handleSave = () => {
    updateCompany(company)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addFiscalYear = () => {
    if (!newFyYear || state.fiscalYears.some(fy => fy.label === newFyYear)) return
    dispatch({
      type: 'ADD_FISCAL_YEAR',
      payload: {
        id: uuidv4(),
        label: newFyYear,
        startDate: `${newFyYear}-01-01`,
        endDate: `${newFyYear}-12-31`,
        isActive: true,
        isClosed: false,
      },
    })
    setNewFyYear('')
  }

  const setActiveFY = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_FISCAL_YEAR', payload: id })
  }

  const exportData = () => {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ohada-dashboard-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        dispatch({ type: 'LOAD_STATE', payload: { ...data, activeView: 'dashboard' } })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch {
        alert('Fichier invalide')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle size={18} />
          <span className="font-medium">Paramètres enregistrés avec succès</span>
        </div>
      )}

      {/* Company */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Building2 size={15} className="text-blue-600" /> Informations de l'Entreprise
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            ['name',     'Raison Sociale *',               'text', 'Mon Entreprise SARL'],
            ['rccm',     'N° RCCM',                        'text', 'RCCM-SN-DKR-2024-XXX'],
            ['ninea',    'NINEA / NIF',                    'text', '0000000000000'],
            ['address',  'Adresse',                        'text', 'Dakar, Sénégal'],
            ['phone',    'Téléphone',                      'tel',  '+221 77 000 00 00'],
            ['email',    'Email',                          'email','contact@entreprise.com'],
          ] as [keyof Company, string, string, string][]).map(([field, label, type, placeholder]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type={type}
                value={String(company[field])}
                onChange={e => setCompany(c => ({ ...c, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Capital Social</label>
            <input
              type="number"
              value={company.capital}
              onChange={e => setCompany(c => ({ ...c, capital: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Devise</label>
            <select
              value={company.currency}
              onChange={e => setCompany(c => ({ ...c, currency: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {CURRENCIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 flex items-center gap-2 px-5 py-2 bg-ohada-blue text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
        >
          <Save size={15} /> Enregistrer
        </button>
      </div>

      {/* Fiscal years */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar size={15} className="text-blue-600" /> Exercices Comptables
        </h3>
        <div className="space-y-2 mb-4">
          {state.fiscalYears.map(fy => (
            <div key={fy.id} className={`flex items-center justify-between p-3 rounded-lg border ${
              fy.id === state.activeFiscalYearId ? 'bg-blue-50 border-blue-200' : 'border-gray-100 hover:bg-gray-50'
            }`}>
              <div>
                <p className="text-sm font-semibold text-gray-800">Exercice {fy.label}</p>
                <p className="text-xs text-gray-500">{fy.startDate} → {fy.endDate}</p>
              </div>
              <div className="flex items-center gap-2">
                {fy.id === state.activeFiscalYearId && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Actif</span>
                )}
                {fy.id !== state.activeFiscalYearId && (
                  <button
                    onClick={() => setActiveFY(fy.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Activer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={newFyYear}
            onChange={e => setNewFyYear(e.target.value)}
            placeholder="Ex: 2025"
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={addFiscalYear}
            className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
          >
            + Ajouter
          </button>
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Gestion des Données</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium"
          >
            ↓ Exporter sauvegarde (JSON)
          </button>
          <label className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 text-sm font-medium cursor-pointer">
            ↑ Importer sauvegarde
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Les données sont stockées localement dans le navigateur (localStorage).
          Exportez régulièrement pour éviter toute perte.
        </p>
      </div>
    </div>
  )
}
