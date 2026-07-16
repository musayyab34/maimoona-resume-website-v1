import { Fragment } from 'react'

/**
 * Renders chemical formulae with real subscripts: "KSnX_3" → KSnX₃.
 * Digits after an underscore become <sub> elements.
 */
export function Formula({ f, className }: { f: string; className?: string }) {
  const parts = f.split(/(_[0-9]+)/g)
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith('_') ? (
          <sub key={i}>{part.slice(1)}</sub>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  )
}
