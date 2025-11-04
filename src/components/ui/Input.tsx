import type { InputHTMLAttributes, ReactNode } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
  error?: ReactNode
  helperText?: ReactNode
}

function Input({ label, error, helperText, id, className, ...rest }: InputProps) {
  const inputId = id ?? rest.name ?? undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm text-gray-700">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={[
          'rounded-md border text-sm px-3 py-2 outline-none',
          error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200',
          className,
        ].filter(Boolean).join(' ')}
        {...rest}
      />
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-gray-500">{helperText}</span>
      ) : null}
    </div>
  )
}

export default Input


