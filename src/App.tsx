import { useState } from 'react'
import HomeScreen from './stages/HomeScreen'
import Stage1Word from './stages/Stage1Word'
import Stage2Listen from './stages/Stage2Listen'
import Stage3Talk from './stages/Stage3Talk'

type Screen = 'home' | 'stage1' | 'stage2' | 'stage3'

/**
 * App — 画面遷移の管理
 * React Router は不要。useState だけでシンプルに制御。
 */
export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [totalStars, setTotalStars] = useState(0)

  const addStar = () => setTotalStars((s) => s + 1)
  const goHome = () => setScreen('home')

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          totalStars={totalStars}
          onSelectStage={(stage) => setScreen(`stage${stage}` as Screen)}
        />
      )}
      {screen === 'stage1' && (
        <Stage1Word onAddStar={addStar} onBack={goHome} />
      )}
      {screen === 'stage2' && (
        <Stage2Listen onAddStar={addStar} onBack={goHome} />
      )}
      {screen === 'stage3' && (
        <Stage3Talk onAddStar={addStar} onBack={goHome} />
      )}
    </>
  )
}
