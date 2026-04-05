import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import type {
  AppState,
  ActiveView,
  JournalEntry,
  Evidence,
  FiscalYear,
  Company,
} from '../types'

// ─── Initial State ────────────────────────────────────────────────────────────

const DEFAULT_COMPANY: Company = {
  name: 'Mon Entreprise SARL',
  rccm: 'RCCM-000-000',
  ninea: '0000000000000',
  address: 'Dakar, Sénégal',
  phone: '+221 77 000 00 00',
  email: 'contact@entreprise.com',
  capital: 1000000,
  currency: 'XOF',
}

const DEFAULT_FISCAL_YEAR: FiscalYear = {
  id: uuidv4(),
  label: new Date().getFullYear().toString(),
  startDate: `${new Date().getFullYear()}-01-01`,
  endDate: `${new Date().getFullYear()}-12-31`,
  isActive: true,
  isClosed: false,
}

const INITIAL_STATE: AppState = {
  company: DEFAULT_COMPANY,
  fiscalYears: [DEFAULT_FISCAL_YEAR],
  activeFiscalYearId: DEFAULT_FISCAL_YEAR.id,
  entries: [],
  evidences: [],
  activeView: 'dashboard',
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_VIEW'; payload: ActiveView }
  | { type: 'ADD_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_ENTRY'; payload: JournalEntry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'ADD_EVIDENCE'; payload: Evidence }
  | { type: 'DELETE_EVIDENCE'; payload: string }
  | { type: 'UPDATE_COMPANY'; payload: Company }
  | { type: 'ADD_FISCAL_YEAR'; payload: FiscalYear }
  | { type: 'SET_ACTIVE_FISCAL_YEAR'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState }

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload

    case 'SET_VIEW':
      return { ...state, activeView: action.payload }

    case 'ADD_ENTRY':
      return { ...state, entries: [action.payload, ...state.entries] }

    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      }

    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(e => e.id !== action.payload),
      }

    case 'ADD_EVIDENCE':
      return { ...state, evidences: [action.payload, ...state.evidences] }

    case 'DELETE_EVIDENCE':
      return {
        ...state,
        evidences: state.evidences.filter(e => e.id !== action.payload),
      }

    case 'UPDATE_COMPANY':
      return { ...state, company: action.payload }

    case 'ADD_FISCAL_YEAR':
      return {
        ...state,
        fiscalYears: [...state.fiscalYears, action.payload],
      }

    case 'SET_ACTIVE_FISCAL_YEAR':
      return { ...state, activeFiscalYearId: action.payload }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AccountingContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  // Convenience helpers
  setView: (view: ActiveView) => void
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => JournalEntry
  updateEntry: (entry: JournalEntry) => void
  deleteEntry: (id: string) => void
  addEvidence: (evidence: Omit<Evidence, 'id' | 'uploadedAt'>) => Evidence
  deleteEvidence: (id: string) => void
  updateCompany: (company: Company) => void
  activeFiscalYear: FiscalYear | undefined
  // Derived financial data
  getBalanceForAccount: (code: string) => number
  getTotalDebit: () => number
  getTotalCredit: () => number
  getChiffreAffaires: () => number
  getTotalCharges: () => number
  getTotalProduits: () => number
  getResultatNet: () => number
  getActifTotal: () => number
  getPassifTotal: () => number
  getTresorerie: () => number
  getCreancesClients: () => number
  getDettesF: () => number
  getStocks: () => number
  getImmobilisationsNettes: () => number
  getCapitauxPropres: () => number
  getDettesFinancieres: () => number
  getPassifCirculant: () => number
  getActifCirculant: () => number
}

const AccountingContext = createContext<AccountingContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ohada_dashboard_state'

