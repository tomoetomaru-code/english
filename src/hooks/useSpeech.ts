import { useCallback } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */

// iOS Audio Unlock
// iOSはユーザー操作なしの音声再生を禁止する。
// 最初のタッチ/クリック時に無音発話でspeechSynthesisをアンロックする。
let _speechUnlocked = false

function _unlockSpeech() {
  if (_speechUnlocked || !window.speechSynthesis) return
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0
  u.rate = 10
  window.speechSynthesis.speak(u)
  _speechUnlocked = true
}

if (typeof document !== 'undefined') {
  document.addEventListener('touchstart', _unlockSpeech, { once: true, passive: true })
  document.addEventListener('click', _unlockSpeech, { once: true })
}

export function useSpeech() {
  const speak = useCallback((text: string, lang = 'en-US') => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    utter.rate = 0.85
    utter.pitch = 1.1
    window.speechSynthesis.speak(utter)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
  }, [])

  return { speak, stop }
}

export interface RecognitionOptions {
  lang?: string
  onResult: (transcript: string) => void
  onError?: (err: string) => void
}

export function useRecognition() {
  const w: any = window
  const Ctor: any = w.SpeechRecognition || w.webkitSpeechRecognition || null
  const isSupported = Boolean(Ctor)

  const recognize = useCallback(
    ({ lang = 'en-US', onResult, onError }: RecognitionOptions) => {
      const ww: any = window
      const C: any = ww.SpeechRecognition || ww.webkitSpeechRecognition || null
      if (!C) {
        onError?.('このブラウザは音声認識に対応していません。')
        return () => { return }
      }
      const r: any = new C()
      r.lang = lang
      r.interimResults = false
      r.maxAlternatives = 3
      r.onresult = (e: any) => {
        const t: string = String(e.results[0][0].transcript).toLowerCase().trim()
        onResult(t)
      }
      r.onerror = (e: any) => {
        onError?.(String(e.error))
      }
      r.start()
      return () => { r.stop() }
    },
    [Ctor],
  )

  return { isSupported, recognize }
}
