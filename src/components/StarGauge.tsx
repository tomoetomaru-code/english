import './StarGauge.css'

interface StarGaugeProps {
  stars: number     // 現在の星数
  maxStars?: number // 最大星数（デフォルト5）
}

/**
 * 星のゲージ — 正解するごとに星が光っていく達成感UI
 */
export default function StarGauge({ stars, maxStars = 5 }: StarGaugeProps) {
  return (
    <div className="star-gauge" aria-label={`${stars}/${maxStars}こ せいかい`}>
      {Array.from({ length: maxStars }, (_, i) => (
        <span
          key={i}
          className={['star-gauge__star', i < stars ? 'star-gauge__star--filled' : ''].join(' ')}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  )
}
