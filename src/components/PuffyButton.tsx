import { ButtonHTMLAttributes, ReactNode } from 'react'
import './PuffyButton.css'

type Variant = 'primary' | 'coral' | 'honey' | 'ghost'

interface PuffyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

/**
 * ぷっくりボタン — 押すと沈み込む3Dアニメーション付きボタン
 */
export default function PuffyButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: PuffyButtonProps) {
  return (
    <button
      className={[
        'puffy-btn',
        `puffy-btn--${variant}`,
        `puffy-btn--${size}`,
        fullWidth ? 'puffy-btn--full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span className="puffy-btn__inner">{children}</span>
    </button>
  )
}
