import { useCallback } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */

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
