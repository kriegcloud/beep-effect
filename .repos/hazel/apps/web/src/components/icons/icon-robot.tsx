import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconRobot({ fill = "currentColor", secondaryfill, title = "robot", ...props }: IconProps) {
	secondaryfill = secondaryfill || fill
	return (
		<svg
			height="18"
			width="18"
			data-slot="icon"
			viewBox="0 0 18 18"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>{title}</title>
			<g fill={fill}>
				<path
					opacity="0.4"
					d="M14.25 6.75H3.75C2.92157 6.75 2.25 7.42157 2.25 8.25V14.25C2.25 15.0784 2.92157 15.75 3.75 15.75H14.25C15.0784 15.75 15.75 15.0784 15.75 14.25V8.25C15.75 7.42157 15.0784 6.75 14.25 6.75Z"
					fill={secondaryfill}
				/>
				<path
					d="M9 6.75V4.5M9 4.5C9 3.67157 9.67157 3 10.5 3C11.3284 3 12 3.67157 12 4.5C12 5.32843 11.3284 6 10.5 6C9.67157 6 9 5.32843 9 4.5Z"
					stroke={fill}
					strokeWidth="1.5"
					strokeLinecap="round"
					fill="none"
				/>
				<circle cx="6.75" cy="10.5" r="1.125" fill={fill} />
				<circle cx="11.25" cy="10.5" r="1.125" fill={fill} />
				<path
					d="M7.5 13.5C7.5 13.5 8.25 14.25 9 14.25C9.75 14.25 10.5 13.5 10.5 13.5"
					stroke={fill}
					strokeWidth="1.5"
					strokeLinecap="round"
					fill="none"
				/>
			</g>
		</svg>
	)
}

export default IconRobot
