import { useState, useCallback, useEffect, useRef } from 'react'
import Character from '../components/Character'
import PuffyButton from '../components/PuffyButton'
import StarGauge from '../components/StarGauge'
import { useSpeech } from '../hooks/useSpeech'
import { useRecognition } from '../hooks/useSpeech'
import { useSheetData } from '../hooks/useSheetData'
import './Stage3Talk.css'

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSBmK15QD8nc0XpAVAzR3d5-YXr6UfDnEG-hsg4KSoNNszvFHGzzZVglo1lKmzzIrlSlNQmDBjyMs55/pub?gid=1012203483&single=true&output=csv'

interface SceneItem {
  scene: string
  charLine: string
  charLineJa: string
  answer: string
  acceptWords: string[]
  hint: string
}

const SCENARIO_FALLBACK: SceneItem[] = [
  { scene: '自己紹介',         charLine: 'Hello! What is your name?',               charLineJa: '(こんにちは！あなたのお名前は？)',        answer: 'My name is Taro.',                   acceptWords: ['my name is','i am','i\'m'],                                                           hint: '「My name is [なまえ].」と言ってみよう' },
  { scene: 'すきなものを伝える', charLine: 'What food do you like?',                 charLineJa: '(どんな食べ物が好きですか？)',             answer: 'I like sushi.',                      acceptWords: ['i like','i love'],                                                                    hint: '「I like [すきなたべもの].」と言ってみよう' },
  { scene: 'レストランで注文',   charLine: 'May I take your order?',                 charLineJa: '(ご注文はお決まりですか？)',               answer: 'I would like a hamburger, please.',  acceptWords: ['i would like','i want','hamburger','pizza','please'],                                  hint: '「I would like a hamburger, please.」と言ってみよう' },
  { scene: 'えきで道を聞く',    charLine: 'Excuse me. Where is the station?',        charLineJa: '(すみません。駅はどこですか？)',           answer: 'Go straight and turn left.',         acceptWords: ['straight','left','right','turn','go'],                                                hint: '「Go straight and turn left.」と言ってみよう' },
  { scene: '天気について話す',   charLine: 'How is the weather today?',               charLineJa: '(今日の天気はどうですか？)',               answer: 'It is sunny today.',                 acceptWords: ['sunny','cloudy','rainy','hot','cold','it is','it\'s'],                                hint: '「It is sunny today.」などと言ってみよう' },
  { scene: '得意なことを伝える', charLine: 'What can you do?',                       charLineJa: '(あなたは何ができますか？)',               answer: 'I can swim.',                        acceptWords: ['i can','swim','run','sing','play','cook','dance'],                                     hint: '「I can swim.」や「I can play soccer.」と言ってみよう' },
  { scene: '将来の夢を伝える',   charLine: 'What do you want to be in the future?',  charLineJa: '(将来何になりたいですか？)',               answer: 'I want to be a doctor.',             acceptWords: ['i want to be','doctor','teacher','chef','singer','pilot'],                             hint: '「I want to be a [職業].」と言ってみよう' },
  { scene: 'たんじょうびを聞く', charLine: 'When is your birthday?',                 charLineJa: '(たんじょうびはいつですか？)',             answer: 'My birthday is in April.',           acceptWords: ['january','february','march','april','may','june','july','august','september','october','november','december','my birthday is'], hint: '「My birthday is in [月].」と言ってみよう' },
  { scene: '学校について話す',   charLine: 'What subject do you like?',               charLineJa: '(どの教科が好きですか？)',                 answer: 'I like math.',                       acceptWords: ['math','science','music','art','p.e.','english','i like'],                              hint: '「I like math.」や「I like music.」と言ってみよう' },
  { scene: 'スポーツについて話す', charLine: 'Do you like sports?',                  charLineJa: '(スポーツは好きですか？)',                 answer: 'Yes, I do. I like soccer.',          acceptWords: ['yes i do','no i do not','i like','soccer','baseball','tennis','basketball'],           hint: '「Yes, I do.」や「No, I don\'t.」と言ってみよう' },
  { scene: '家族の話',          charLine: 'Do you have any brothers or sisters?',    charLineJa: '(兄弟や姉妹はいますか？)',                 answer: 'I have one sister.',                 acceptWords: ['have','sister','brother','one','two'],                                                hint: '「I have [数] [きょうだい].」と言ってみよう' },
  { scene: 'ペットの話',        charLine: 'Do you have any pets?',                   charLineJa: '(ペットはいますか？)',                     answer: 'Yes, I have a cat.',                 acceptWords: ['cat','dog','rabbit','have','yes'],                                                    hint: '「Yes, I have a [動物].」や「No, I don\'t.」と言ってみよう' },
  { scene: '好きな動物',        charLine: 'What is your favorite animal?',           charLineJa: '(好きな動物は何ですか？)',                 answer: 'My favorite animal is a dog.',       acceptWords: ['dog','cat','rabbit','favorite','animal'],                                             hint: '「My favorite animal is a [動物].」と言ってみよう' },
  { scene: '好きな色',          charLine: 'What is your favorite color?',            charLineJa: '(好きな色は何ですか？)',                   answer: 'My favorite color is blue.',         acceptWords: ['blue','red','green','yellow','color','favorite'],                                     hint: '「My favorite color is [色].」と言ってみよう' },
  { scene: '買い物',            charLine: 'How much is this?',                       charLineJa: '(これはいくらですか？)',                   answer: 'It is five hundred yen.',            acceptWords: ['hundred','yen','five','ten','it is'],                                                 hint: '「It is [金額] yen.」と言ってみよう' },
  { scene: '時間を聞く',        charLine: 'Excuse me, what time is it?',             charLineJa: '(すみません、今何時ですか？)',             answer: 'It is three thirty.',                acceptWords: ['three','thirty','two','four','it is'],                                                hint: '「It is [時刻].」と言ってみよう' },
  { scene: '場所を聞く',        charLine: 'Where is the library?',                   charLineJa: '(図書館はどこですか？)',                   answer: 'It is next to the gym.',             acceptWords: ['next','to','library','gym','near'],                                                   hint: '「It is next to the gym.」と言ってみよう' },
  { scene: '週末の予定',        charLine: 'What will you do this weekend?',          charLineJa: '(今週末は何をしますか？)',                 answer: 'I will go to the park.',             acceptWords: ['go','park','will','play'],                                                            hint: '「I will [動詞].」と言ってみよう' },
  { scene: '昨日の話',          charLine: 'What did you do yesterday?',              charLineJa: '(昨日は何をしましたか？)',                 answer: 'I watched TV at home.',              acceptWords: ['watched','TV','home','played'],                                                       hint: '「I [過去形] yesterday.」と言ってみよう' },
  { scene: '飲み物の注文',      charLine: 'What would you like to drink?',           charLineJa: '(お飲み物は何がよいですか？)',             answer: 'I would like orange juice, please.', acceptWords: ['orange','juice','would like','please','water'],                                       hint: '「I would like [飲み物], please.」と言ってみよう' },
  { scene: '道案内',            charLine: 'How do I get to the park?',               charLineJa: '(公園へはどう行けばいいですか？)',         answer: 'Turn right and go straight.',        acceptWords: ['right','straight','turn','go','left'],                                                hint: '「Turn right and go straight.」と言ってみよう' },
  { scene: '音楽の話',          charLine: 'Do you like music?',                      charLineJa: '(音楽は好きですか？)',                     answer: 'Yes, I like music very much.',       acceptWords: ['like','music','yes','much','love'],                                                   hint: '「Yes, I like music.」や「No, I don\'t.」と言ってみよう' },
  { scene: '旅行したい場所',    charLine: 'Where do you want to go?',                charLineJa: '(どこに行きたいですか？)',                 answer: 'I want to go to America.',           acceptWords: ['go','America','want','Japan','France'],                                               hint: '「I want to go to [場所].」と言ってみよう' },
  { scene: '体調を聞く',        charLine: 'How are you feeling today?',              charLineJa: '(今日の体調はどうですか？)',               answer: 'I am feeling great, thank you.',     acceptWords: ['great','feeling','fine','thank','good'],                                              hint: '「I am feeling great, thank you.」と言ってみよう' },
  { scene: '今日の授業',        charLine: 'What class do you have today?',           charLineJa: '(今日は何の授業がありますか？)',           answer: 'I have English and math today.',     acceptWords: ['English','math','today','have','science'],                                            hint: '「I have [教科] today.」と言ってみよう' },
  { scene: '部活動',            charLine: 'What club do you belong to?',             charLineJa: '(何部に入っていますか？)',                 answer: 'I belong to the soccer club.',       acceptWords: ['soccer','club','belong','baseball','swim'],                                           hint: '「I belong to the [部活] club.」と言ってみよう' },
  { scene: '好きな季節',        charLine: 'What season do you like best?',           charLineJa: '(好きな季節はいつですか？)',               answer: 'I like spring best.',                acceptWords: ['spring','summer','autumn','winter','like','best'],                                    hint: '「I like [季節] best.」と言ってみよう' },
  { scene: '野菜の好み',        charLine: 'Do you like vegetables?',                 charLineJa: '(野菜は好きですか？)',                     answer: 'Yes, I love vegetables.',            acceptWords: ['vegetables','love','yes','like'],                                                     hint: '「Yes, I love vegetables.」や「No, I don\'t.」と言ってみよう' },
  { scene: '約束する',          charLine: 'Can we meet tomorrow?',                   charLineJa: '(明日会えますか？)',                       answer: 'Yes, let\'s meet at the park.',      acceptWords: ['meet','park','tomorrow','yes'],                                                       hint: '「Yes, let\'s meet at the park.」と言ってみよう' },
  { scene: 'お別れのあいさつ',  charLine: 'It was nice talking to you!',             charLineJa: '(お話できてよかったです！)',               answer: 'Thank you! See you again!',          acceptWords: ['thank','you','see','again','bye'],                                                    hint: '「Thank you! See you again!」と言ってみよう' },
]

