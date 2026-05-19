import Character from '../components/Character'
import './HomeScreen.css'

interface HomeScreenProps {
  totalStars: number
  cleared: { word: number[]; listen: number[]; talk: number[] }
  onSelectStage: (type: 1 | 2 | 3, level: number) => void
}

const STAGE_CONFIG = [
  { type: 1 as const, key: 'word'   as const, emoji: '📖', title: 'Word',   subtitle: 'えいたんごクイズ🎵', colorKey: 'stage1', maxLevels: 3 },
  { type: 2 as const, key: 'listen' as const, emoji: '🎧', title: 'Listen', subtitle: 'ならべかえ問題🧩',   colorKey: 'stage2', maxLevels: 4 },
  { type: 3 as const, key: 'talk'   as const, emoji: '💬', title: 'Talk',   subtitle: 'ロールプレイ🎤',     colorKey: 'stage3', maxLevels: 4 },
]

export default function HomeScreen({ totalStars, cleared, onSelectStage }: HomeScreenProps) {
  const isUnlocked = (key: 'word' | 'listen' | 'talk', level: number) =>
    level === 1 || cleared[key].includes(level - 1)

  const isCleared = (key: 'word' | 'listen' | 'talk', level: number) =>
    cleared[key].includes(level)

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__title">
          <span className="home__title-en">Mofumofu</span>
          <span className="home__title-ja">もふもふ英語フレンズ</span>
        </h1>
        <div className="home__stars">
          <span className="home__stars-label">ごうけい ⭐</span>
          <span className="home__stars-count">{totalStars}</span>
        </div>
      </header>

      <section className="home__characters" aria-label="キャラクター">
        <Character type="rabi" mood="cheer" size="lg" />
      </section>

      <section className="home__stages" aria-label="ステージを選ぼう">
        <h2 className="home__stages-title">ステージを えらぼう！</h2>
        <div className="home__stage-grid">
          {STAGE_CONFIG.map(({ type, key, emoji, title, subtitle, colorKey, maxLevels }) => (
            <div key={type} className={`home__stage-card home__stage-card--${colorKey}`}>
              <div className="home__stage-header">
                <span className="home__stage-emoji">{emoji}</span>
                <div>
                  <p className="home__stage-title">{title}</p>
                  <p className="home__stage-subtitle">{subtitle}</p>
                </div>
              </div>
              <div className={`home__level-row${maxLevels === 4 ? ' home__level-row--4' : ''}`}>
                {Array.from({ length: maxLevels }, (_, i) => {
                  const lv = i + 1
                  const unlocked = isUnlocked(key, lv)
                  const done = isCleared(key, lv)
                  return (
                    <button
                      key={lv}
                      className={[
                        'home__level-btn',
                        done ? 'home__level-btn--done' : '',
                        !unlocked ? 'home__level-btn--locked' : '',
                      ].join(' ')}
                      onClick={() => unlocked && onSelectStage(type, lv)}
                      disabled={!unlocked}
                      aria-label={`${title} レベル${lv}`}
                    >
                      <span className="home__level-icon">
                        {done ? '⭐' : !unlocked ? '🔒' : '▶'}
                      </span>
                      <span className="home__level-label">Lv.{lv}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="home__footer">
        <p>© 2024 もふもふ英語フレンズ</p>
      </footer>
    </div>
  )
}
