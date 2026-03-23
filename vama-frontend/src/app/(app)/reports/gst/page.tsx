'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSales } from '@/hooks/use-sales'
import { formatINR } from '@/lib/format'

interface HsnGroup {
  hsnCode: string
  taxable: number
  cgst: number
  sgst: number
  igst: number
  total: number
}

export default function GstReportPage() {
  const { data } = useSales({ page: 1, pageSize: 100, status: 'PAID' })

  // Build HSN-wise summary
  const hsnMap = new Map<string, HsnGroup>()
  for (const bill of data?.data ?? []) {
    for (const li of bill.lineItems) {
      const existing = hsnMap.get(li.hsnCode) ?? {
        hsnCode: li.hsnCode, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0,
      }
      existing.taxable += li.taxableAmount
      existing.cgst += li.cgst
      existing.sgst += li.sgst
      existing.igst += li.igst
      existing.total += li.lineTotal
      hsnMap.set(li.hsnCode, existing)
    }
  }

  const hsnSummary = Array.from(hsnMap.values())
  const grandTotals = hsnSummary.reduce(
    (acc, row) => ({
      taxable: acc.taxable + row.taxable,
      cgst: acc.cgst + row.cgst,
      sgst: acc.sgst + row.sgst,
      igst: acc.igst + row.igst,
      total: acc.total + row.total,
    }),
    { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
  )

  return (
    <div>
      <PageHeader title="GST Report" description="HSN-wise GST summary for GSTR-1 filing" />

      <Card>
        <CardHeader>
          <CardTitle>HSN-wise Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
                <tr>
                  {['HSN Code', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total GST'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-[var(--color-muted-fg)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {hsnSummary.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[var(--color-muted)]">
                      No paid bills found. GST data will appear here after sales are recorded.
                    </td>
                  </tr>
                ) : (
                  <>
                    {hsnSummary.map((row) => (
                      <tr key={row.hsnCode} className="hover:bg-[var(--color-surface-raised)]">
                        <td className="px-4 py-3 font-mono font-medium">{row.hsnCode}</td>
                        <td className="px-4 py-3">{formatINR(row.taxable)}</td>
                        <td className="px-4 py-3">{formatINR(row.cgst)}</td>
                        <td className="px-4 py-3">{formatINR(row.sgst)}</td>
                        <td className="px-4 py-3">{formatINR(row.igst)}</td>
                        <td className="px-4 py-3 font-semibold">{formatINR(row.cgst + row.sgst + row.igst)}</td>
                      </tr>
                    ))}
                    <tr className="bg-[var(--color-surface-raised)] font-semibold border-t-2 border-[var(--color-border-strong)]">
                      <td className="px-4 py-3">Grand Total</td>
                      <td className="px-4 py-3">{formatINR(grandTotals.taxable)}</td>
                      <td className="px-4 py-3">{formatINR(grandTotals.cgst)}</td>
                      <td className="px-4 py-3">{formatINR(grandTotals.sgst)}</td>
                      <td className="px-4 py-3">{formatINR(grandTotals.igst)}</td>
                      <td className="px-4 py-3 text-[var(--color-primary)]">{formatINR(grandTotals.cgst + grandTotals.sgst + grandTotals.igst)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
