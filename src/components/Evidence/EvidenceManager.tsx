import { useState, useRef, useCallback } from 'react'
import {
  Upload, Camera, FileText, Trash2, Eye, Download,
  Image, File, Search, Filter,
} from 'lucide-react'
import { useAccounting } from '../../context/AccountingContext'
import { formatDate } from '../../utils/format'
import type { Evidence, EvidenceType } from '../../types'

const TYPE_LABELS: Record<EvidenceType, string> = {
  photo:    'Photo',
  scan:     'Scan',
  facture:  'Facture',
  recu:     'Reçu',
  contrat:  'Contrat',
  autre:    'Autre',
}

const TYPE_COLORS: Record<EvidenceType, string> = {
  photo:   'bg-blue-100 text-blue-700',
  scan:    'bg-indigo-100 text-indigo-700',
  facture: 'bg-green-100 text-green-700',
  recu:    'bg-emerald-100 text-emerald-700',
  contrat: 'bg-purple-100 text-purple-700',
  autre:   'bg-gray-100 text-gray-600',
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

function EvidenceCard({ evidence, onDelete }: { evidence: Evidence; onDelete: () => void }) {
  const [preview, setPreview] = useState(false)
  const isImage = evidence.mimeType.startsWith('image/')

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = evidence.dataUrl
    a.download = evidence.name
    a.click()
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
        {/* Thumbnail */}
        <div className="relative h-36 bg-gray-50 flex items-center justify-center overflow-hidden">
          {isImage ? (
            <img
              src={evidence.dataUrl}
              alt={evidence.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <File size={40} />
              <span className="text-xs font-medium text-gray-400 uppercase">
                {evidence.name.split('.').pop()}
              </span>
            </div>
          )}

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {isImage && (
              <button
                onClick={() => setPreview(true)}
                className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                title="Prévisualiser"
              >
                <Eye size={16} className="text-gray-700" />
              </button>
            )}
            <button
              onClick={handleDownload}
              className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
              title="Télécharger"
            >
              <Download size={16} className="text-gray-700" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-800 truncate">{evidence.name}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{evidence.description || '—'}</p>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[evidence.type]}`}>
              {TYPE_LABELS[evidence.type]}
            </span>
            <span className="text-xs text-gray-400">{formatSize(evidence.size)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatDate(evidence.uploadedAt)}</p>
        </div>
      </div>

      {/* Preview modal */}
      {preview && isImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(false)}
        >
          <div className="max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img src={evidence.dataUrl} alt={evidence.name} className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" />
            <p className="text-white text-center text-sm mt-3">{evidence.name}</p>
          </div>
        </div>
      )}
    </>
  )
}

export default function EvidenceManager() {
  const { state, addEvidence, deleteEvidence } = useAccounting()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<EvidenceType | 'all'>('all')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form for new upload
  const [description, setDescription] = useState('')
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('autre')

  const processFiles = useCallback(
    async (files: FileList) => {
      setUploading(true)
      for (const file of Array.from(files)) {
        await new Promise<void>(resolve => {
          const reader = new FileReader()
          reader.onload = e => {
            addEvidence({
              name: file.name,
              type: evidenceType,
              mimeType: file.type,
              dataUrl: e.target?.result as string,
              size: file.size,
              description,
            })
            resolve()
          }
          reader.readAsDataURL(file)
        })
      }
      setUploading(false)
      setDescription('')
    },
    [addEvidence, description, evidenceType]
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files)
  }

  const filtered = state.evidences.filter(ev => {
    const q = search.toLowerCase()
    const matchSearch = !q || ev.name.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q)
    const matchType = filterType === 'all' || ev.type === filterType
    return matchSearch && matchType
  })

  const stats = {
    total: state.evidences.length,
    photos: state.evidences.filter(e => e.mimeType.startsWith('image/')).length,
    size: state.evidences.reduce((s, e) => s + e.size, 0),
  }

  return (
    <div className="space-y-5">

      {/* Upload zone */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Upload size={15} className="text-blue-600" /> Ajouter des Pièces Justificatives
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type de Document</label>
            <select
              value={evidenceType}
              onChange={e => setEvidenceType(e.target.value as EvidenceType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Facture fournisseur ACME du 15/01/2024"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Image size={24} className="text-blue-600" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <FileText size={24} className="text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Glissez vos fichiers ici ou cliquez pour choisir
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Images (JPG, PNG), PDF, scans – Taille max 10 Mo par fichier
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-ohada-blue text-white rounded-lg hover:bg-blue-800 text-sm font-medium disabled:opacity-50"
              >
                <Upload size={14} />
                {uploading ? 'Chargement...' : 'Parcourir'}
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
              >
                <Camera size={14} /> Caméra
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={e => e.target.files && processFiles(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={e => e.target.files && processFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Documents', value: stats.total, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Photos / Scans', value: stats.photos, icon: Image, color: 'text-green-600 bg-green-50' },
          { label: 'Taille Totale', value: formatSize(stats.size), icon: File, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-lg font-bold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une pièce..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as EvidenceType | 'all')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
          <Image size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune pièce justificative</p>
          <p className="text-sm mt-1">Glissez vos fichiers ci-dessus pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(ev => (
            <EvidenceCard
              key={ev.id}
              evidence={ev}
              onDelete={() => deleteEvidence(ev.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