const SCENES_PER_ROUND = 5

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function getLevelPool<T>(pool: T[], level: number, maxLevels = 3): T[] {
  const size = Math.ceil(pool.length / maxLevels)
  const start = (level - 1) * size
  return pool.slice(start, start + size)
}

interface Stage3TalkProps {
  level: number
  onAddStar: () => void
  onClearLevel: () => void
  onBack: () => void
}

type MicState = 'idle' | 'listening' | 'correct' | 'wrong'

export default function Stage3Talk({ level, onAddStar, onClearLevel, onBack }: Stage3TalkProps) {
  const { speak } = useSpeech()
  const { isSupported, recognize } = useRecognition()
  const { rows } = useSheetData(SHEET_CSV_URL)

  const initialized = useRef(false)
  const stopRecognizeRef = useRef<(() => void) | null>(null)
  const micTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [scenario, setScenario] = useState<SceneItem[]>([])
  const [sceneIndex, setSceneIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const [micState, setMicState] = useState<MicState>('idle')
  const [transcript, setTranscript] = useState('')
  const [finished, setFinished] = useState(false)
  const [typingText, setTypingText] = useState('')

  useEffect(() => {
    if (initialized.current) return
    if (rows.length >= 5) {
      const pool: SceneItem[] = rows.map((r) => ({
        scene:       r[1] ?? '',
        charLine:    r[2] ?? '',
        charLineJa:  `(${r[3] ?? ''})`,
        answer:      r[4] ?? '',
        acceptWords: (r[5] ?? '').split(' ').filter(Boolean),
        hint:        `「${r[4] ?? ''}」と言ってみよう`,
      }))
      setScenario(shuffle(getLevelPool(pool, level)).slice(0, SCENES_PER_ROUND))
    } else {
      setScenario(shuffle(getLevelPool(SCENARIO_FALLBACK, level)).slice(0, SCENES_PER_ROUND))
    }
    setSceneIndex(0)
    initialized.current = true
  }, [rows, level])

  const current = scenario[sceneIndex]

  const speakChar = useCallback(() => {
    if (current) speak(current.charLine)
  }, [current, speak])

  const speakAnswer = useCallback(() => {
    if (current) speak(current.answer)
  }, [current, speak])

  const startTyping = useCallback((text: string) => {
    setTypingText('')
    let i = 0
    const timer = setInterval(() => {
      setTypingText(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(timer)
    }, 40)
  }, [])

  const clearMicTimeout = useCallback(() => {
    if (micTimeoutRef.current) {
      clearTimeout(micTimeoutRef.current)
      micTimeoutRef.current = null
    }
  }, [])

  const handleListen = useCallback(() => {
    if (micState !== 'idle' || !current) return
    setMicState('listening')
    setTranscript('')
    startTyping('うーん…聴いてるよ')

    // 10秒で自動タイムアウト
    clearMicTimeout()
    micTimeoutRef.current = setTimeout(() => {
      stopRecognizeRef.current?.()
      stopRecognizeRef.current = null
      setMicState('idle')
      startTyping('もう一度おしてね！')
    }, 10000)

    const stopFn = recognize({
      onResult: (text) => {
        clearMicTimeout()
        setTranscript(text)

        // Do / Can / Is / Are 等で始まる YES/NO 疑問文は
        // "yes" または "no" を含む返答ならどちらも正解とする
        const isYesNoQuestion = /^(Do|Can|Is|Are|Have|Has|Will|Would|Should)\b/i.test(current.charLine)
        const isCorrect =
          current.acceptWords.some((w) => text.toLowerCase().includes(w.toLowerCase())) ||
          (isYesNoQuestion && /\b(yes|no)\b/i.test(text))

        if (isCorrect) {
          setMicState('correct')
          startTyping('すごい！上手に言えたね！')
          setStars((s) => s + 1)
          onAddStar()
          speak('Great job!')
          setTimeout(() => {
            if (sceneIndex + 1 >= scenario.length) {
              onClearLevel()
              setFinished(true)
            } else {
              setSceneIndex((i) => i + 1)
              setMicState('idle')
              setTranscript('')
            }
          }, 1500)
        } else {
          setMicState('wrong')
          startTyping('もう一度チャレンジしてね！')
          speak('Try again!')
          setTimeout(() => { setMicState('idle'); setTranscript('') }, 1200)
        }
      },
      onError: () => {
        clearMicTimeout()
        setMicState('idle')
        startTyping('うまく聞き取れなかったよ…もう一度！')
      },
      onEnd: () => {
        clearMicTimeout()
        setMicState('idle')
        startTyping('もう一度おしてね！')
      },
    })
    stopRecognizeRef.current = stopFn
  }, [micState, current, recognize, onAddStar, speak, sceneIndex, scenario.length, startTyping, onClearLevel, clearMicTimeout])

  if (!current && !finished) {
    return <div className="stage3"><p>データを読み込み中…</p></div>
  }

  if (finished) {
    return (
      <div className="stage3 stage3--finish">
        <Character type="shiba" mood="happy" message={`Lv.${level} クリア！\n${stars}こ ゲット！`} size="lg" />
        <h2 className="stage3__finish-title">えいかいわ マスター！</h2>
        <PuffyButton variant="primary" size="lg" onClick={onBack}>ホームへもどる</PuffyButton>
      </div>
    )
  }

  return (
    <div className="stage3">
      <div className="stage3__header">
        <PuffyButton variant="ghost" size="sm" onClick={onBack}>← もどる</PuffyButton>
        <StarGauge stars={stars} maxStars={SCENES_PER_ROUND} />
        <span className="stage3__progress">{sceneIndex + 1} / {scenario.length}</span>
      </div>

      <div className="stage3__scene-badge">Talk — Lv.{level}  {current.scene}</div>

      <div className="stage3__char-area">
        <Character type="rabi" mood={micState === 'correct' ? 'happy' : 'normal'} size="md" />
        <div className="stage3__dialog-box">
          <p className="stage3__dialog-en">{current.charLine}</p>
          <p className="stage3__dialog-ja">{current.charLineJa}</p>
          <PuffyButton variant="honey" size="sm" onClick={speakChar}>もう一度聴く</PuffyButton>
        </div>
      </div>

      <div className="stage3__hint">
        <p className="stage3__hint-text">{current.hint}</p>
        <PuffyButton variant="honey" size="sm" onClick={speakAnswer}>
          答えを音声で聞く
        </PuffyButton>
      </div>

      {typingText && (
        <p className={`stage3__typing stage3__typing--${micState}`}>{typingText}</p>
      )}

      {transcript && (
        <div className="stage3__transcript">
          <span className="stage3__transcript-label">あなたの声：</span>
          <span className="stage3__transcript-text">"{transcript}"</span>
        </div>
      )}

      {!isSupported ? (
        <p className="stage3__no-mic">このブラウザは音声認識に対応していません</p>
      ) : (
        <button
          className={`stage3__mic-btn stage3__mic-btn--${micState}`}
          onClick={handleListen}
          disabled={micState === 'listening'}
          aria-label={micState === 'listening' ? '録音中' : 'マイクで話す'}
        >
          <span className="stage3__mic-icon">{micState === 'listening' ? 'mic' : 'mic'}</span>
          <span className="stage3__mic-label">
            {micState === 'listening' ? '聴いてるよ…' : 'ここをおして 話してね！'}
          </span>
        </button>
      )}
    </div>
  )
}
