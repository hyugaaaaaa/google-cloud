'use client'

import React, { useState } from 'react'
import { createQuestionAction } from '@/app/admin/actions'
import { toast } from 'sonner'
import { Plus, X, Check, Save } from 'lucide-react'

type Category = {
  id: string
  name: string
}

const EMPTY_FORM = {
  category_id: '',
  content: '',
  options: ['', '', '', ''],
  answer: '',
  explanation: '',
}

export function QuestionCreator({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const handleSave = async () => {
    if (!form.category_id) {
      toast.error('カテゴリを選択してください')
      return
    }
    if (!form.content.trim()) {
      toast.error('問題文を入力してください')
      return
    }
    if (form.options.some(o => !o.trim())) {
      toast.error('すべての選択肢を入力してください')
      return
    }
    if (!form.answer) {
      toast.error('正解を選択してください（✓ ボタンを押してください）')
      return
    }

    setIsSaving(true)
    const result = await createQuestionAction(form)
    setIsSaving(false)

    if (result.success) {
      toast.success('問題を作成しました！')
      setForm(EMPTY_FORM)
      setIsOpen(false)
    } else {
      toast.error(result.error || '作成に失敗しました')
    }
  }

  const handleClose = () => {
    if (form.content || form.options.some(o => o)) {
      if (!confirm('入力内容を破棄しますか？')) return
    }
    setForm(EMPTY_FORM)
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="qz-btn-primary h-14 px-6 flex items-center gap-2 whitespace-nowrap"
      >
        <Plus size={20} /> 新規作成
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="bg-white dark:bg-[#1A1D23] rounded-2xl border border-qz-border dark:border-[#2E3856] w-full max-w-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-qz-border dark:border-[#2E3856]">
              <h2 className="text-2xl font-black italic tracking-tight">新規問題を作成</h2>
              <button
                onClick={handleClose}
                className="p-2 text-qz-text-light hover:text-qz-error hover:bg-qz-error/10 rounded-xl transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6 space-y-6">
              {/* カテゴリ */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2">
                  カテゴリ <span className="text-qz-error">*</span>
                </label>
                <select
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                  className="qz-input w-full bg-white dark:bg-[#2E3856]"
                >
                  <option value="">カテゴリを選択...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* 問題文 */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2">
                  問題文 <span className="text-qz-error">*</span>
                </label>
                <textarea
                  className="qz-input w-full min-h-[100px] resize-y"
                  placeholder="問題文を入力してください..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                />
              </div>

              {/* 選択肢 */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2">
                  選択肢 <span className="text-qz-error">*</span>
                  <span className="text-qz-text-light font-normal normal-case tracking-normal ml-2">（✓ ボタンで正解を指定）</span>
                </label>
                <div className="space-y-3">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-lg bg-qz-bg dark:bg-[#2E3856] flex items-center justify-center text-xs font-black shrink-0">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <input
                        className="qz-input flex-1"
                        placeholder={`選択肢 ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={e => {
                          const newOpts = [...form.options]
                          // 正解がこの選択肢を指していたら更新
                          const wasAnswer = form.answer === newOpts[i]
                          newOpts[i] = e.target.value
                          setForm({
                            ...form,
                            options: newOpts,
                            answer: wasAnswer ? e.target.value : form.answer,
                          })
                        }}
                      />
                      <button
                        onClick={() => setForm({ ...form, answer: opt })}
                        disabled={!opt.trim()}
                        className={`p-2 rounded-lg transition-all disabled:opacity-30 ${
                          form.answer === opt && opt.trim()
                            ? 'bg-qz-success text-white'
                            : 'bg-qz-bg dark:bg-[#2E3856] text-qz-text-light hover:text-qz-success'
                        }`}
                        title="これを正解にする"
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                {form.answer && (
                  <p className="mt-2 text-xs font-bold text-qz-success">
                    ✓ 正解: {form.answer.length > 40 ? form.answer.slice(0, 40) + '…' : form.answer}
                  </p>
                )}
              </div>

              {/* 解説 */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2">
                  解説
                </label>
                <textarea
                  className="qz-input w-full min-h-[100px] resize-y"
                  placeholder="解説を入力してください（任意）..."
                  value={form.explanation}
                  onChange={e => setForm({ ...form, explanation: e.target.value })}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-8 py-6 border-t border-qz-border dark:border-[#2E3856]">
              <button
                onClick={handleClose}
                className="px-6 py-3 text-sm font-bold text-qz-text-light hover:bg-qz-bg dark:hover:bg-[#2E3856] rounded-xl transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="qz-btn-primary !py-3 !px-8 flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? '作成中...' : <><Save size={18} /> 作成する</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
