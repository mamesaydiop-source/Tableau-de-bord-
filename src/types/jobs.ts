// ─── Job Application Status ──────────────────────────────────────────────────

export type ApplicationStatus =
  | 'brouillon'
  | 'envoyee'
  | 'en_attente'
  | 'entretien'
  | 'test_technique'
  | 'offre'
  | 'accepte'
  | 'refuse'
  | 'abandonne'

export type ContractType = 'CDI' | 'CDD' | 'stage' | 'alternance' | 'freelance' | 'autre'

export type ApplicationSource =
  | 'LinkedIn'
  | 'Indeed'
  | 'Welcome to the Jungle'
  | 'Candidature spontanée'
  | 'Réseau'
  | 'Site entreprise'
  | 'Autre'

// ─── Job Application ─────────────────────────────────────────────────────────

export interface JobApplication {
  id: string
  companyName: string
  companyLogo?: string
  position: string
  contractType: ContractType
  location: string
  remote: 'non' | 'partiel' | 'total'
  salaryMin?: number
  salaryMax?: number
  currency: string
  status: ApplicationStatus
  appliedAt?: string
  deadlineAt?: string
  notes: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  jobUrl?: string
  source: ApplicationSource
  followUpAt?: string
  tags: string[]
  timeline: ApplicationEvent[]
  createdAt: string
  updatedAt: string
}

export interface ApplicationEvent {
  id: string
  status: ApplicationStatus
  date: string
  note: string
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  firstName: string
  lastName: string
  title: string
  email: string
  phone: string
  address: string
  linkedinUrl: string
  githubUrl: string
  portfolioUrl: string
  bio: string
  targetPosition: string
  targetSalaryMin: number
  targetSalaryMax: number
  currency: string
  skills: string[]
  languages: Language[]
  experiences: WorkExperience[]
  education: Education[]
  certifications: Certification[]
}

export type LanguageLevel = 'débutant' | 'intermédiaire' | 'avancé' | 'natif'

export interface Language {
  id: string
  name: string
  level: LanguageLevel
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
  skills: string[]
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  current: boolean
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  url: string
}

// ─── Job App State ────────────────────────────────────────────────────────────

export type JobActiveView =
  | 'job-dashboard'
  | 'job-list'
  | 'job-new'
  | 'job-edit'
  | 'job-detail'
  | 'job-profile'

export interface JobAppState {
  applications: JobApplication[]
  profile: UserProfile
  selectedApplicationId: string | null
}

// ─── Status Meta ──────────────────────────────────────────────────────────────

export const STATUS_META: Record<ApplicationStatus, { label: string; color: string; bg: string; border: string }> = {
  brouillon:      { label: 'Brouillon',       color: 'text-gray-600',   bg: 'bg-gray-100',   border: 'border-gray-300' },
  envoyee:        { label: 'Envoyée',          color: 'text-blue-700',   bg: 'bg-blue-100',   border: 'border-blue-300' },
  en_attente:     { label: 'En attente',       color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  entretien:      { label: 'Entretien',        color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300' },
  test_technique: { label: 'Test technique',   color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' },
  offre:          { label: 'Offre reçue',      color: 'text-teal-700',   bg: 'bg-teal-100',   border: 'border-teal-300' },
  accepte:        { label: 'Accepté',          color: 'text-green-700',  bg: 'bg-green-100',  border: 'border-green-300' },
  refuse:         { label: 'Refusé',           color: 'text-red-700',    bg: 'bg-red-100',    border: 'border-red-300' },
  abandonne:      { label: 'Abandonné',        color: 'text-gray-500',   bg: 'bg-gray-50',    border: 'border-gray-200' },
}
