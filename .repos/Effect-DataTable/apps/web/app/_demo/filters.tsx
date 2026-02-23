import { pipe } from 'effect'
import { ColumnConfig } from '@/registry/data-table-filter/core/filters'
import {
  CalendarArrowUpIcon,
  CircleDotDashedIcon,
  ClockIcon,
  Heading1Icon,
  TagsIcon,
  UserCheckIcon,
} from 'lucide-react'
import type { Issue } from './types'

export const columnsConfig = [
  ColumnConfig.text<Issue, 'title'>({
    id: 'title',
    accessor: (row) => row.title,
    displayName: 'Title',
    icon: Heading1Icon,
  }),
  ColumnConfig.option<Issue, 'status'>({
    id: 'status',
    accessor: (row) => row.status.id,
    displayName: 'Status',
    icon: CircleDotDashedIcon,
  }),
  ColumnConfig.option<Issue, 'assignee'>({
    id: 'assignee',
    accessor: (row) => row.assignee?.id as string,
    displayName: 'Assignee',
    icon: UserCheckIcon,
  }),
  ColumnConfig.multiOption<Issue, 'labels'>({
    id: 'labels',
    accessor: (row) => row.labels?.map((l) => l.id) as string[],
    displayName: 'Labels',
    icon: TagsIcon,
  }),
  pipe(
    ColumnConfig.number<Issue, 'estimatedHours'>({
      id: 'estimatedHours',
      accessor: (row) => row.estimatedHours as number,
      displayName: 'Estimated hours',
      icon: ClockIcon,
    }),
    ColumnConfig.setMinMax(0, 100),
  ),
  ColumnConfig.date<Issue, 'startDate'>({
    id: 'startDate',
    accessor: (row) => row.startDate as Date,
    displayName: 'Start Date',
    icon: CalendarArrowUpIcon,
  }),
] as const
