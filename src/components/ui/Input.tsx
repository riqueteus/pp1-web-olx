import type { InputHTMLAttributes, ReactNode } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
  error?: ReactNode
  helperText?: ReactNode
  showPasswordToggle?: boolean
  onTogglePassword?: () => void
}

function Input({ 
  label, 
  error, 
  helperText, 
  id, 
  className, 
  type,
  showPasswordToggle,
  onTogglePassword,
  ...rest 
}: InputProps) {
  const inputId = id ?? rest.name ?? undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm text-gray-700">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          type={type}
          className={[
            'w-full rounded-md border text-sm px-3 py-2 outline-none pr-10',
            error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200',
            className,
          ].filter(Boolean).join(' ')}

          {...rest}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            onClick={onTogglePassword}
            tabIndex={-1} // Prevent focusing on the button when tabbing
          >
            {type === 'password' ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-gray-500">{helperText}</span>
      ) : null}
    </div>
  )
}

export default Input


