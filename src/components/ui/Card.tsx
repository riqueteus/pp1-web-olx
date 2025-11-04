import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  onClick?: () => void
  className?: string
}

function Card({ header, footer, children, onClick, className }: CardProps) {
  return (
    <article
      onClick={onClick}
      className={[
        'border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm',
        className,
      ].filter(Boolean).join(' ')}
    >
      {header ? (
        <div className="px-4 py-3 border-b border-gray-100">
          {header}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
      {footer ? (
        <div className="px-4 py-3 border-t border-gray-100">
          {footer}
        </div>
      ) : null}
    </article>
  )
}

export default Card


