import { useState } from 'react'
import { Search } from 'lucide-react'
import { OHADA_ACCOUNTS, CLASS_LABELS } from '../../data/ohada-accounts'

const CLASS_COLORS: Record<string, string> = {
  '1': 'bg-blue-50 border-blue-200 text-blue-800',
  '2': 'bg-indigo-50 border-indigo-200 text-indigo-800',
  '3': 'bg-orange-50 border-orange-200 text-orange-800',
  '4': 'bg-yellow-50 border-yellow-200 text-yellow-800',
  '5': 'bg-emerald-50 border-emerald-200 text-emerald-800',
  '6': 'bg-red-50 border-red-200 text-red-800',
  '7': 'bg-green-50 border-green-200 text-green-800',
  '8': 'bg-purple-50 border-purple-200 text-purple-800',
}

export default function PlanComptable() {
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('all')

  const filtered = OHADA_ACCOUNTS.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.code.includes(q) || a.label.toLowerCase().includes(q)
    const matchClass = filterClass === 'all' || a.class === filterClass
    return matchSearch && matchClass
  })

  const grouped: Record<string, typeof OHADA_ACCOUNTS> = {}
  for (const acc of filtered) {
    if (!grouped[acc.class]) grouped[acc.class] = []
    grouped[acc.class].push(acc)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un compte..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">Toutes les classes</option>
          {Object.entries(CLASS_LABELS).map(([cls, lbl]) => (
            <option key={cls} value={cls}>Classe {cls} – {lbl}</option>
          ))}
        </select>
      </div>

      {/* Classes */}
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cls, accounts]) => (
        <div key={cls} className={`rounded-xl border overflow-hidden shadow-sm ${CLASS_COLORS[cls] || 'bg-gray-50 border-gray-200'}`}>
          <div className={`px-5 py-3 border-b ${CLASS_COLORS[cls]}`}>
            <h3 className="font-bold text-sm">
              Classe {cls} – {CLASS_LABELS[cls]} ({accounts.length} comptes)
            </h3>
          </div>
          <div className="bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Code</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Intitulé</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Nature</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.code} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono font-bold text-sm text-blue-700">{acc.code}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{acc.label}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        acc.type === 'actif' ? 'bg-blue-100 text-blue-700' :
                        acc.type === 'passif' ? 'bg-green-100 text-green-700' :
                        acc.type === 'charge' ? 'bg-red-100 text-red-700' :
                        acc.type === 'produit' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">{acc.nature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
