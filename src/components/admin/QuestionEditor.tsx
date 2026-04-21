'use client'

import React, { useState } from 'react'
import { updateQuestionAction, deleteQuestionAction } from '@/app/admin/actions'
import { toast } from 'sonner'
import { Save, Trash2, Check, Edit2 } from 'lucide-react'

type Question = {
  id: string
  content: string
  options: string[]
  answer: string
  explanation: string
}

export function QuestionEditor({ question }: { question: Question }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [data, setData] = useState(question)

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateQuestionAction(question.id, data)
    setIsSaving(false)
    
    if (result.success) {
      toast.success('問題を更新しました')
      setIsEditing(false)
    } else {
      toast.error(result.error || '更新に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこの問題を削除しますか？')) return
    
    const result = await deleteQuestionAction(question.id)
    if (result.success) {
      toast.success('削除しました')
    } else {
      toast.error(result.error)
    }
  }

  if (!isEditing) {
    return (
      <div className="qz-card p-6 hover:border-qz-blue/30 transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div className="text-xs font-black text-qz-text-light uppercase tracking-widest">
            ID: {question.id.slice(0, 8)}...
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 text-qz-text-light hover:text-qz-blue hover:bg-qz-blue/10 rounded-lg transition-all"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 text-qz-text-light hover:text-qz-error hover:bg-qz-error/10 rounded-lg transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <h3 className="text-lg font-bold mb-4 line-clamp-2">{question.content}</h3>
        <div className="space-y-1">
          <div className="text-xs font-black text-qz-success uppercase tracking-widest mb-1">正解</div>
          <div className="text-sm font-bold bg-qz-success/5 text-qz-success p-3 rounded-xl border border-qz-success/20">
            {question.answer}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="qz-card p-8 border-qz-blue ring-2 ring-qz-blue/20">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black">問題の編集</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm font-bold text-qz-text-light hover:bg-qz-bg rounded-xl transition-all"
          >
            キャンセル
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="qz-btn-primary !py-2 !px-6 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? '保存中...' : <><Save size={18} /> 保存する</>}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2">問題文</label>
          <textarea 
            className="qz-input w-full min-h-[100px]"
            value={data.content}
            onChange={e => setData({...data, content: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2">選択肢</label>
          <div className="space-y-3">
            {data.options.map((opt, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-qz-bg flex items-center justify-center text-xs font-black shrink-0">
                  {String.fromCharCode(65 + i)}
                </div>
                <input 
                  className="qz-input flex-1"
                  value={opt}
                  onChange={e => {
                    const newOpts = [...data.options]
                    newOpts[i] = e.target.value
                    setData({...data, options: newOpts})
                  }}
                />
                <button 
                  onClick={() => setData({...data, answer: opt})}
                  className={`p-2 rounded-lg transition-all ${data.answer === opt ? 'bg-qz-success text-white' : 'bg-qz-bg text-qz-text-light hover:text-qz-success'}`}
                  title="これを正解にする"
                >
                  <Check size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2">解説</label>
          <textarea 
            className="qz-input w-full min-h-[100px]"
            value={data.explanation}
            onChange={e => setData({...data, explanation: e.target.value})}
          />
        </div>
      </div>
    </div>
  )
}
