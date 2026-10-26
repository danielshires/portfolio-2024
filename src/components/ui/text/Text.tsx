import React from 'react'
import type { TextVariant, TextSize, TextWeight, TextColor, TextAlign } from './styles'
import { variantElements, combineStyles } from './styles'

interface Props {
  variant?: TextVariant
  size?: TextSize
  weight?: TextWeight
  color?: TextColor
  align?: TextAlign
  className?: string
  children: React.ReactNode
}

export default function Text({
  variant = 'body',
  size,
  weight,
  color = 'default',
  align = 'left',
  className = '',
  children,
  ...rest
}: Props) {
  const Element = variantElements[variant]
  const combinedClassName = combineStyles(variant, color, align, size, weight, className)

  return (
    <Element className={combinedClassName} {...rest}>
      {children}
    </Element>
  )
}
