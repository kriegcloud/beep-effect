'use client'
import dynamic from 'next/dynamic'
import { TableSkeleton } from './table-skeleton'
import { tstColumnDefs } from './columns'

const IssuesTable = dynamic(
  () => import('./issues-table').then(mod => ({ default: mod.IssuesTable })),
  {
    ssr: false,
    loading: () => <TableSkeleton numCols={tstColumnDefs.length} numRows={10} />
  }
)

export function IssuesTableWrapper() {
  return <IssuesTable />
}