export function AccountingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as AppState
        dispatch({ type: 'LOAD_STATE', payload: { ...parsed, activeView: 'dashboard' } })
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist to localStorage on state changes (debounced via effect)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const setView = useCallback((view: ActiveView) => {
    dispatch({ type: 'SET_VIEW', payload: view })
  }, [])

  const addEntry = useCallback(
    (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): JournalEntry => {
      const now = new Date().toISOString()
      const full: JournalEntry = { ...entry, id: uuidv4(), createdAt: now, updatedAt: now }
      dispatch({ type: 'ADD_ENTRY', payload: full })
      return full
    },
    []
  )

  const updateEntry = useCallback((entry: JournalEntry) => {
    dispatch({ type: 'UPDATE_ENTRY', payload: { ...entry, updatedAt: new Date().toISOString() } })
  }, [])

  const deleteEntry = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ENTRY', payload: id })
  }, [])

  const addEvidence = useCallback(
    (evidence: Omit<Evidence, 'id' | 'uploadedAt'>): Evidence => {
      const full: Evidence = { ...evidence, id: uuidv4(), uploadedAt: new Date().toISOString() }
      dispatch({ type: 'ADD_EVIDENCE', payload: full })
      return full
    },
    []
  )

  const deleteEvidence = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EVIDENCE', payload: id })
  }, [])

  const updateCompany = useCallback((company: Company) => {
    dispatch({ type: 'UPDATE_COMPANY', payload: company })
  }, [])

  const activeFiscalYear = state.fiscalYears.find(
    fy => fy.id === state.activeFiscalYearId
  )

  // ─── Financial Derivations ─────────────────────────────────────────────

  const getBalanceForAccount = useCallback(
    (code: string): number => {
      let balance = 0
      for (const entry of state.entries) {
        for (const line of entry.lines) {
          if (line.accountCode.startsWith(code)) {
            balance += line.debit - line.credit
          }
        }
      }
      return balance
    },
    [state.entries]
  )

  const getTotalDebit = useCallback(() => {
    return state.entries.reduce(
      (sum, e) => sum + e.lines.reduce((s, l) => s + l.debit, 0),
      0
    )
  }, [state.entries])

  const getTotalCredit = useCallback(() => {
    return state.entries.reduce(
      (sum, e) => sum + e.lines.reduce((s, l) => s + l.credit, 0),
      0
    )
  }, [state.entries])

  // Chiffre d'affaires = solde comptes 70x
  const getChiffreAffaires = useCallback(() => {
    let total = 0
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (line.accountCode.startsWith('70')) {
          total += line.credit - line.debit
        }
      }
    }
    return Math.max(0, total)
  }, [state.entries])

  // Charges = classe 6
  const getTotalCharges = useCallback(() => {
    let total = 0
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (line.accountCode.startsWith('6') || line.accountCode.startsWith('81') || line.accountCode.startsWith('83') || line.accountCode.startsWith('87') || line.accountCode.startsWith('88')) {
          total += line.debit - line.credit
        }
      }
    }
    return Math.max(0, total)
  }, [state.entries])

  // Produits = classe 7
  const getTotalProduits = useCallback(() => {
    let total = 0
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (line.accountCode.startsWith('7') || line.accountCode.startsWith('82') || line.accountCode.startsWith('84')) {
          total += line.credit - line.debit
        }
      }
    }
    return Math.max(0, total)
  }, [state.entries])

  const getResultatNet = useCallback(() => {
    return getTotalProduits() - getTotalCharges()
  }, [getTotalProduits, getTotalCharges])

  const getTresorerie = useCallback(() => {
    let total = 0
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (line.accountCode.startsWith('5')) {
          total += line.debit - line.credit
        }
      }
    }
    return total
  }, [state.entries])

  const getCreancesClients = useCallback(() => {
    let total = 0
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (line.accountCode.startsWith('411') || line.accountCode.startsWith('412') || line.accountCode.startsWith('418')) {
          total += line.debit - line.credit
        }
      }
    }
    return Math.max(0, total)
  }, [state.entries])

  const getDettesF = useCallback(() => {
    let total = 0
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (line.accountCode.startsWith('401') || line.accountCode.startsWith('402') || line.accountCode.startsWith('408')) {
          total += line.credit - line.debit
        }
      }
    }
    return Math.max(0, total)
  }, [state.entries])

  const getStocks = useCallback(() => {
    let total = 0
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (line.accountCode.startsWith('3')) {
          total += line.debit - line.credit
        }
      }
    }
    return Math.max(0, total)
  }, [state.entries])

  const getImmobilisationsNettes = useCallback(() => {
    let brut = 0
    let amort = 0
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (line.accountCode.startsWith('2') && !line.accountCode.startsWith('28') && !line.accountCode.startsWith('29')) {
          brut += line.debit - line.credit
        }
        if (line.accountCode.startsWith('28') || line.accountCode.startsWith('29')) {
          amort += line.credit - line.debit
        }
      }
    }
    return Math.max(0, brut - amort)
  }, [state.entries])

  const getCapitauxPropres = useCallback(() => {
    let total = 0
    const cpCodes = ['101','102','104','105','106','111','112','118','120','130']
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (cpCodes.some(c => line.accountCode.startsWith(c))) {
          total += line.credit - line.debit
        }
        if (line.accountCode.startsWith('129') || line.accountCode.startsWith('139')) {
          total -= line.debit - line.credit
        }
      }
    }
    return total + getResultatNet()
  }, [state.entries, getResultatNet])

  const getDettesFinancieres = useCallback(() => {
    let total = 0
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (line.accountCode.startsWith('16') || line.accountCode.startsWith('18') || line.accountCode.startsWith('19')) {
          total += line.credit - line.debit
        }
      }
    }
    return Math.max(0, total)
  }, [state.entries])

  const getPassifCirculant = useCallback(() => {
    let total = 0
    for (const entry of state.entries) {
      for (const line of entry.lines) {
        if (
          line.accountCode.startsWith('40') ||
          line.accountCode.startsWith('42') ||
          line.accountCode.startsWith('43') ||
          line.accountCode.startsWith('44') ||
          line.accountCode.startsWith('47') && !line.accountCode.startsWith('471') ||
          line.accountCode.startsWith('419')
        ) {
          total += line.credit - line.debit
        }
      }
    }
    return Math.max(0, total)
  }, [state.entries])

  const getActifCirculant = useCallback(() => {
    return getStocks() + getCreancesClients() + getTresorerie()
  }, [getStocks, getCreancesClients, getTresorerie])

  const getActifTotal = useCallback(() => {
    return getImmobilisationsNettes() + getActifCirculant()
  }, [getImmobilisationsNettes, getActifCirculant])

  const getPassifTotal = useCallback(() => {
    return getCapitauxPropres() + getDettesFinancieres() + getPassifCirculant()
  }, [getCapitauxPropres, getDettesFinancieres, getPassifCirculant])

  const value: AccountingContextValue = {
    state,
    dispatch,
    setView,
    addEntry,
    updateEntry,
    deleteEntry,
    addEvidence,
    deleteEvidence,
    updateCompany,
    activeFiscalYear,
    getBalanceForAccount,
    getTotalDebit,
    getTotalCredit,
    getChiffreAffaires,
    getTotalCharges,
    getTotalProduits,
    getResultatNet,
    getActifTotal,
    getPassifTotal,
    getTresorerie,
    getCreancesClients,
    getDettesF,
    getStocks,
    getImmobilisationsNettes,
    getCapitauxPropres,
    getDettesFinancieres,
    getPassifCirculant,
    getActifCirculant,
  }

  return (
    <AccountingContext.Provider value={value}>
      {children}
    </AccountingContext.Provider>
  )
}

export function useAccounting(): AccountingContextValue {
  const ctx = useContext(AccountingContext)
  if (!ctx) throw new Error('useAccounting must be used within AccountingProvider')
  return ctx
}
