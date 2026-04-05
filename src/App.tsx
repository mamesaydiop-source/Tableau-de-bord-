import { AccountingProvider, useAccounting } from './context/AccountingContext'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import Overview from './components/Dashboard/Overview'
import TransactionForm from './components/Accounting/TransactionForm'
import Journal from './components/Accounting/Journal'
import PlanComptable from './components/Accounting/PlanComptable'
import EvidenceManager from './components/Evidence/EvidenceManager'
import Bilan from './components/Reports/Bilan'
import CompteResultat from './components/Reports/CompteResultat'
import CashFlow from './components/Reports/CashFlow'
import RatiosDashboard from './components/Reports/Ratios'
import Parametres from './components/Settings/Parametres'

function AppContent() {
  const { state } = useAccounting()

  const renderView = () => {
    switch (state.activeView) {
      case 'dashboard':        return <Overview />
      case 'new-entry':        return <TransactionForm />
      case 'journal':          return <Journal />
      case 'plan-comptable':   return <PlanComptable />
      case 'evidences':        return <EvidenceManager />
      case 'bilan':            return <Bilan />
      case 'compte-resultat':  return <CompteResultat />
      case 'cash-flow':        return <CashFlow />
      case 'ratios':           return <RatiosDashboard />
      case 'parametres':       return <Parametres />
      default:                 return <Overview />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AccountingProvider>
      <AppContent />
    </AccountingProvider>
  )
}
