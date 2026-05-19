import { useState, useEffect, useCallback, useRef } from 'react'
import Character from '../components/Character'
import PuffyButton from '../components/PuffyButton'
import StarGauge from '../components/StarGauge'
import { useSpeech } from '../hooks/useSpeech'
import { useSheetData } from '../hooks/useSheetData'
import './Stage1Word.css'

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSBmK15QD8nc0XpAVAzR3d5-YXr6UfDnEG-hsg4KSoNNszvFHGzzZVglo1lKmzzIrlSlNQmDBjyMs55/pub?gid=0&single=true&output=csv'

const SAMPLE_WORDS = [
  { word: 'cat',        ja: 'ねこ',         choices: ['cat', 'dog', 'bird'],          img: '' },
  { word: 'dog',        ja: 'いぬ',         choices: ['dog', 'fish', 'rabbit'],       img: '' },
  { word: 'bird',       ja: 'とり',         choices: ['bird', 'cat', 'horse'],        img: '' },
  { word: 'fish',       ja: 'さかな',       choices: ['fish', 'frog', 'dog'],         img: '' },
  { word: 'rabbit',     ja: 'うさぎ',       choices: ['rabbit', 'bear', 'fox'],       img: '' },
  { word: 'elephant',   ja: 'ぞう',         choices: ['elephant', 'lion', 'tiger'],   img: '' },
  { word: 'lion',       ja: 'ライオン',     choices: ['lion', 'wolf', 'elephant'],    img: '' },
  { word: 'monkey',     ja: 'さる',         choices: ['monkey', 'panda', 'koala'],    img: '' },
  { word: 'panda',      ja: 'パンダ',       choices: ['panda', 'monkey', 'bear'],     img: '' },
  { word: 'horse',      ja: 'うま',         choices: ['horse', 'cow', 'pig'],         img: '' },
  { word: 'apple',      ja: 'りんご',       choices: ['apple', 'orange', 'grape'],    img: '' },
  { word: 'banana',     ja: 'バナナ',       choices: ['banana', 'melon', 'lemon'],    img: '' },
  { word: 'orange',     ja: 'オレンジ',     choices: ['orange', 'apple', 'peach'],    img: '' },
  { word: 'grape',      ja: 'ぶどう',       choices: ['grape', 'cherry', 'melon'],    img: '' },
  { word: 'strawberry', ja: 'いちご',       choices: ['strawberry', 'peach', 'plum'], img: '' },
  { word: 'rice',       ja: 'ごはん',       choices: ['rice', 'bread', 'soup'],       img: '' },
  { word: 'bread',      ja: 'パン',         choices: ['bread', 'cake', 'rice'],       img: '' },
  { word: 'cake',       ja: 'ケーキ',       choices: ['cake', 'pie', 'bread'],        img: '' },
  { word: 'pizza',      ja: 'ピザ',         choices: ['pizza', 'pasta', 'soup'],      img: '' },
  { word: 'salad',      ja: 'サラダ',       choices: ['salad', 'pizza', 'rice'],      img: '' },
  { word: 'red',        ja: 'あか',         choices: ['red', 'blue', 'green'],        img: '' },
  { word: 'blue',       ja: 'あお',         choices: ['blue', 'red', 'yellow'],       img: '' },
  { word: 'green',      ja: 'みどり',       choices: ['green', 'pink', 'blue'],       img: '' },
  { word: 'yellow',     ja: 'きいろ',       choices: ['yellow', 'orange', 'white'],   img: '' },
  { word: 'pink',       ja: 'ピンク',       choices: ['pink', 'purple', 'red'],       img: '' },
  { word: 'white',      ja: 'しろ',         choices: ['white', 'black', 'gray'],      img: '' },
  { word: 'black',      ja: 'くろ',         choices: ['black', 'white', 'brown'],     img: '' },
  { word: 'brown',      ja: 'ちゃいろ',     choices: ['brown', 'orange', 'black'],    img: '' },
  { word: 'one',        ja: '1',            choices: ['one', 'two', 'three'],         img: '' },
  { word: 'two',        ja: '2',            choices: ['two', 'four', 'six'],          img: '' },
  { word: 'three',      ja: '3',            choices: ['three', 'five', 'seven'],      img: '' },
  { word: 'ten',        ja: '10',           choices: ['ten', 'eight', 'nine'],        img: '' },
  { word: 'twenty',     ja: '20',           choices: ['twenty', 'twelve', 'thirty'],  img: '' },
  { word: 'school',     ja: 'がっこう',     choices: ['school', 'park', 'hospital'],  img: '' },
  { word: 'park',       ja: 'こうえん',     choices: ['park', 'store', 'school'],     img: '' },
  { word: 'library',    ja: 'としょかん',   choices: ['library', 'museum', 'park'],   img: '' },
  { word: 'hospital',   ja: 'びょういん',   choices: ['hospital', 'school', 'store'], img: '' },
  { word: 'station',    ja: 'えき',         choices: ['station', 'airport', 'port'],  img: '' },
  { word: 'restaurant', ja: 'レストラン',   choices: ['restaurant', 'hotel', 'cafe'], img: '' },
  { word: 'morning',    ja: 'あさ',         choices: ['morning', 'noon', 'night'],    img: '' },
  { word: 'night',      ja: 'よる',         choices: ['night', 'morning', 'evening'], img: '' },
  { word: 'today',      ja: 'きょう',       choices: ['today', 'tomorrow', 'yesterday'], img: '' },
  { word: 'tomorrow',   ja: 'あした',       choices: ['tomorrow', 'today', 'yesterday'], img: '' },
  { word: 'birthday',   ja: 'たんじょうび', choices: ['birthday', 'holiday', 'weekend'], img: '' },
  { word: 'Monday',     ja: 'げつようび',   choices: ['Monday', 'Tuesday', 'Sunday'],  img: '' },
  { word: 'Friday',     ja: 'きんようび',   choices: ['Friday', 'Saturday', 'Thursday'], img: '' },
  { word: 'Sunday',     ja: 'にちようび',   choices: ['Sunday', 'Monday', 'Saturday'], img: '' },
  { word: 'math',       ja: 'さんすう',     choices: ['math', 'science', 'music'],    img: '' },
  { word: 'science',    ja: 'りか',         choices: ['science', 'math', 'art'],      img: '' },
  { word: 'music',      ja: 'おんがく',     choices: ['music', 'art', 'P.E.'],        img: '' },
  { word: 'art',        ja: 'ずこう',       choices: ['art', 'music', 'math'],        img: '' },
  { word: 'soccer',     ja: 'サッカー',     choices: ['soccer', 'tennis', 'baseball'], img: '' },
  { word: 'baseball',   ja: 'やきゅう',     choices: ['baseball', 'soccer', 'swimming'], img: '' },
  { word: 'swimming',   ja: 'すいえい',     choices: ['swimming', 'running', 'soccer'], img: '' },
  { word: 'tennis',     ja: 'テニス',       choices: ['tennis', 'golf', 'soccer'],    img: '' },
  { word: 'bus',        ja: 'バス',         choices: ['bus', 'train', 'car'],         img: '' },
  { word: 'train',      ja: 'でんしゃ',     choices: ['train', 'bus', 'subway'],      img: '' },
  { word: 'airplane',   ja: 'ひこうき',     choices: ['airplane', 'ship', 'rocket'],  img: '' },
  { word: 'spring',     ja: 'はる',         choices: ['spring', 'summer', 'winter'],  img: '' },
  { word: 'summer',     ja: 'なつ',         choices: ['summer', 'fall', 'spring'],    img: '' },
  { word: 'winter',     ja: 'ふゆ',         choices: ['winter', 'spring', 'autumn'],  img: '' },
  { word: 'eye',        ja: 'め',           choices: ['eye', 'ear', 'nose'],          img: '' },
  { word: 'ear',        ja: 'みみ',         choices: ['ear', 'mouth', 'eye'],         img: '' },
  { word: 'hand',       ja: 'て',           choices: ['hand', 'foot', 'arm'],         img: '' },
  { word: 'teacher',    ja: 'せんせい',     choices: ['teacher', 'doctor', 'chef'],   img: '' },
  { word: 'doctor',     ja: 'おいしゃさん', choices: ['doctor', 'nurse', 'teacher'],  img: '' },
  { word: 'chef',       ja: 'コック',       choices: ['chef', 'baker', 'doctor'],     img: '' },
  { word: 'farmer',     ja: 'のうか',       choices: ['farmer', 'fisher', 'chef'],    img: '' },
  { word: 'big',        ja: 'おおきい',     choices: ['big', 'small', 'tall'],        img: '' },
  { word: 'small',      ja: 'ちいさい',     choices: ['small', 'big', 'short'],       img: '' },
  { word: 'hot',        ja: 'あつい',       choices: ['hot', 'cold', 'warm'],         img: '' },
  { word: 'cold',       ja: 'つめたい',     choices: ['cold', 'hot', 'cool'],         img: '' },
  { word: 'happy',      ja: 'うれしい',     choices: ['happy', 'sad', 'angry'],       img: '' },
  { word: 'hungry',     ja: 'おなかがすいた', choices: ['hungry', 'tired', 'sleepy'], img: '' },
  { word: 'hello',      ja: 'こんにちは',   choices: ['hello', 'goodbye', 'thanks'],  img: '' },
  { word: 'goodbye',    ja: 'さようなら',   choices: ['goodbye', 'hello', 'sorry'],   img: '' },
  { word: 'please',     ja: 'おねがいします', choices: ['please', 'sorry', 'thanks'], img: '' },
  { word: 'sorry',      ja: 'ごめんなさい', choices: ['sorry', 'please', 'hello'],    img: '' },
  { word: 'thanks',     ja: 'ありがとう',   choices: ['thanks', 'sorry', 'please'],   img: '' },
  { word: 'January',    ja: '1がつ',        choices: ['January', 'February', 'March'],  img: '' },
  { word: 'April',      ja: '4がつ',        choices: ['April', 'May', 'June'],          img: '' },
  { word: 'December',   ja: '12がつ',       choices: ['December', 'November', 'October'], img: '' },
]

