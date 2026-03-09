"use client"

import { ArrowUpRightIcon } from "@phosphor-icons/react"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import type { AnchorHTMLAttributes, MouseEventHandler, ReactNode } from "react"
import { cn } from "@/lib/cn"
import { useLessonNavSfx } from "@/lib/useLessonNavSfx"

interface MDXLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
  children: ReactNode
}

export function MDXLink(props: MDXLinkProps) {
  const { children, className, href, onMouseEnter, onClick, ...anchorProps } = props
  const { playHoverTone, playTapTone } = useLessonNavSfx()
  const isInternal = (href?.startsWith("/") && !href.startsWith("//")) || href?.startsWith("./")
  const isExternal = href?.startsWith("http://") || href?.startsWith("https://")
  const iconClassName = "text-blue-400/70 group-hover:text-blue-300/70 font-bold"

  const linkClassName = cn(
    "group text-blue-400 hover:text-blue-300 no-underline inline-flex items-center gap-1",
    className,
  )

  const handleMouseEnter: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onMouseEnter?.(event)
    playHoverTone()
  }

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event)
    playTapTone()
  }

  if (isInternal && href) {
    return (
      <Link href={href} className={linkClassName} onMouseEnter={handleMouseEnter} onClick={handleClick}>
        {children}
        <ArrowRightIcon size={18} weight="bold" className={iconClassName} />
      </Link>
    )
  }

  return (
    <a
      href={href}
      className={linkClassName}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
      {...anchorProps}
    >
      {children}
      {isExternal && <ArrowUpRightIcon size={18} weight="bold" className={iconClassName} />}
    </a>
  )
}
