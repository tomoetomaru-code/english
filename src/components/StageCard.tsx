import './StageCard.css'

interface StageCardProps {
  stageNumber: 1 | 2 | 3
  title: string
  subtitle: string
  emoji: string
  onClick: () => void
  locked?: boolean
}

const STAGE_COLORS: Record<number, string> = {
  1: 'var(--color-stage1)',
  2: 'var(--color-stage2)',
  3: 'var(--color-stage3)',
}

/**
 * ホーム画面に並ぶ各ステージ選択カード
 */
export default function StageCard({
  stageNumber,
  title,
  subtitle,
  emoji,
  onClick,
  locked = false,
}: StageCardProps) {
  return (
    <button
      className={['stage-card', locked ? 'stage-card--locked' : ''].join(' ')}
      style={{ '--stage-color': STAGE_COLORS[stageNumber] } as React.CSSProperties}
      onClick={locked ? undefined : onClick}
      disabled={locked}
      aria-label={`Stage ${stageNumber}: ${title}${locked ? '（ロック中）' : ''}`}
    >
      <div className="stage-card__badge">Stage {stageNumber}</div>
      <span className="stage-card__emoji" aria-hidden="true">{emoji}</span>
      <h2 className="stage-card__title">{title}</h2>
      <p className="stage-card__subtitle">{subtitle}</p>
      {locked && <div className="stage-card__lock" aria-hidden="true">🔒</div>}
    </button>
  )
}