interface WordItem {
  word: string
  ja: string
  choices: string[]
  img: string
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function getLevelPool<T>(pool: T[], level: number, maxLevels = 3): T[] {
  const size = Math.ceil(pool.length / maxLevels)
  const start = (level - 1) * size
  return pool.slice(start, start + size)
}

const QUESTIONS_PER_ROUND = 5

interface Stage1WordProps {
  level: number
  onAddStar: () => void
  onClearLevel: () => void
  onBack: () => void
}

type AnswerState = 'idle' | 'correct' | 'wrong'

export default function Stage1Word({ level, onAddStar, onClearLevel, onBack }: Stage1WordProps) {
  const { speak } = useSpeech()
  const { rows } = useSheetData(SHEET_CSV_URL)

  const initialized = useRef(false)
  const [questions, setQuestions] = useState<WordItem[]>([])
  const [index, setIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([])
  const [charMood, setCharMood] = useState<'cheer' | 'happy' | 'normal'>('cheer')
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (initialized.current) return
    if (rows.length >= 10) {
      const pool = rows.map((r) => ({
        word:    r[1] ?? '',
        ja:      r[2] ?? '',
        choices: shuffle([r[1] ?? '', r[3] ?? '', r[4] ?? '']),
        img:     r[5] ?? '',
      }))
      setQuestions(shuffle(getLevelPool(pool, level)).slice(0, QUESTIONS_PER_ROUND))
      setIndex(0)
      initialized.current = true
    } else {
      setQuestions(shuffle(getLevelPool(SAMPLE_WORDS, level)).slice(0, QUESTIONS_PER_ROUND))
      setIndex(0)
      initialized.current = true
    }
  }, [rows, level])

