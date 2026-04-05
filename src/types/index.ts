// ─── OHADA Account types ────────────────────────────────────────────────────

export type AccountClass =
  | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'

export interface OhadaAccount {
  code: string        // e.g. "101"
  label: string       // e.g. "Capital social"
  class: AccountClass
  type: 'actif' | 'passif' | 'charge' | 'produit' | 'bilan'
  nature: 'debiteur' | 'crediteur'
  isActive: boolean
}

// ─── Journal / Écritures ────────────────────────────────────────────────────

export interface JournalLine {
  id: string
  accountCode: string
  accountLabel: string
  debit: number
  credit: number
}

export interface JournalEntry {
  id: string
  date: string           // ISO date string
  reference: string      // Numéro de pièce
  libelle: string        // Description
  journal: JournalType
  lines: JournalLine[]
  evidences: Evidence[]
  createdAt: string
  updatedAt: string
}

export type JournalType =
  | 'AC'  // Achats
  | 'VT'  // Ventes
  | 'BQ'  // Banque
  | 'CA'  // Caisse
  | 'OD'  // Opérations Diverses
  | 'AN'  // À Nouveau

// ─── Evidence (pièces justificatives) ───────────────────────────────────────

export type EvidenceType = 'photo' | 'scan' | 'facture' | 'recu' | 'contrat' | 'autre'

export interface Evidence {
  id: string
  name: string
  type: EvidenceType
  mimeType: string
  dataUrl: string        // base64 encoded
  size: number           // bytes
  uploadedAt: string
  description: string
  entryId?: string       // linked journal entry
}

// ─── Exercice comptable ──────────────────────────────────────────────────────

export interface FiscalYear {
  id: string
  label: string          // e.g. "2024"
  startDate: string
  endDate: string
  isActive: boolean
  isClosed: boolean
}

// ─── Entreprise ─────────────────────────────────────────────────────────────

export interface Company {
  name: string
  rccm: string           // Registre du Commerce
  ninea: string          // NIF / NINEA
  address: string
  phone: string
  email: string
  capital: number
  currency: string       // 'XOF' | 'XAF' | 'EUR' etc.
}

// ─── Financial Statements ────────────────────────────────────────────────────

export interface BilanRow {
  code: string
  label: string
  brut: number
  amortissement: number
  net: number
  netN1: number
  section: 'actif_immobilise' | 'actif_circulant' | 'tresorerie_actif'
          | 'capitaux_propres' | 'dettes_financieres' | 'passif_circulant' | 'tresorerie_passif'
}

export interface CompteResultatRow {
  code: string
  label: string
  montantN: number
  montantN1: number
  section:
    | 'produits_ao' | 'charges_ao'
    | 'produits_hao' | 'charges_hao'
    | 'participation' | 'impots'
}

export interface CashFlowRow {
  label: string
  montant: number
  section: 'exploitation' | 'investissement' | 'financement'
}

// ─── Financial Ratios ────────────────────────────────────────────────────────

export interface FinancialRatio {
  id: string
  category: RatioCategory
  label: string
  formula: string
  value: number | null
  unit: string            // '%', 'x', 'jours', 'FCFA'
  benchmark: { min: number; max: number } | null
  status: 'bon' | 'moyen' | 'mauvais' | 'neutre'
  description: string
}

export type RatioCategory =
  | 'rentabilite'
  | 'liquidite'
  | 'solvabilite'
  | 'activite'
  | 'equilibre'

// ─── App State ───────────────────────────────────────────────────────────────

export type ActiveView =
  | 'dashboard'
  | 'journal'
  | 'new-entry'
  | 'evidences'
  | 'bilan'
  | 'compte-resultat'
  | 'cash-flow'
  | 'ratios'
  | 'plan-comptable'
  | 'parametres'

export interface AppState {
  company: Company
  fiscalYears: FiscalYear[]
  activeFiscalYearId: string
  entries: JournalEntry[]
  evidences: Evidence[]
  activeView: ActiveView
}
