import { useState } from 'react'
import HomeScreen from './stages/HomeScreen'
import Stage1Word from './stages/Stage1Word'
import Stage2Listen from './stages/Stage2Listen'
import Stage3Talk from './stages/Stage3Talk'

const STORAGE_KEY = 'mofumofu-v2'

interface Progress {
  totalStars: number
  cleared: {
    word: number[]
    listen: number[]
    talk: number[]
  }
}

function loadProgress(): Progress {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return { totalStars: 0, cleared: { word: [], listen: [], talk: [] } }
}

function saveProgress(p: Progress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch {}
}

type ActiveStage = { type: 1 | 2 | 3; level: number } | null

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [stage, setStage] = useState<ActiveStage>(null)

  const handleSelectStage = (type: 1 | 2 | 3, level: number) => {
    setStage({ type, level })
  }

  const handleAddStar = () => {
    setProgress(prev => {
      const next = { ...prev, totalStars: prev.totalStars + 1 }
      saveProgress(next)
      return next
    })
  }

  const handleClearLevel = (type: 1 | 2 | 3, level: number) => {
    setProgress(prev => {
      const key = type === 1 ? 'word' : type === 2 ? 'listen' : 'talk'
      if (prev.cleared[key].includes(level)) return prev
      const next = {
        ...prev,
        cleared: { ...prev.cleared, [key]: [...prev.cleared[key], level] }
      }
      saveProgress(next)
      return next
    })
  }

  const goHome = () => setStage(null)

  if (stage === null) {
    return (
      <HomeScreen
        totalStars={progress.totalStars}
        cleared={progress.cleared}
        onSelectStage={handleSelectStage}
      />
    )
  }
  if (stage.type === 1) {
    return (
      <Stage1Word
        level={stage.level}
        onAddStar={handleAddStar}
        onClearLevel={() => handleClearLevel(1, stage.level)}
        onBack={goHome}
      />
    )
  }
  if (stage.type === 2) {
    return (
      <Stage2Listen
        level={stage.level}
        onAddStar={handleAddStar}
        onClearLevel={() => handleClearLevel(2, stage.level)}
        onBack={goHome}
      />
    )
  }
  return (
    <Stage3Talk
      level={stage.level}
      onAddStar={handleAddStar}
      onClearLevel={() => handleClearLevel(3, stage.level)}
      onBack={goHome}
    />
  )
}
