'use client'

import React, { useState } from 'react'
import { bulkCreateQuestionsAction } from '@/app/admin/actions'
import { toast } from 'sonner'
import { Bot, Upload, X, Copy, Check, AlertCircle, ChevronRight } from 'lucide-react'

type Category = {
  id: string
  name: string
}

type ParsedQuestion = {
  category: string
  content: string
  options: string[]
  answer: string
  explanation: string
}

type Tab = 'prompt' | 'import'

export function BulkImporter({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('prompt')
  const [jsonText, setJsonText] = useState('')
  const [parsed, setParsed] = useState<ParsedQuestion[] | null>(null)
  const [parseError, setParseError] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number; skipped: number; errors: string[] } | null>(null)
  const [promptCopied, setPromptCopied] = useState(false)

  const categoryNames = categories.map(c => c.name).join('\n- ')
  const promptTemplate = `以下のJSONフォーマットで、Google Cloud Digital Leader (CDL) 試験対策問題を10問作成してください。

カテゴリは以下から選んでください：
- ${categoryNames}

フォーマット：
[
  {
    "category": "カテゴリ名（上記から選択）",
    "content": "問題文",
    "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
    "answer": "正解の選択肢（optionsのいずれかと完全一致）",
    "explanation": "解説文（なぜその答えが正しいか）"
  }
]

注意事項：
- 4択問題のみ（options は必ず4つ）
- answer は options のどれかと完全に一致させること
- 実際のCDL試験に即した正確な内容にすること
- JSONのみを返答してください（前置き・後書き不要）`

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(promptTemplate)
    setPromptCopied(true)
    setTimeout(() => setPromptCopied(false), 2000)
  }

  const handleParse = () => {
    setParseError('')
    setParsed(null)
    setResult(null)

    if (!jsonText.trim()) {
      setParseError('JSONを入力してください')
      return
    }

    try {
      // ```json ... ``` ブロックがある場合は除去
      const cleaned = jsonText.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim()
      const data = JSON.parse(cleaned)

      if (!Array.isArray(data)) {
        setParseError('JSONは配列（[ ... ]）形式である必要があります')
        return
      }
      if (data.length === 0) {
        setParseError('問題が1件もありません')
        return
      }
      if (data.length > 50) {
        setParseError('1回のインポートは50問までです')
        return
      }

      setParsed(data)
      setTab('import')
    } catch (e) {
      setParseError('JSONのパースに失敗しました。フォーマットを確認してください。')
    }
  }

  const handleImport = async () => {
    if (!parsed) return
    setIsImporting(true)
    setResult(null)

    const res = await bulkCreateQuestionsAction(parsed)
    setIsImporting(false)

    if ('error' in res) {
      toast.error(res.error)
      return
    }

    setResult(res)
    if (res.success > 0) {
      toast.success(`${res.success}件の問題を登録しました！`)
    }
    if (res.failed > 0) {
      toast.error(`${res.failed}件の登録に失敗しました`)
    }
  }

  const handleClose = () => {
    if (jsonText && !result) {
      if (!confirm('入力内容を破棄しますか？')) return
    }
    setIsOpen(false)
    setTab('prompt')
    setJsonText('')
    setParsed(null)
    setParseError('')
    setResult(null)
  }

  // カテゴリ別の問題数を集計
  const categorySummary = parsed
    ? parsed.reduce((acc: Record<string, number>, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1
        return acc
      }, {})
    : null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-14 px-6 flex items-center gap-2 whitespace-nowrap font-black text-sm border-2 border-qz-blue text-qz-blue hover:bg-qz-blue hover:text-white rounded-xl transition-all"
      >
        <Bot size={20} /> AI一括インポート
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="bg-white dark:bg-[#1A1D23] rounded-2xl border border-qz-border dark:border-[#2E3856] w-full max-w-3xl shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-qz-border dark:border-[#2E3856]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-qz-blue/10 rounded-xl flex items-center justify-center">
                  <Bot size={22} className="text-qz-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-black italic tracking-tight">AI一括インポート</h2>
                  <p className="text-xs text-qz-text-light font-bold">AIで生成したJSONをそのまま登録</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-qz-text-light hover:text-qz-error hover:bg-qz-error/10 rounded-xl transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-qz-border dark:border-[#2E3856]">
              <button
                onClick={() => setTab('prompt')}
                className={`flex-1 py-4 text-sm font-black transition-all ${
                  tab === 'prompt'
                    ? 'text-qz-blue border-b-2 border-qz-blue'
                    : 'text-qz-text-light hover:text-qz-text'
                }`}
              >
                STEP 1: AIプロンプト
              </button>
              <button
                onClick={() => setTab('import')}
                className={`flex-1 py-4 text-sm font-black transition-all ${
                  tab === 'import'
                    ? 'text-qz-blue border-b-2 border-qz-blue'
                    : 'text-qz-text-light hover:text-qz-text'
                }`}
              >
                STEP 2: JSONを貼り付け & 登録
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
              {tab === 'prompt' && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-qz-text-light">
                    下のプロンプトをコピーして ChatGPT や Claude に貼り付けてください。カテゴリ一覧は自動で埋め込まれています。
                  </p>
                  <div className="relative">
                    <pre className="bg-qz-bg dark:bg-[#111318] rounded-xl p-5 text-xs font-mono leading-relaxed text-qz-text whitespace-pre-wrap border border-qz-border dark:border-[#2E3856] max-h-[400px] overflow-y-auto">
                      {promptTemplate}
                    </pre>
                    <button
                      onClick={handleCopyPrompt}
                      className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        promptCopied
                          ? 'bg-qz-success text-white'
                          : 'bg-white dark:bg-[#2E3856] text-qz-text-light hover:text-qz-blue border border-qz-border dark:border-[#3B4664]'
                      }`}
                    >
                      {promptCopied ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> コピー</>}
                    </button>
                  </div>
                  <button
                    onClick={() => setTab('import')}
                    className="w-full qz-btn-primary py-4 flex items-center justify-center gap-2"
                  >
                    AIの回答を貼り付ける <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {tab === 'import' && (
                <div className="space-y-5">
                  {!result ? (
                    <>
                      <p className="text-sm font-bold text-qz-text-light">
                        AIが返したJSONをそのまま貼り付けてください（コードブロックのまま貼り付けもOKです）。
                      </p>
                      <textarea
                        className="qz-input w-full min-h-[200px] font-mono text-xs resize-y"
                        placeholder={'[\n  {\n    "category": "Cloud Storage",\n    "content": "...",\n    ...\n  }\n]'}
                        value={jsonText}
                        onChange={e => {
                          setJsonText(e.target.value)
                          setParsed(null)
                          setParseError('')
                        }}
                      />

                      {parseError && (
                        <div className="flex items-start gap-2 p-3 bg-qz-error/10 border border-qz-error/20 rounded-xl">
                          <AlertCircle size={16} className="text-qz-error shrink-0 mt-0.5" />
                          <p className="text-sm font-bold text-qz-error">{parseError}</p>
                        </div>
                      )}

                      {/* Preview */}
                      {parsed && categorySummary && (
                        <div className="p-5 bg-qz-success/5 border border-qz-success/20 rounded-xl space-y-3">
                          <p className="text-sm font-black text-qz-success">✓ {parsed.length}件の問題を検出しました</p>
                          <div className="space-y-1">
                            {Object.entries(categorySummary).map(([cat, count]) => (
                              <div key={cat} className="flex items-center justify-between text-xs font-bold text-qz-text-light">
                                <span>{cat}</span>
                                <span className="text-qz-blue">{count}問</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {!parsed ? (
                          <button
                            onClick={handleParse}
                            className="flex-1 py-4 font-black text-sm border-2 border-qz-blue text-qz-blue hover:bg-qz-blue hover:text-white rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            <Upload size={18} /> 内容を確認する
                          </button>
                        ) : (
                          <button
                            onClick={handleImport}
                            disabled={isImporting}
                            className="flex-1 qz-btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isImporting ? 'インポート中...' : <><Upload size={18} /> {parsed.length}件をDBに登録する</>}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    /* 結果表示 */
                    <div className="space-y-5">
                      <div className={`grid gap-4 ${result.skipped > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <div className="p-6 bg-qz-success/10 border border-qz-success/20 rounded-2xl text-center">
                          <p className="text-4xl font-black text-qz-success">{result.success}</p>
                          <p className="text-xs font-black text-qz-success uppercase tracking-widest mt-1">成功</p>
                        </div>
                        {result.skipped > 0 && (
                          <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center">
                            <p className="text-4xl font-black text-amber-500">{result.skipped}</p>
                            <p className="text-xs font-black text-amber-500 uppercase tracking-widest mt-1">重複スキップ</p>
                          </div>
                        )}
                        <div className="p-6 bg-qz-error/10 border border-qz-error/20 rounded-2xl text-center">
                          <p className="text-4xl font-black text-qz-error">{result.failed}</p>
                          <p className="text-xs font-black text-qz-error uppercase tracking-widest mt-1">失敗</p>
                        </div>
                      </div>

                      {result.errors.length > 0 && (
                        <div className="p-4 bg-qz-error/5 border border-qz-error/20 rounded-xl space-y-1">
                          <p className="text-xs font-black text-qz-error uppercase tracking-widest mb-2">エラー詳細</p>
                          {result.errors.map((e, i) => (
                            <p key={i} className="text-xs font-bold text-qz-error">{e}</p>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setResult(null)
                            setJsonText('')
                            setParsed(null)
                          }}
                          className="flex-1 py-4 font-black text-sm border-2 border-qz-border rounded-xl hover:bg-qz-bg transition-all"
                        >
                          続けてインポート
                        </button>
                        <button
                          onClick={handleClose}
                          className="flex-1 qz-btn-primary py-4"
                        >
                          閉じる
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
