import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  isFullWidth?: boolean
}

function variantClasses(variant: ButtonVariant) {
  if (variant === 'secondary') return 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
  if (variant === 'ghost') return 'bg-transparent text-gray-900 hover:bg-gray-50'
  return 'bg-gray-900 text-white hover:bg-black'
}

function sizeClasses(size: ButtonSize) {
  if (size === 'sm') return 'px-3 py-1.5 text-sm'
  if (size === 'lg') return 'px-5 py-3 text-base'
  return 'px-4 py-2 text-sm'
}

function Button({ children, variant = 'primary', size = 'md', isFullWidth, className, disabled, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
  const width = isFullWidth ? 'w-full' : ''
  const cls = [base, variantClasses(variant), sizeClasses(size), width, className].filter(Boolean).join(' ')
  return (
    <button className={cls} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}

export default Button


