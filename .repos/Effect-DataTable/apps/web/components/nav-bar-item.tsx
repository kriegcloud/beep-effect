'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface NavBarItemProps {
  href: string
  label: string
  className?: string
}

export function NavBarItem({ href, label, className }: NavBarItemProps) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)

  return (
    <Link href={href} className={className} data-active={isActive}>
      {label}
    </Link>
  )
}
