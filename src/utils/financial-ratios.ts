import type { FinancialRatio } from '../types'

interface FinancialInputs {
  chiffreAffaires: number
  totalCharges: number
  totalProduits: number
  resultatNet: number
  actifTotal: number
  passifTotal: number
  capitauxPropres: number
  dettesFinancieres: number
  actifCirculant: number
  passifCirculant: number
  tresorerie: number
  creancesClients: number
  dettesF: number
  stocks: number
  immobilisationsNettes: number
  // Optional (N-1 for evolution)
  resultatNetN1?: number
  chiffreAffairesN1?: number
}

function statusFromBenchmark(
  value: number,
  benchmark: { min: number; max: number } | null,
  higherIsBetter = true
): FinancialRatio['status'] {
  if (benchmark === null) return 'neutre'
  if (higherIsBetter) {
    if (value >= benchmark.max) return 'bon'
    if (value >= benchmark.min) return 'moyen'
    return 'mauvais'
  } else {
    if (value <= benchmark.min) return 'bon'
    if (value <= benchmark.max) return 'moyen'
    return 'mauvais'
  }
}

export function computeFinancialRatios(inputs: FinancialInputs): FinancialRatio[] {
  const {
    chiffreAffaires,
    resultatNet,
    actifTotal,
    capitauxPropres,
    dettesFinancieres,
    actifCirculant,
    passifCirculant,
    tresorerie,
    creancesClients,
    dettesF,
    stocks,
    immobilisationsNettes,
  } = inputs

  const totalCharges = inputs.totalCharges || 0
  const totalProduits = inputs.totalProduits || 0

  // ─── Helper: safe division ──────────────────────────────────────────────
  const div = (a: number, b: number): number | null => (b === 0 ? null : a / b)
  const pct = (a: number, b: number): number | null => {
    const r = div(a, b)
    return r === null ? null : r * 100
  }

  // ─── Calculs préalables ─────────────────────────────────────────────────
  const margeBrute = chiffreAffaires - (stocks > 0 ? stocks * 0.8 : 0) // approximatif
  const ebe = chiffreAffaires > 0
    ? chiffreAffaires - totalCharges * 0.7  // approximatif sans charges fin
    : 0
  const dettesTotales = dettesFinancieres + passifCirculant
  const ressourcesStables = capitauxPropres + dettesFinancieres
  const emploisStables = immobilisationsNettes
  const frng = ressourcesStables - emploisStables
  const actifCirculantHorsTreso = actifCirculant - tresorerie
  const passifCirculantHorsTreso = passifCirculant
  const bfr = actifCirculantHorsTreso - passifCirculantHorsTreso
  const tresorerieNette = frng - bfr

  // ─── CAF approximation ──────────────────────────────────────────────────
  // CAF = Résultat Net + Dotations aux amortissements (approximé)
  const caf = resultatNet // approximation sans les dotations d'amort

  const ratios: FinancialRatio[] = [

    // ══════════════════════════════════════════════════════════════════════
    // RENTABILITÉ
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'roe',
      category: 'rentabilite',
      label: 'Rentabilité des Capitaux Propres (ROE)',
      formula: 'Résultat Net / Capitaux Propres × 100',
      value: pct(resultatNet, capitauxPropres),
      unit: '%',
      benchmark: { min: 10, max: 20 },
      status: 'neutre',
      description: 'Mesure le rendement généré pour les actionnaires. OHADA cible ≥ 10 %.',
    },
    {
      id: 'roa',
      category: 'rentabilite',
      label: 'Rentabilité des Actifs (ROA)',
      formula: 'Résultat Net / Total Actif × 100',
      value: pct(resultatNet, actifTotal),
      unit: '%',
      benchmark: { min: 3, max: 10 },
      status: 'neutre',
      description: 'Efficacité d\'utilisation de l\'ensemble des actifs.',
    },
    {
      id: 'marge_nette',
      category: 'rentabilite',
      label: 'Marge Nette',
      formula: 'Résultat Net / Chiffre d\'Affaires × 100',
      value: pct(resultatNet, chiffreAffaires),
      unit: '%',
      benchmark: { min: 3, max: 15 },
      status: 'neutre',
      description: 'Part du CA transformée en bénéfice net.',
    },
    {
      id: 'marge_brute',
      category: 'rentabilite',
      label: 'Marge Brute d\'Exploitation',
      formula: '(CA − Coût des Ventes) / CA × 100',
      value: chiffreAffaires > 0 ? pct(margeBrute, chiffreAffaires) : null,
      unit: '%',
      benchmark: { min: 20, max: 50 },
      status: 'neutre',
      description: 'Marge dégagée avant frais généraux.',
    },
    {
      id: 'taux_charges',
      category: 'rentabilite',
      label: 'Taux de Charges',
      formula: 'Total Charges / Total Produits × 100',
      value: pct(totalCharges, totalProduits),
      unit: '%',
      benchmark: { min: 60, max: 90 },
      status: 'neutre',
      description: 'Part des produits absorbée par les charges. Plus bas = mieux.',
    },

    // ══════════════════════════════════════════════════════════════════════
    // LIQUIDITÉ
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'liquidite_generale',
      category: 'liquidite',
      label: 'Liquidité Générale (Current Ratio)',
      formula: 'Actif Circulant / Passif Circulant',
      value: div(actifCirculant, passifCirculant),
      unit: 'x',
      benchmark: { min: 1.5, max: 3 },
      status: 'neutre',
      description: 'Capacité à honorer les dettes à court terme. Norme OHADA ≥ 1,5.',
    },
    {
      id: 'liquidite_reduite',
      category: 'liquidite',
      label: 'Liquidité Réduite (Quick Ratio)',
      formula: '(Actif Circulant − Stocks) / Passif Circulant',
      value: div(actifCirculant - stocks, passifCirculant),
      unit: 'x',
      benchmark: { min: 1, max: 2 },
      status: 'neutre',
      description: 'Liquidité sans tenir compte des stocks (moins liquides).',
    },
    {
      id: 'liquidite_immediate',
      category: 'liquidite',
      label: 'Liquidité Immédiate (Cash Ratio)',
      formula: 'Trésorerie / Passif Circulant',
      value: div(tresorerie, passifCirculant),
      unit: 'x',
      benchmark: { min: 0.2, max: 1 },
      status: 'neutre',
      description: 'Capacité à payer immédiatement sans vendre d\'actifs.',
    },

    // ══════════════════════════════════════════════════════════════════════
    // SOLVABILITÉ
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'autonomie_financiere',
      category: 'solvabilite',
      label: 'Autonomie Financière',
      formula: 'Capitaux Propres / Total Passif × 100',
      value: pct(capitauxPropres, actifTotal),
      unit: '%',
      benchmark: { min: 30, max: 60 },
      status: 'neutre',
      description: 'Part du financement assurée par les fonds propres. OHADA ≥ 30 %.',
    },
    {
      id: 'endettement',
      category: 'solvabilite',
      label: 'Ratio d\'Endettement (Gearing)',
      formula: 'Dettes Totales / Capitaux Propres × 100',
      value: pct(dettesTotales, capitauxPropres),
      unit: '%',
      benchmark: { min: 0, max: 150 },
      status: 'neutre',
      description: 'Niveau d\'endettement par rapport aux fonds propres. < 150 % recommandé.',
    },
    {
      id: 'capacite_remboursement',
      category: 'solvabilite',
      label: 'Capacité de Remboursement',
      formula: 'Dettes Financières / CAF',
      value: caf !== 0 ? div(dettesFinancieres, caf) : null,
      unit: 'ans',
      benchmark: { min: 0, max: 5 },
      status: 'neutre',
      description: 'Nombre d\'années pour rembourser les dettes financières via la CAF. < 5 ans OHADA.',
    },
    {
      id: 'couverture_actif_immob',
      category: 'solvabilite',
      label: 'Couverture des Immobilisations',
      formula: 'Ressources Stables / Emplois Stables × 100',
      value: pct(ressourcesStables, emploisStables),
      unit: '%',
      benchmark: { min: 100, max: 150 },
      status: 'neutre',
      description: 'Les ressources stables doivent financer les emplois stables (règle d\'or). ≥ 100 %.',
    },

    // ══════════════════════════════════════════════════════════════════════
    // ACTIVITÉ / GESTION
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'rotation_stocks',
      category: 'activite',
      label: 'Rotation des Stocks',
      formula: 'Chiffre d\'Affaires / Stock',
      value: stocks > 0 ? div(chiffreAffaires, stocks) : null,
      unit: 'x/an',
      benchmark: { min: 4, max: 12 },
      status: 'neutre',
      description: 'Fréquence de renouvellement des stocks dans l\'exercice.',
    },
    {
      id: 'delai_clients',
      category: 'activite',
      label: 'Délai de Recouvrement Clients',
      formula: '(Créances Clients / CA) × 365',
      value: chiffreAffaires > 0 ? (creancesClients / chiffreAffaires) * 365 : null,
      unit: 'jours',
      benchmark: { min: 0, max: 60 },
      status: 'neutre',
      description: 'Délai moyen pour encaisser les créances. OHADA cible ≤ 60 jours.',
    },
    {
      id: 'delai_fournisseurs',
      category: 'activite',
      label: 'Délai de Paiement Fournisseurs',
      formula: '(Dettes Fournisseurs / Achats) × 365',
      value: chiffreAffaires > 0 ? (dettesF / chiffreAffaires) * 365 : null,
      unit: 'jours',
      benchmark: { min: 30, max: 90 },
      status: 'neutre',
      description: 'Délai moyen de paiement des fournisseurs.',
    },
    {
      id: 'rotation_actif',
      category: 'activite',
      label: 'Rotation de l\'Actif Total',
      formula: 'Chiffre d\'Affaires / Total Actif',
      value: div(chiffreAffaires, actifTotal),
      unit: 'x',
      benchmark: { min: 0.5, max: 2 },
      status: 'neutre',
      description: 'Efficacité d\'utilisation de l\'actif total pour générer du CA.',
    },

    // ══════════════════════════════════════════════════════════════════════
    // ÉQUILIBRE FINANCIER (spécifique OHADA)
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'frng',
      category: 'equilibre',
      label: 'Fonds de Roulement Net Global (FRNG)',
      formula: 'Ressources Stables − Emplois Stables',
      value: frng,
      unit: 'FCFA',
      benchmark: null,
      status: frng >= 0 ? 'bon' : 'mauvais',
      description: 'Excédent des ressources stables sur les emplois stables. Doit être ≥ 0.',
    },
    {
      id: 'bfr',
      category: 'equilibre',
      label: 'Besoin en Fonds de Roulement (BFR)',
      formula: 'Actif Circulant (hors tréso) − Passif Circulant (hors tréso)',
      value: bfr,
      unit: 'FCFA',
      benchmark: null,
      status: bfr >= 0 ? 'moyen' : 'bon',
      description: 'Besoin de financement lié au cycle d\'exploitation. BFR < 0 = ressource.',
    },
    {
      id: 'tresorerie_nette',
      category: 'equilibre',
      label: 'Trésorerie Nette',
      formula: 'FRNG − BFR',
      value: tresorerieNette,
      unit: 'FCFA',
      benchmark: null,
      status: tresorerieNette >= 0 ? 'bon' : 'mauvais',
      description: 'Position de trésorerie structurelle. Doit être positive. TN = FRNG − BFR.',
    },
  ]

  // Apply benchmark-based status
  return ratios.map(r => {
    if (r.value === null) return { ...r, status: 'neutre' as const }
    if (r.benchmark === null) return r // already set manually

    const higherIsBetter = ![
      'taux_charges', 'endettement', 'capacite_remboursement',
      'delai_clients', 'delai_fournisseurs',
    ].includes(r.id)

    return {
      ...r,
      status: statusFromBenchmark(r.value, r.benchmark, higherIsBetter),
    }
  })
}

export function formatRatioValue(value: number | null, unit: string): string {
  if (value === null) return 'N/D'

  if (unit === '%') return `${value.toFixed(1)} %`
  if (unit === 'x') return `${value.toFixed(2)}x`
  if (unit === 'x/an') return `${value.toFixed(1)}x`
  if (unit === 'jours') return `${Math.round(value)} j`
  if (unit === 'ans') return `${value.toFixed(1)} ans`
  if (unit === 'FCFA') {
    if (Math.abs(value) >= 1_000_000)
      return `${(value / 1_000_000).toFixed(2)} M`
    if (Math.abs(value) >= 1_000)
      return `${(value / 1_000).toFixed(0)} K`
    return value.toFixed(0)
  }
  return value.toFixed(2)
}
