import type { HTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = ({ className, ...props }: CardHeaderProps) => {
	return <div className={twMerge("flex flex-col space-y-1.5", className)} {...props} />
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = ({ className, ...props }: CardTitleProps) => {
	return (
		<h2 className={twMerge("font-semibold text-2xl leading-none tracking-tight", className)} {...props} />
	)
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = ({ className, ...props }: CardDescriptionProps) => {
	return <p className={twMerge("text-muted-fg text-sm", className)} {...props} />
}

export { CardHeader, CardTitle, CardDescription }
