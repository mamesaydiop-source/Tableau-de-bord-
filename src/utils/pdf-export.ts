import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Company, JournalEntry } from '../types'
import { formatMontant, formatDate } from './format'

const BLUE = [26, 58, 107] as [number, number, number]
const GOLD = [212, 160, 23] as [number, number, number]
const GRAY = [240, 240, 240] as [number, number, number]

function addHeader(doc: jsPDF, company: Company, title: string) {
  doc.setFillColor(...BLUE)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(company.name, 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`RCCM: ${company.rccm} | NINEA: ${company.ninea}`, 14, 19)
  doc.text(`Capital: ${formatMontant(company.capital, company.currency)}`, 14, 24)

  doc.setFillColor(...GOLD)
  doc.rect(0, 28, 210, 7, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 105, 33, { align: 'center' })

  doc.setTextColor(0, 0, 0)
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(
      `SYSCOHADA Révisé – Généré le ${formatDate(new Date().toISOString())} – Page ${i}/${pageCount}`,
      105,
      292,
      { align: 'center' }
    )
  }
}

export function exportJournalPDF(entries: JournalEntry[], company: Company) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  addHeader(doc, company, 'JOURNAL GÉNÉRAL')

  const rows: (string | number)[][] = []
  for (const entry of entries) {
    for (const line of entry.lines) {
      rows.push([
        formatDate(entry.date),
        entry.reference,
        entry.journal,
        line.accountCode,
        line.accountLabel,
        entry.libelle,
        line.debit > 0 ? formatMontant(line.debit, company.currency) : '',
        line.credit > 0 ? formatMontant(line.credit, company.currency) : '',
      ])
    }
  }

  autoTable(doc, {
    startY: 38,
    head: [['Date', 'Réf.', 'Jnl', 'Compte', 'Libellé Compte', 'Description', 'Débit', 'Crédit']],
    body: rows,
    headStyles: { fillColor: BLUE, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: GRAY },
    columnStyles: {
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
  })

  addFooter(doc)
  doc.save(`Journal-General-${company.name.replace(/\s+/g, '_')}.pdf`)
}

export function exportBilanPDF(
  rows: { label: string; net: number; section: string }[],
  company: Company,
  fiscalYear: string
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  addHeader(doc, company, `BILAN – Exercice ${fiscalYear}`)

  const actif = rows.filter(r =>
    ['actif_immobilise', 'actif_circulant', 'tresorerie_actif'].includes(r.section)
  )
  const passif = rows.filter(r =>
    ['capitaux_propres', 'dettes_financieres', 'passif_circulant', 'tresorerie_passif'].includes(r.section)
  )

  autoTable(doc, {
    startY: 38,
    head: [['ACTIF', 'Montant Net']],
    body: actif.map(r => [r.label, formatMontant(r.net, company.currency)]),
    headStyles: { fillColor: BLUE, textColor: 255 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: GRAY },
    columnStyles: { 1: { halign: 'right' } },
  })

  const afterActif = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  autoTable(doc, {
    startY: afterActif,
    head: [['PASSIF', 'Montant']],
    body: passif.map(r => [r.label, formatMontant(r.net, company.currency)]),
    headStyles: { fillColor: [46, 125, 50] as [number, number, number], textColor: 255 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: GRAY },
    columnStyles: { 1: { halign: 'right' } },
  })

  addFooter(doc)
  doc.save(`Bilan-${fiscalYear}-${company.name.replace(/\s+/g, '_')}.pdf`)
}
