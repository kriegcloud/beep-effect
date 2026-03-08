import * as React from "react"
import { useTheme } from "../hooks/useTheme.js"

export function ModalBox({
  title,
  children,
  width = "60%",
  height = "60%"
}: {
  readonly title: string
  readonly children: React.ReactNode
  readonly width?: `${number}%` | number
  readonly height?: `${number}%` | number
}) {
  const theme = useTheme()
  return (
    <box
      position="absolute"
      left="20%"
      top="20%"
      width={width}
      height={height}
      border={true}
      borderStyle="single"
      borderColor={theme.borderFocus}
      backgroundColor={theme.surface}
      flexDirection="column"
      padding={1}
      title={` ${title} `}
    >
      <box flexDirection="column" flexGrow={1}>
        {children}
      </box>
    </box>
  )
}