  useEffect(() => {
    if (questions[index]) {
      setShuffledChoices(shuffle(questions[index].choices))
    }
  }, [index, questions])

  const current = questions[index]

  const handleSpeak = useCallback(() => {
    if (current) speak(current.word)
  }, [current, speak])

  useEffect(() => {
    if (current) {
      const t = setTimeout(() => speak(current.word), 500)
      return () => clearTimeout(t)
    }
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChoose = (choice: string) => {
    if (answerState !== 'idle' || !current) return
    if (choice === current.word) {
      setAnswerState('correct')
      setCharMood('happy')
      setStars((s) => s + 1)
      onAddStar()
      setTimeout(() => {
        if (index + 1 >= questions.length) {
          onClearLevel()
          setFinished(true)
        } else {
          setIndex((i) => i + 1)
          setAnswerState('idle')
          setCharMood('cheer')
        }
      }, 1200)
    } else {
      setAnswerState('wrong')
      setCharMood('normal')
      setTimeout(() => { setAnswerState('idle'); setCharMood('cheer') }, 900)
    }
  }

  if (!current && !finished) {
    return <div className="stage1 stage1--loading"><p>データを読み込み中…🐰</p></div>
  }

  if (finished) {
    return (
      <div className="stage1 stage1--finish">
        <Character type="rabi" mood="happy" message={`Lv.${level} クリア！\n⭐ ${stars}こ ゲット！`} size="lg" />
        <h2 className="stage1__finish-title">よくできました！🎉</h2>
        <PuffyButton variant="primary" size="lg" onClick={onBack}>ホームへもどる</PuffyButton>
      </div>
    )
  }

  return (
    <div className="stage1">
      <div className="stage1__header">
        <PuffyButton variant="ghost" size="sm" onClick={onBack}>← もどる</PuffyButton>
        <StarGauge stars={stars} maxStars={QUESTIONS_PER_ROUND} />
        <span className="stage1__progress">{index + 1} / {questions.length}</span>
      </div>
      <div className="stage1__level-badge">📖 Word — Lv.{level}</div>
      <Character type="rabi" mood={charMood} size="sm" />
      <div className={['stage1__card', answerState !== 'idle' ? `stage1__card--${answerState}` : ''].join(' ')}>
        <p className="stage1__instruction">音を聴いて、正しいえいごを えらぼう！</p>
        {current.img && <img src={current.img} alt={current.ja} className="stage1__word-img" />}
        <p className="stage1__ja-hint">「{current.ja}」</p>
        <PuffyButton variant="honey" size="lg" onClick={handleSpeak} aria-label="音声を聴く">
          🔊 もう一度 聴く
        </PuffyButton>
        {answerState === 'correct' && <p className="stage1__result stage1__result--correct">⭐ せいかい！すごい！</p>}
        {answerState === 'wrong'   && <p className="stage1__result stage1__result--wrong">もう一度チャレンジ！</p>}
      </div>
      <div className="stage1__choices">
        {shuffledChoices.map((c) => (
          <PuffyButton
            key={c}
            variant={answerState === 'correct' && c === current.word ? 'honey' : 'primary'}
            size="md"
            fullWidth
            onClick={() => handleChoose(c)}
            disabled={answerState !== 'idle'}
          >
            {c}
          </PuffyButton>
        ))}
      </div>
    </div>
  )
}
