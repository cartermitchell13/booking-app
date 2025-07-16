import React from 'react'
import { useTenantBranding } from '@/lib/tenant-context'
import { cn } from '@/lib/utils'

interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  children: React.ReactNode
  style?: React.CSSProperties
}

export function Heading({ 
  as: Component = 'h1', 
  className, 
  children, 
  style,
  ...props 
}: HeadingProps) {
  const branding = useTenantBranding()
  
  const baseClasses = {
    h1: 'text-3xl',
    h2: 'text-2xl', 
    h3: 'text-xl',
    h4: 'text-lg',
    h5: 'text-base',
    h6: 'text-sm'
  }
  
  const combinedStyle = {
    fontFamily: 'var(--tenant-font, Inter)',
    ...style
  }
  
  return (
    <Component 
      className={cn(
        baseClasses[Component], 
        branding.headingWeightClass, 
        className
      )}
      style={combinedStyle}
      {...props}
    >
      {children}
    </Component>
  )
} 