import { useState, useEffect, useCallback, useRef } from 'react'
import Character from '../components/Character'
import PuffyButton from '../components/PuffyButton'
import StarGauge from '../components/StarGauge'
import { useSpeech, isIOSDevice } from '../hooks/useSpeech'
import { useSheetData } from '../hooks/useSheetData'
import './Stage2Listen.css'

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSBmK15QD8nc0XpAVAzR3d5-YXr6UfDnEG-hsg4KSoNNszvFHGzzZVglo1lKmzzIrlSlNQmDBjyMs55/pub?gid=360174079&single=true&output=csv'

const SAMPLE_SENTENCES = [
  { sentence: 'I like apples.',             ja: 'わたしはりんごが好きです。',          words: ['I','like','apples.'],                        dummies: ['eat','he'] },
  { sentence: 'I have a dog.',              ja: 'わたしはいぬを飼っています。',         words: ['I','have','a','dog.'],                       dummies: ['cat','she'] },
  { sentence: 'She has a cute cat.',        ja: '彼女はかわいいねこを飼っています。',   words: ['She','has','a','cute','cat.'],               dummies: ['dog','his'] },
  { sentence: 'We go to school.',           ja: 'わたしたちは学校に行きます。',         words: ['We','go','to','school.'],                   dummies: ['run','park'] },
  { sentence: 'I can swim well.',           ja: 'わたしは上手に泳げます。',             words: ['I','can','swim','well.'],                   dummies: ['run','she'] },
  { sentence: 'I can play soccer.',         ja: 'わたしはサッカーができます。',         words: ['I','can','play','soccer.'],                 dummies: ['run','tennis'] },
  { sentence: 'I want to eat pizza.',       ja: 'わたしはピザが食べたいです。',         words: ['I','want','to','eat','pizza.'],             dummies: ['drink','bread'] },
  { sentence: 'I like music.',              ja: 'わたしは音楽が好きです。',             words: ['I','like','music.'],                        dummies: ['hate','art'] },
  { sentence: 'This is my bag.',            ja: 'これはわたしのかばんです。',           words: ['This','is','my','bag.'],                   dummies: ['her','pen'] },
  { sentence: 'That is a big dog.',         ja: 'あれはおおきないぬです。',             words: ['That','is','a','big','dog.'],               dummies: ['small','cat'] },
  { sentence: 'I am twelve years old.',     ja: 'わたしは12歳です。',                  words: ['I','am','twelve','years','old.'],           dummies: ['ten','she'] },
  { sentence: 'My birthday is in April.',   ja: 'わたしの誕生日は4月です。',           words: ['My','birthday','is','in','April.'],         dummies: ['May','June'] },
  { sentence: 'I study math every day.',    ja: 'わたしは毎日算数を勉強します。',       words: ['I','study','math','every','day.'],          dummies: ['science','she'] },
  { sentence: 'Do you like sports?',        ja: 'あなたはスポーツが好きですか？',       words: ['Do','you','like','sports?'],                dummies: ['does','he'] },
  { sentence: 'Yes I do.',                  ja: 'はい、好きです。',                    words: ['Yes','I','do.'],                           dummies: ['No','she'] },
  { sentence: 'No I do not.',               ja: 'いいえ、好きではありません。',         words: ['No','I','do','not.'],                       dummies: ['Yes','she'] },
  { sentence: 'What is your name?',         ja: 'あなたの名前は何ですか？',             words: ['What','is','your','name?'],                 dummies: ['Where','how'] },
  { sentence: 'My name is Taro.',           ja: 'わたしの名前は太郎です。',             words: ['My','name','is','Taro.'],                  dummies: ['Her','your'] },
  { sentence: 'Where do you live?',         ja: 'あなたはどこに住んでいますか？',       words: ['Where','do','you','live?'],                 dummies: ['What','he'] },
  { sentence: 'I live in Tokyo.',           ja: 'わたしは東京に住んでいます。',         words: ['I','live','in','Tokyo.'],                  dummies: ['go','she'] },
  { sentence: 'I wake up at seven.',        ja: 'わたしは7時に起きます。',             words: ['I','wake','up','at','seven.'],              dummies: ['sleep','six'] },
  { sentence: 'I eat breakfast every morning.', ja: 'わたしは毎朝朝ごはんを食べます。', words: ['I','eat','breakfast','every','morning.'],  dummies: ['lunch','she'] },
  { sentence: 'Turn right at the corner.',  ja: 'かどを右に曲がってください。',         words: ['Turn','right','at','the','corner.'],       dummies: ['left','go'] },
  { sentence: 'Go straight for two blocks.',ja: '2ブロックまっすぐ進んでください。',   words: ['Go','straight','for','two','blocks.'],     dummies: ['right','three'] },
  { sentence: 'How is the weather today?',  ja: '今日の天気はどうですか？',             words: ['How','is','the','weather','today?'],       dummies: ['What','tomorrow'] },
  { sentence: 'It is sunny today.',         ja: '今日は晴れです。',                    words: ['It','is','sunny','today.'],                dummies: ['rainy','cloudy'] },
  { sentence: 'I want to be a doctor.',     ja: 'わたしはお医者さんになりたいです。',   words: ['I','want','to','be','a','doctor.'],         dummies: ['teacher','she'] },
  { sentence: 'She is a kind teacher.',     ja: '彼女はやさしい先生です。',             words: ['She','is','a','kind','teacher.'],           dummies: ['doctor','he'] },
  { sentence: 'We have math on Monday.',    ja: '月曜日に算数があります。',             words: ['We','have','math','on','Monday.'],          dummies: ['science','Friday'] },
  { sentence: 'Let us play together.',      ja: 'いっしょに遊びましょう。',             words: ['Let','us','play','together.'],              dummies: ['eat','she'] },
]

