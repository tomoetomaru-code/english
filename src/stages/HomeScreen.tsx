import Character from '../components/Character'
import StageCard from '../components/StageCard'
import StarGauge from '../components/StarGauge'
import './HomeScreen.css'

interface HomeScreenProps {
  totalStars: number
  onSelectStage: (stage: 1 | 2 | 3) => void
}

/**
 * ホーム画面 — タイトル・キャラクター・ステージ選択カード
 */
export default function HomeScreen({ totalStars, onSelectStage }: HomeScreenProps) {
  return (
    <div className="home">
      {/* ヘッダー */}
      <header className="home__header">
        <h1 className="home__title">
          <span className="home__title-en">Mofumofu</span>
          <span className="home__title-ja">もふもふ英語フレンズ</span>
        </h1>
        <div className="home__stars">
          <span className="home__stars-label">ごうけい ⭐</span>
          <StarGauge stars={Math.min(totalStars, 5)} maxStars={5} />
        </div>
      </header>

      {/* キャラクター */}
      <section className="home__characters" aria-label="キャラクター">
        <Character type="rabi" mood="cheer" message="いっしょにえいごをまなぼう！" size="md" />
        <Character type="shiba" mood="happy" size="md" />
      </section>

      {/* ステージ選択 */}
      <section className="home__stages" aria-label="ステージを選ぼう">
        <h2 className="home__stages-title">ステージを えらぼう！</h2>
        <div className="home__stage-grid">
          <StageCard
            stageNumber={1}
            title="Word"
            subtitle="えいたんごクイズ🎵&#10;音を聴いて正しい答えを選ぼう"
            emoji="📖"
            onClick={() => onSelectStage(1)}
          />
          <StageCard
            stageNumber={2}
            title="Listen"
            subtitle="ならべかえ問題🧩&#10;ことばをならべて文をつくろう"
            emoji="🎧"
            onClick={() => onSelectStage(2)}
          />
          <StageCard
            stageNumber={3}
            title="Talk"
            subtitle="ロールプレイ🎤&#10;マイクに向かって話しかけよう"
            emoji="💬"
            onClick={() => onSelectStage(3)}
          />
        </div>
      </section>

      {/* フッター */}
      <footer className="home__footer">
        <p>© 2024 もふもふ英語フレンズ</p>
      </footer>
    </div>
  )
}
