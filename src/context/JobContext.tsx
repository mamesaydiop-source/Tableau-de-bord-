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
  JobAppState,
  JobApplication,
  UserProfile,
  ApplicationStatus,
  ApplicationEvent,
} from '../types/jobs'

// ─── Default Profile ──────────────────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  firstName: '',
  lastName: '',
  title: '',
  email: '',
  phone: '',
  address: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  bio: '',
  targetPosition: '',
  targetSalaryMin: 0,
  targetSalaryMax: 0,
  currency: 'XOF',
  skills: [],
  languages: [],
  experiences: [],
  education: [],
  certifications: [],
}

const INITIAL_STATE: JobAppState = {
  applications: [],
  profile: DEFAULT_PROFILE,
  selectedApplicationId: null,
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_APPLICATION'; payload: JobApplication }
  | { type: 'UPDATE_APPLICATION'; payload: JobApplication }
  | { type: 'DELETE_APPLICATION'; payload: string }
  | { type: 'UPDATE_STATUS'; payload: { id: string; status: ApplicationStatus; note?: string } }
  | { type: 'SELECT_APPLICATION'; payload: string | null }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'LOAD_STATE'; payload: JobAppState }

// ─── Reducer ──────────────────────────────────────────────────────────────────

function jobReducer(state: JobAppState, action: Action): JobAppState {
  switch (action.type) {
    case 'ADD_APPLICATION':
      return { ...state, applications: [action.payload, ...state.applications] }

    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      }

    case 'DELETE_APPLICATION':
      return {
        ...state,
        applications: state.applications.filter(a => a.id !== action.payload),
        selectedApplicationId:
          state.selectedApplicationId === action.payload ? null : state.selectedApplicationId,
      }

    case 'UPDATE_STATUS': {
      const now = new Date().toISOString()
      const event: ApplicationEvent = {
        id: uuidv4(),
        status: action.payload.status,
        date: now,
        note: action.payload.note ?? '',
      }
      return {
        ...state,
        applications: state.applications.map(a =>
          a.id === action.payload.id
            ? {
                ...a,
                status: action.payload.status,
                timeline: [...a.timeline, event],
                updatedAt: now,
              }
            : a
        ),
      }
    }

    case 'SELECT_APPLICATION':
      return { ...state, selectedApplicationId: action.payload }

    case 'UPDATE_PROFILE':
      return { ...state, profile: action.payload }

    case 'LOAD_STATE':
      return action.payload

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface JobContextValue {
  state: JobAppState
  addApplication: (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => void
  updateApplication: (app: JobApplication) => void
  deleteApplication: (id: string) => void
  updateStatus: (id: string, status: ApplicationStatus, note?: string) => void
  selectApplication: (id: string | null) => void
  updateProfile: (profile: UserProfile) => void
  selectedApplication: JobApplication | null
}

const JobContext = createContext<JobContextValue | null>(null)

const STORAGE_KEY = 'job-tracker-state'

export function JobProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(jobReducer, INITIAL_STATE)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(stored) })
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  const addApplication = useCallback(
    (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => {
      const now = new Date().toISOString()
      const full: JobApplication = {
        ...app,
        id: uuidv4(),
        timeline: [],
        createdAt: now,
        updatedAt: now,
      }
      dispatch({ type: 'ADD_APPLICATION', payload: full })
    },
    []
  )

  const updateApplication = useCallback((app: JobApplication) => {
    dispatch({ type: 'UPDATE_APPLICATION', payload: { ...app, updatedAt: new Date().toISOString() } })
  }, [])

  const deleteApplication = useCallback((id: string) => {
    dispatch({ type: 'DELETE_APPLICATION', payload: id })
  }, [])

  const updateStatus = useCallback((id: string, status: ApplicationStatus, note?: string) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status, note } })
  }, [])

  const selectApplication = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_APPLICATION', payload: id })
  }, [])

  const updateProfile = useCallback((profile: UserProfile) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile })
  }, [])

  const selectedApplication =
    state.applications.find(a => a.id === state.selectedApplicationId) ?? null

  return (
    <JobContext.Provider
      value={{
        state,
        addApplication,
        updateApplication,
        deleteApplication,
        updateStatus,
        selectApplication,
        updateProfile,
        selectedApplication,
      }}
    >
      {children}
    </JobContext.Provider>
  )
}

export function useJobs() {
  const ctx = useContext(JobContext)
  if (!ctx) throw new Error('useJobs must be used inside JobProvider')
  return ctx
}
