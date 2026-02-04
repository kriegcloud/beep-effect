/**
 * PageLayout - Shared layout components for page consistency
 *
 * Provides:
 * - PageContainer: Consistent max-width and padding
 * - PageHeader: Standardized header with title, subtitle, breadcrumb
 * - PageBreadcrumb: Simple back navigation pattern
 *
 * @since 2.0.0
 * @module components/PageLayout
 */

import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

interface PageContainerProps {
  children: ReactNode
  /** Maximum width variant */
  size?: "sm" | "md" | "lg" | "xl" | "full"
  /** Additional className */
  className?: string
}

const sizeClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  full: "max-w-none"
}

/**
 * PageContainer - Consistent page width and centering
 */
export function PageContainer({ children, size = "lg", className = "" }: PageContainerProps) {
  return (
    <div className={`${sizeClasses[size]} mx-auto px-6 py-6 ${className}`}>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  /** Main title */
  title: string
  /** Subtitle/description */
  subtitle?: string
  /** Breadcrumb link */
  backTo?: { label: string; href: string }
  /** Right-side actions */
  actions?: ReactNode
  /** Additional className */
  className?: string
}

/**
 * PageHeader - Consistent page header with title and optional breadcrumb
 */
export function PageHeader({
  title,
  subtitle,
  backTo,
  actions,
  className = ""
}: PageHeaderProps) {
  return (
    <header className={`mb-6 ${className}`}>
      {backTo && (
        <nav className="mb-4">
          <Link
            to={backTo.href}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {backTo.label}
          </Link>
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

interface PageSectionProps {
  children: ReactNode
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** Additional className */
  className?: string
}

/**
 * PageSection - Consistent section styling within pages
 */
export function PageSection({
  children,
  title,
  description,
  className = ""
}: PageSectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      {title && (
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
      )}
      {children}
    </section>
  )
}

interface EmptyStateProps {
  /** Icon component */
  icon?: ReactNode
  /** Title */
  title: string
  /** Description */
  description?: string
  /** Action button/link */
  action?: ReactNode
}

/**
 * EmptyState - Consistent empty state display
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-2xs text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  /** Error title */
  title?: string
  /** Error message */
  message: string
  /** Retry action */
  onRetry?: () => void
}

/**
 * ErrorState - Consistent error display
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry
}: ErrorStateProps) {
  return (
    <div className="border-l-4 border-destructive bg-destructive/10 p-4 rounded-r">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="text-2xs text-muted-foreground mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-xs text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  )
}

interface LoadingStateProps {
  /** Number of skeleton rows */
  rows?: number
}

/**
 * LoadingState - Consistent loading skeleton
 */
export function LoadingState({ rows = 3 }: LoadingStateProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-muted animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-1/3 rounded bg-muted animate-pulse mb-1" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
