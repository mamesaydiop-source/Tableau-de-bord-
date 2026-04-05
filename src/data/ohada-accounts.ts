import type { OhadaAccount } from '../types'

/**
 * Plan Comptable Général – SYSCOHADA Révisé (2017)
 * Source : Acte Uniforme OHADA relatif au droit comptable et à l'information financière
 */
export const OHADA_ACCOUNTS: OhadaAccount[] = [
  // ─── CLASSE 1 – Ressources durables ─────────────────────────────────────
  { code: '101', label: 'Capital social', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '102', label: 'Capital par dotation', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '104', label: 'Comptes d\'apporteurs – opérations sur capital', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '105', label: 'Primes liées au capital social', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '106', label: 'Écarts de réévaluation', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '111', label: 'Réserve légale', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '112', label: 'Réserves statutaires ou contractuelles', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '118', label: 'Autres réserves', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '120', label: 'Report à nouveau (solde créditeur)', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '129', label: 'Report à nouveau (solde débiteur)', class: '1', type: 'bilan', nature: 'debiteur', isActive: true },
  { code: '130', label: 'Résultat net de l\'exercice – bénéfice', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '139', label: 'Résultat net de l\'exercice – perte', class: '1', type: 'bilan', nature: 'debiteur', isActive: true },
  { code: '141', label: 'Subventions d\'équipement', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '161', label: 'Emprunts obligataires', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '162', label: 'Emprunts auprès des établissements de crédit', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '163', label: 'Avances reçues de l\'État et des organismes publics', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '164', label: 'Emprunts auprès des associés', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '165', label: 'Dépôts et cautionnements reçus', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '181', label: 'Dettes de crédit-bail', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '191', label: 'Provisions pour risques', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },
  { code: '194', label: 'Provisions pour charges', class: '1', type: 'bilan', nature: 'crediteur', isActive: true },

  // ─── CLASSE 2 – Actif immobilisé ────────────────────────────────────────
  { code: '201', label: 'Frais d\'établissement', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '202', label: 'Frais de recherche et développement', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '203', label: 'Logiciels', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '204', label: 'Brevets, licences, marques', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '205', label: 'Fonds commercial', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '211', label: 'Terrains d\'exploitation', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '213', label: 'Bâtiments sur sol propre', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '214', label: 'Constructions sur sol d\'autrui', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '215', label: 'Installations et agencements', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '221', label: 'Matériel et outillage industriel', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '222', label: 'Matériel d\'emballage récupérable', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '224', label: 'Matériel et mobilier de bureau', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '225', label: 'Matériel informatique', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '226', label: 'Matériel de transport', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '228', label: 'Autres matériels', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '261', label: 'Titres de participation', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '271', label: 'Prêts et créances rattachés à des participations', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '272', label: 'Prêts au personnel', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '274', label: 'Dépôts et cautionnements versés', class: '2', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '281', label: 'Amortissements – immobilisations incorporelles', class: '2', type: 'actif', nature: 'crediteur', isActive: true },
  { code: '283', label: 'Amortissements – bâtiments', class: '2', type: 'actif', nature: 'crediteur', isActive: true },
  { code: '284', label: 'Amortissements – matériels', class: '2', type: 'actif', nature: 'crediteur', isActive: true },

  // ─── CLASSE 3 – Stocks ──────────────────────────────────────────────────
  { code: '31',  label: 'Marchandises', class: '3', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '321', label: 'Matières premières', class: '3', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '322', label: 'Matières et fournitures consommables', class: '3', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '33',  label: 'Autres approvisionnements', class: '3', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '34',  label: 'Produits en cours', class: '3', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '35',  label: 'Services en cours', class: '3', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '36',  label: 'Produits finis', class: '3', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '37',  label: 'Produits intermédiaires et résiduels', class: '3', type: 'actif', nature: 'debiteur', isActive: true },

  // ─── CLASSE 4 – Comptes de tiers ────────────────────────────────────────
  { code: '401', label: 'Fournisseurs', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '402', label: 'Fournisseurs – effets à payer', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '408', label: 'Fournisseurs – factures non reçues', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '409', label: 'Fournisseurs – avances et acomptes versés', class: '4', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '411', label: 'Clients', class: '4', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '412', label: 'Clients – effets à recevoir', class: '4', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '418', label: 'Clients – produits à recevoir', class: '4', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '419', label: 'Clients – avances et acomptes reçus', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '421', label: 'Personnel – avances et acomptes', class: '4', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '422', label: 'Personnel – rémunérations dues', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '431', label: 'Organismes sociaux', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '441', label: 'État – impôt sur les bénéfices', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '442', label: 'État – autres impôts et taxes', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '443', label: 'État – TVA facturée', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '445', label: 'État – TVA récupérable', class: '4', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '446', label: 'État – crédit de TVA', class: '4', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '471', label: 'Débiteurs divers', class: '4', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '472', label: 'Créditeurs divers', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '476', label: 'Charges constatées d\'avance', class: '4', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '477', label: 'Produits constatés d\'avance', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '481', label: 'Fournisseurs d\'investissement', class: '4', type: 'passif', nature: 'crediteur', isActive: true },
  { code: '485', label: 'Créances sur cessions d\'immobilisations', class: '4', type: 'actif', nature: 'debiteur', isActive: true },

  // ─── CLASSE 5 – Trésorerie ───────────────────────────────────────────────
  { code: '511', label: 'Valeurs à l\'encaissement', class: '5', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '512', label: 'Chèques à encaisser', class: '5', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '521', label: 'Banque locale 1', class: '5', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '522', label: 'Banque locale 2', class: '5', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '531', label: 'Chèques postaux', class: '5', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '571', label: 'Caisse siège social', class: '5', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '572', label: 'Caisse annexe', class: '5', type: 'actif', nature: 'debiteur', isActive: true },
  { code: '581', label: 'Virements internes', class: '5', type: 'actif', nature: 'debiteur', isActive: true },

  // ─── CLASSE 6 – Charges ──────────────────────────────────────────────────
  { code: '601', label: 'Achats de marchandises', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '602', label: 'Achats de matières premières', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '604', label: 'Achats stockés – matières et fournitures consommables', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '605', label: 'Autres achats', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '608', label: 'Achats d\'emballages', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '609', label: 'Rabais, remises et ristournes obtenus sur achats', class: '6', type: 'charge', nature: 'crediteur', isActive: true },
  { code: '611', label: 'Transports sur achats', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '612', label: 'Transports sur ventes', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '613', label: 'Transports pour le compte de tiers', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '614', label: 'Transports du personnel', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '621', label: 'Sous-traitance générale', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '622', label: 'Locations et charges locatives', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '623', label: 'Redevances de crédit-bail', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '624', label: 'Entretien, réparations et maintenance', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '625', label: 'Primes d\'assurance', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '626', label: 'Études, recherches et documentation', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '627', label: 'Publicité et relations publiques', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '628', label: 'Frais de télécommunications', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '629', label: 'Autres services extérieurs A', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '631', label: 'Frais bancaires', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '632', label: 'Rémunérations d\'intermédiaires', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '633', label: 'Frais de formation du personnel', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '634', label: 'Cadeaux à la clientèle', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '635', label: 'Frais de voyage et déplacements', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '637', label: 'Frais de réceptions', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '641', label: 'Impôts et taxes directs', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '642', label: 'Droits d\'enregistrement', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '645', label: 'Taxes sur chiffre d\'affaires non récupérables', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '651', label: 'Pertes sur créances irrécouvrables', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '658', label: 'Charges diverses', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '661', label: 'Rémunérations directes versées au personnel', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '662', label: 'Rémunérations des congés', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '663', label: 'Indemnités et avantages divers', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '664', label: 'Charges sociales', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '671', label: 'Intérêts des emprunts', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '672', label: 'Intérêts des dettes de crédit-bail', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '673', label: 'Escomptes accordés', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '674', label: 'Pertes de change', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '681', label: 'Dotations aux amortissements des immobilisations', class: '6', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '691', label: 'Dotations aux provisions pour risques à court terme', class: '6', type: 'charge', nature: 'debiteur', isActive: true },

  // ─── CLASSE 7 – Produits ─────────────────────────────────────────────────
  { code: '701', label: 'Ventes de marchandises', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '702', label: 'Ventes de produits finis', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '703', label: 'Ventes de produits intermédiaires', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '704', label: 'Ventes de produits résiduels', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '705', label: 'Travaux facturés', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '706', label: 'Services vendus', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '707', label: 'Produits accessoires', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '709', label: 'Rabais, remises et ristournes accordés', class: '7', type: 'produit', nature: 'debiteur', isActive: true },
  { code: '711', label: 'Subventions d\'exploitation', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '721', label: 'Immobilisations produites par l\'entreprise', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '731', label: 'Variations de stocks de biens produits', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '741', label: 'Revenus des titres de participation', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '742', label: 'Revenus des autres immobilisations financières', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '751', label: 'Récupérations sur créances amorties', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '752', label: 'Produits sur exercices antérieurs', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '758', label: 'Produits divers', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '771', label: 'Intérêts de prêts', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '772', label: 'Revenus de placements', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '773', label: 'Escomptes obtenus', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '774', label: 'Gains de change', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '781', label: 'Transferts de charges d\'exploitation', class: '7', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '791', label: 'Reprises de provisions pour risques', class: '7', type: 'produit', nature: 'crediteur', isActive: true },

  // ─── CLASSE 8 – Charges et produits HAO ──────────────────────────────────
  { code: '811', label: 'Valeurs comptables des cessions d\'immobilisations', class: '8', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '821', label: 'Produits des cessions d\'immobilisations', class: '8', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '831', label: 'Charges HAO sur exercices antérieurs', class: '8', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '832', label: 'Pénalités et amendes fiscales et pénales', class: '8', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '838', label: 'Autres charges HAO', class: '8', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '841', label: 'Produits HAO sur exercices antérieurs', class: '8', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '848', label: 'Autres produits HAO', class: '8', type: 'produit', nature: 'crediteur', isActive: true },
  { code: '871', label: 'Participation des travailleurs', class: '8', type: 'charge', nature: 'debiteur', isActive: true },
  { code: '881', label: 'Impôt sur le résultat', class: '8', type: 'charge', nature: 'debiteur', isActive: true },
]

export const CLASS_LABELS: Record<string, string> = {
  '1': 'Ressources Durables',
  '2': 'Actif Immobilisé',
  '3': 'Stocks',
  '4': 'Comptes de Tiers',
  '5': 'Trésorerie',
  '6': 'Charges des Activités Ordinaires',
  '7': 'Produits des Activités Ordinaires',
  '8': 'Charges et Produits HAO',
}

export function getAccountByCode(code: string): OhadaAccount | undefined {
  return OHADA_ACCOUNTS.find(a => a.code === code)
}

export function getAccountsByClass(cls: string): OhadaAccount[] {
  return OHADA_ACCOUNTS.filter(a => a.class === cls)
}

export function searchAccounts(query: string): OhadaAccount[] {
  const q = query.toLowerCase()
  return OHADA_ACCOUNTS.filter(
    a => a.code.includes(q) || a.label.toLowerCase().includes(q)
  )
}
