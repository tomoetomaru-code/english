import './Character.css'

type CharacterType = 'rabi' | 'shiba'
type CharacterMood = 'normal' | 'happy' | 'cheer' | 'think'

interface CharacterProps {
  type?: CharacterType
  mood?: CharacterMood
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const CHARACTER_EMOJI: Record<CharacterType, Record<CharacterMood, string>> = {
  rabi: {
    normal: '🐰',
    happy:  '🐰',
    cheer:  '🐰',
    think:  '🐰',
  },
  shiba: {
    normal: '🐕',
    happy:  '🐕',
    cheer:  '🐕',
    think:  '🐕',
  },
}


const CHARACTER_NAME: Record<CharacterType, string> = {
  rabi:  'ラビ',
  shiba: 'しば',
}

/**
 * もふもふフレンズキャラクター — ラビ（ウサギ）としば（柴犬）
 * CSSアニメーションで耳ピコピコ・尻尾ブンブンを表現
 */
export default function Character({
  type = 'rabi',
  mood = 'normal',
  message,
  size = 'md',
}: CharacterProps) {
  const emoji = CHARACTER_EMOJI[type][mood]
  const name  = CHARACTER_NAME[type]

  return (
    <div className={`character character--${type} character--${mood} character--${size}`}>
      {/* キャラクター本体 */}
      <div className="character__body" aria-hidden="true">
        <span className="character__emoji">{emoji}</span>
        {/* 耳 or 尻尾アクセント */}
        {type === 'rabi' && (
          <span className="character__accent character__ear">👂</span>
        )}
        {type === 'shiba' && (
          <span className="character__accent character__tail">〰️</span>
        )}
        {/* 顔文字は非表示 */}
      </div>

      {/* 吹き出し */}
      {message && (
        <div className="character__bubble" role="status" aria-live="polite">
          <span className="character__bubble-name">{name}より</span>
          <p className="character__bubble-text">{message}</p>
        </div>
      )}
    </div>
  )
}
