'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  DataTableFilter,
  useDataTableFilters,
} from '@/registry/data-table-filter'
import type { FiltersState } from '@/registry/data-table-filter/core/types'
import { useAtomValue, useAtom } from '@effect-atom/atom-react'
import { Result } from '@effect-atom/atom'
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { LABEL_STYLES_BG, type TW_COLOR, tstColumnDefs } from './columns'
import { DataTable } from './data-table'
import { columnsConfig } from './filters'
import { TableFilterSkeleton, TableSkeleton } from './table-skeleton'
import type { IssueLabel, IssueStatus, User } from './types'
import {
  labelsAtom,
  statusesAtom,
  usersAtom,
  issuesAtom,
  facetedLabelsAtom,
  facetedStatusesAtom,
  facetedUsersAtom,
  facetedHoursAtom,
  filtersAtom,
} from './atoms'

function createLabelOptions(labels: readonly IssueLabel[]) {
  return labels.map((l) => ({
    value: l.id,
    label: l.name,
    icon: (
      <div
        className={cn(
          'size-2.5 rounded-full',
          LABEL_STYLES_BG[l.color as TW_COLOR],
        )}
      />
    ),
  }))
}

function createStatusOptions(statuses: readonly IssueStatus[]) {
  return statuses.map((s) => ({
    value: s.id,
    label: s.name,
    icon: s.icon,
  }))
}

function createUserOptions(users: readonly User[]) {
  return users.map((u) => ({
    value: u.id,
    label: u.name,
    icon: (
      <Avatar key={u.id} className="size-4">
        <AvatarImage src={u.picture} />
        <AvatarFallback>
          {u.name
            .split('')
            .map((x) => x[0])
            .join('')
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
    ),
  }))
}

export function IssuesTable() {
  const [filters, setFilters] = useAtom(filtersAtom)
  const [rowSelection, setRowSelection] = useState({})

  // Filter options - can render independently
  const filterOptionsResult = Result.all({
    labels: useAtomValue(labelsAtom),
    statuses: useAtomValue(statusesAtom),
    users: useAtomValue(usersAtom),
    facetedLabels: useAtomValue(facetedLabelsAtom),
    facetedStatuses: useAtomValue(facetedStatusesAtom),
    facetedUsers: useAtomValue(facetedUsersAtom),
    facetedHours: useAtomValue(facetedHoursAtom),
  })

  // Table data - separate loading state
  const issuesResult = useAtomValue(issuesAtom)
  const issues = Result.getOrElse(issuesResult, () => [])

  const filterProps = Result.matchWithWaiting(filterOptionsResult, {
    onWaiting: () => null,
    onError: () => null,
    onDefect: () => null,
    onSuccess: ({ value }) => ({
      options: {
        status: createStatusOptions(value.statuses),
        assignee: createUserOptions(value.users),
        labels: createLabelOptions(value.labels),
      },
      faceted: {
        status: value.facetedStatuses,
        assignee: value.facetedUsers,
        labels: value.facetedLabels,
        estimatedHours: value.facetedHours as [number, number],
      },
    }),
  })

  const { columns, filters: filterColumns, actions, strategy } = useDataTableFilters({
    strategy: 'server',
    data: issues as any[],
    columnsConfig,
    filters: filters as FiltersState,
    onFiltersChange: setFilters,
    options: filterProps?.options ?? {},
    faceted: filterProps?.faceted ?? {},
  })

  const table = useReactTable({
    data: issues as any[],
    columns: tstColumnDefs,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  })

  return (
    <div className="w-full col-span-2">
      <div className="flex items-center pb-4 gap-2">
        {filterProps === null ? (
          <TableFilterSkeleton />
        ) : (
          <DataTableFilter
            filters={filterColumns}
            columns={columns}
            actions={actions}
            strategy={strategy}
          />
        )}
      </div>
      {Result.matchWithWaiting(issuesResult, {
        onWaiting: () => <TableSkeleton numCols={tstColumnDefs.length} numRows={10} />,
        onError: () => <TableSkeleton numCols={tstColumnDefs.length} numRows={10} />,
        onDefect: () => <TableSkeleton numCols={tstColumnDefs.length} numRows={10} />,
        onSuccess: () => <DataTable table={table} actions={actions} />,
      })}
    </div>
  )
}
