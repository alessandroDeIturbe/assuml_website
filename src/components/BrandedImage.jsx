'use client'

/**
 * Wrapper client per immagini con fallback onError.
 * Necessario perché onError è un event handler e non può stare in Server Components.
 */
export default function BrandedImage({ src, alt, className = '', fallbackHide = true, style = {} }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={e => { if (fallbackHide) e.currentTarget.style.display = 'none' }}
    />
  )
}
