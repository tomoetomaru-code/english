import { useCallback, useRef } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ===== iOS Audio Unlock =====
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

// ===== iOS 判定 =====
export function isIOSDevice(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    /iP(hone|od|ad)/.test(navigator.userAgent)
  )
}

// ===== TTS =====
export function useSpeech() {
  const speak = useCallback((text: string, lang = 'en-US') => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    utter.rate = 0.85
    utter.pitch = 1.1
    // iOSは cancel() 直後に speak() すると無音になりやすいので少し待つ
    if (isIOSDevice()) {
      setTimeout(() => { window.speechSynthesis.speak(utter) }, 150)
    } else {
      window.speechSynthesis.speak(utter)
    }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
  }, [])

  return { speak, stop }
}

// ===== 音声認識 =====
export interface RecognitionOptions {
  lang?: string
  onResult: (transcript: string) => void
  onError?: (err: string) => void
  onEnd?: () => void   // 結果なしで終了したとき（無音タイムアウトなど）
}

export function useRecognition() {
  const w: any = window
  const Ctor: any = w.SpeechRecognition || w.webkitSpeechRecognition || null
  const isSupported = Boolean(Ctor)
  const recognizerRef = useRef<any>(null)

  const recognize = useCallback(
    ({ lang = 'en-US', onResult, onError, onEnd }: RecognitionOptions): (() => void) => {
      const ww: any = window
      const C: any = ww.SpeechRecognition || ww.webkitSpeechRecognition || null
      if (!C) {
        onError?.('このブラウザは音声認識に対応していません。')
        return () => { return }
      }

      // 前回の認識が残っていれば停止
      if (recognizerRef.current) {
        try { recognizerRef.current.abort() } catch { /* noop */ }
        recognizerRef.current = null
      }

      const r: any = new C()
      recognizerRef.current = r
      r.lang = lang
      r.interimResults = false
      r.maxAlternatives = 3

      let didGetResult = false

      r.onresult = (e: any) => {
        didGetResult = true
        const t: string = String(e.results[0][0].transcript).toLowerCase().trim()
        onResult(t)
      }

      r.onerror = (e: any) => {
        const code = String(e.error)
        if (code === 'no-speech') {
          // 無音タイムアウトは onEnd で通知（エラーではない）
          onEnd?.()
        } else {
          onError?.(code)
        }
      }

      r.onend = () => {
        recognizerRef.current = null
        // 結果が来ていない場合は onEnd を呼ぶ
        if (!didGetResult) onEnd?.()
      }

      r.start()

      return () => {
        try { r.abort() } catch { /* noop */ }
        recognizerRef.current = null
      }
    },
    [Ctor],
  )

  return { isSupported, recognize }
}
