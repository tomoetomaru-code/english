import { useState, useEffect } from 'react'

/**
 * GoogleスプレッドシートのCSV公開URLからデータを取得するフック
 *
 * 使い方:
 *   const { rows, loading, error } = useSheetData(SHEET_CSV_URL)
 *
 * Googleスプレッドシート → ファイル → 共有 → ウェブに公開 → CSV で取得したURLを渡す。
 */
export function useSheetData(csvUrl: string) {
  const [rows, setRows] = useState<string[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!csvUrl) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        // シンプルなCSVパーサー（改行 + カンマ区切り）
        const parsed = text
          .trim()
          .split('\n')
          .map((line) =>
            line.split(',').map((cell) => cell.replace(/^"|"$/g, '').trim()),
          )
        setRows(parsed.slice(1)) // 1行目（ヘッダー）をスキップ
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(String(err))
        setLoading(false)
      })
  }, [csvUrl])

  return { rows, loading, error }
}