const QUESTIONS_PER_ROUND = 5

interface SentenceItem {
  sentence: string
  ja: string
  words: string[]
  dummies: string[]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function getLevelPool<T>(pool: T[], level: number, maxLevels = 3): T[] {
  const size = Math.ceil(pool.length / maxLevels)
  const start = (level - 1) * size
  return pool.slice(start, start + size)
}

interface Stage2ListenProps {
  level: number
  onAddStar: () => void
  onClearLevel: () => void
  onBack: () => void
}

export default function Stage2Listen({ level, onAddStar, onClearLevel, onBack }: Stage2ListenProps) {
  const { speak } = useSpeech()
  const { rows } = useSheetData(SHEET_CSV_URL)

  const initialized = useRef(false)
  const [questions, setQuestions] = useState<SentenceItem[]>([])
  const [index, setIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const [bank, setBank] = useState<string[]>([])
  const [answer, setAnswer] = useState<string[]>([])
  const [checked, setChecked] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [finished, setFinished] = useState(false)
  const [awaitingTap, setAwaitingTap] = useState(false)

  useEffect(() => {
    if (initialized.current) return
    if (rows.length >= 10) {
      const pool = rows.map((r) => {
        const words = (r[3] ?? '').split(' ').filter(Boolean)
        const dummies = (r[4] ?? '').split(' ').filter(Boolean)
        return { sentence: r[1] ?? '', ja: r[2] ?? '', words, dummies }
      })
      setQuestions(shuffle(getLevelPool(pool, level)).slice(0, QUESTIONS_PER_ROUND))
      setIndex(0)
      initialized.current = true
    } else {
      setQuestions(shuffle(getLevelPool(SAMPLE_SENTENCES, level)).slice(0, QUESTIONS_PER_ROUND))
      setIndex(0)
      initialized.current = true
    }
  }, [rows, level])

  const current = questions[index]

  useEffect(() => {
    if (current) {
      setBank(shuffle([...current.words, ...current.dummies]))
      setAnswer([])
      setChecked('idle')
    }
  }, [index, current])

  const handleSpeak = useCallback(() => {
    if (current) {
      setAwaitingTap(false)
      speak(current.sentence)
    }
  }, [current, speak])

  const handleSpeakSlow = useCallback(() => {
    if (current) {
      setAwaitingTap(false)
      speak(current.sentence, 'en-US', 0.5)
    }
  }, [current, speak])

  useEffect(() => {
    if (!current) return
    if (isIOSDevice()) {
      setAwaitingTap(true)
      return
    }
    setAwaitingTap(false)
    const t = setTimeout(() => speak(current.sentence), 500)
    return () => clearTimeout(t)
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectWord = (word: string, idx: number) => {
    if (checked !== 'idle') return
    setAnswer((a) => [...a, word])
    setBank((b) => b.filter((_, i) => i !== idx))
  }

  const removeWord = (idx: number) => {
    if (checked !== 'idle') return
    const word = answer[idx]
    setAnswer((a) => a.filter((_, i) => i !== idx))
    setBank((b) => [...b, word])
  }

  const checkAnswer = () => {
    if (!current || answer.length === 0) return
    if (answer.join(' ') === current.sentence) {
      setChecked('correct')
      setStars((s) => s + 1)
      onAddStar()
      setTimeout(() => {
        if (index + 1 >= questions.length) {
          onClearLevel()
          setFinished(true)
        } else {
          setIndex((i) => i + 1)
        }
      }, 1300)
    } else {
      setChecked('wrong')
      setTimeout(() => {
        setBank(shuffle([...current.words, ...current.dummies]))
        setAnswer([])
        setChecked('idle')
      }, 1000)
    }
  }

  if (!current && !finished) {
    return <div className="stage2 stage2--loading"><p>データを読み込み中…</p></div>
  }

  if (finished) {
    return (
      <div className="stage2 stage2--finish">
        <Character type="shiba" mood="happy" message={`Lv.${level} クリア！\n${stars}こ ゲット！`} size="lg" />
        <h2>よくできました！</h2>
        <PuffyButton variant="primary" size="lg" onClick={onBack}>ホームへもどる</PuffyButton>
      </div>
    )
  }

  return (
    <div className="stage2">
      <div className="stage2__header">
        <PuffyButton variant="ghost" size="sm" onClick={onBack}>← もどる</PuffyButton>
        <StarGauge stars={stars} maxStars={QUESTIONS_PER_ROUND} />
        <span className="stage2__progress">{index + 1} / {questions.length}</span>
      </div>
      <div className="stage2__level-badge">Listen — Lv.{level}</div>
      <Character type="shiba" mood="cheer" size="sm" />
      <div className={['stage2__card', checked !== 'idle' ? `stage2__card--${checked}` : ''].join(' ')}>
        <p className="stage2__instruction">英語を聴いて、ことばを正しい順番にならべよう！</p>
        <p className="stage2__ja">{current.ja}</p>
        <div className="stage2__speak-row">
          <PuffyButton variant="honey" onClick={handleSpeak}>
            {awaitingTap ? 'おして聴こう！' : 'もう一度 聴く'}
          </PuffyButton>
          <PuffyButton variant="honey" onClick={handleSpeakSlow}>
            ゆっくり
          </PuffyButton>
        </div>
        {checked !== 'idle' && (
          <p className={`stage2__result stage2__result--${checked}`}>
            {checked === 'correct' ? 'せいかい！' : 'もう一度ならべよう！'}
          </p>
        )}
      </div>
      <div className="stage2__answer-area" aria-label="ならべた答え">
        {answer.length === 0
          ? <p className="stage2__placeholder">ここにことばをならべてね</p>
          : answer.map((w, i) => (
            <button key={`${w}-${i}`} className="stage2__word-chip stage2__word-chip--selected" onClick={() => removeWord(i)}>{w}</button>
          ))
        }
      </div>
      <div className="stage2__bank" aria-label="選択肢">
        {bank.map((w, i) => (
          <button key={`${w}-${i}`} className="stage2__word-chip" onClick={() => selectWord(w, i)}>{w}</button>
        ))}
      </div>
      <PuffyButton variant="coral" size="lg" onClick={checkAnswer} disabled={answer.length === 0 || checked !== 'idle'}>
        こたえあわせ！
      </PuffyButton>
    </div>
  )
}
