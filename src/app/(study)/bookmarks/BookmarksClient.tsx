'use client'

import React, { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { ChevronLeft, BookOpen, CheckCircle2, Star, Bookmark } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleBookmarkAction } from '@/app/(study)/actions'
import { toast } from 'sonner'

type BookmarkItem = {
  id: string
  category_id: string
  content: string
  options: string[]
  answer: string
  explanation: string
  created_at: string
  categoryName: string
}

interface BookmarksClientProps {
  bookmarks: BookmarkItem[]
}

export function BookmarksClient({ bookmarks }: BookmarksClientProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(bookmarks.map(b => b.id)));
  const [, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // カテゴリ一覧と件数を集計（現在ブックマークされているもののみ）
  const activeBookmarks = useMemo(() => {
    return bookmarks.filter(b => bookmarkedIds.has(b.id))
  }, [bookmarks, bookmarkedIds])

  const categories = useMemo(() => {
    const counts: Record<string, number> = {}
    activeBookmarks.forEach(b => {
      const name = b.categoryName
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [activeBookmarks])

  // 表示する問題をフィルタリング
  const filteredBookmarks = useMemo(() => {
    if (selectedCategory === 'all') return activeBookmarks
    return activeBookmarks.filter(b => b.categoryName === selectedCategory)
  }, [selectedCategory, activeBookmarks])

  const handleToggleBookmark = (e: React.MouseEvent, questionId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyBookmarked = bookmarkedIds.has(questionId);

    // Optimistic update
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });

    startTransition(async () => {
      const result = await toggleBookmarkAction(questionId);
      if (result.error) {
        toast.error(`ブックマークの更新に失敗しました: ${result.error}`);
        // Rollback
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          if (isCurrentlyBookmarked) {
            next.add(questionId);
          } else {
            next.delete(questionId);
          }
          return next;
        });
      } else {
        toast.success(result.bookmarked ? "ブックマークに追加しました" : "ブックマークを解除しました");
      }
    });
  };

  if (activeBookmarks.length === 0) {
    return (
      <div className="qz-card p-16 text-center mt-8">
        <div className="w-20 h-20 bg-qz-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bookmark className="w-10 h-10 text-qz-yellow" />
        </div>
        <h3 className="text-2xl font-black mb-4">No Bookmarks</h3>
        <p className="text-qz-text-light font-bold mb-8">
          ブックマークした問題がありません。<br />
          学習中に気になる問題があれば、星アイコンをタップして保存しましょう。
        </p>
        <Link href="/" className="qz-btn-primary px-8 inline-block">学習を始める</Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Tabs (Horizontal Scroll on Mobile) */}
      <div className="sticky top-[64px] z-30 -mx-4 px-4 py-4 bg-qz-bg/80 backdrop-blur-md border-b border-qz-border dark:border-[#2E3856]">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-black transition-all whitespace-nowrap border-2 ${
              selectedCategory === 'all'
                ? 'bg-qz-blue border-qz-blue text-white shadow-lg shadow-qz-blue/20'
                : 'bg-white dark:bg-[#2E3856] border-qz-border dark:border-qz-border text-qz-text-light hover:border-qz-blue'
            }`}
          >
            ALL ({activeBookmarks.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2.5 rounded-full text-sm font-black transition-all whitespace-nowrap border-2 ${
                selectedCategory === cat.name
                  ? 'bg-qz-blue border-qz-blue text-white shadow-lg shadow-qz-blue/20'
                  : 'bg-white dark:bg-[#2E3856] border-qz-border dark:border-qz-border text-qz-text-light hover:border-qz-blue'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-qz-yellow/5 border border-qz-yellow/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-qz-yellow/10 rounded-2xl flex items-center justify-center">
            <Bookmark className="text-qz-yellow w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-qz-yellow uppercase italic tracking-tight">
              {selectedCategory === 'all' ? '保存した問題' : `${selectedCategory} の問題`}
            </h2>
            <p className="text-qz-text-light text-sm font-bold">
              {filteredBookmarks.length} 問がブックマークされています
            </p>
          </div>
        </div>
        {selectedCategory === 'all' && (
          <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
            {categories.slice(0, 2).map(cat => (
              <div key={cat.name} className="bg-white dark:bg-[#2E3856] px-3 py-1.5 rounded-lg border border-qz-border dark:border-qz-border text-[10px] font-bold truncate">
                {cat.name}: {cat.count}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookmarks List */}
      <div className="space-y-4 relative min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredBookmarks.map((bookmark) => {
            const isBookmarked = bookmarkedIds.has(bookmark.id);
            return (
              <motion.div
                key={bookmark.id}
                layout
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Absolute positioned interactive elements to fix a11y warning */}
                <div className="absolute top-6 right-6 flex items-center gap-2 pointer-events-none z-10">
                  <button
                    onClick={(e) => handleToggleBookmark(e, bookmark.id)}
                    className={`pointer-events-auto p-2.5 rounded-xl transition-all duration-300 ${
                      isBookmarked 
                        ? 'bg-qz-yellow text-white shadow-lg' 
                        : 'bg-qz-bg dark:bg-[#2E3856] text-qz-text-light hover:text-qz-yellow hover:bg-qz-yellow/10'
                    }`}
                  >
                    <Star size={18} className={isBookmarked ? 'fill-white' : ''} />
                  </button>
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-qz-bg dark:bg-[#2E3856] flex items-center justify-center transition-transform peer-open:rotate-180">
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 -rotate-90" />
                  </div>
                </div>

                <details className="qz-card group overflow-hidden transition-all duration-300 open:ring-2 open:ring-qz-blue/20">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <div className="flex-grow pr-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-qz-blue/10 text-qz-blue text-[9px] font-black rounded uppercase tracking-wider">
                          {bookmark.categoryName}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-qz-text dark:text-white line-clamp-2 leading-snug group-hover:text-qz-blue transition-colors max-w-[90%]">
                        {bookmark.content}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 opacity-0">
                      <div className="p-2.5">
                        <Star size={18} />
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10">
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 -rotate-90" />
                      </div>
                    </div>
                  </summary>
                
                <div className="px-6 md:px-8 pb-8 pt-2 border-t border-qz-border dark:border-[#2E3856] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-6">
                    {/* Options */}
                    <div className="grid grid-cols-1 gap-3">
                      {Array.isArray(bookmark.options) && bookmark.options.map((opt, oIdx) => {
                        const isCorrect = opt === bookmark.answer
                        
                        let optClass = "flex items-center gap-3 p-4 rounded-xl border-2 font-bold text-sm md:text-[15px] "
                        if (isCorrect) {
                          optClass += "border-qz-success bg-qz-success/5 text-qz-success ring-1 ring-qz-success/20"
                        } else {
                          optClass += "border-qz-border dark:border-[#2E3856] opacity-60"
                        }

                        return (
                          <div key={oIdx} className={optClass}>
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                              isCorrect ? 'bg-qz-success text-white' : 'bg-qz-bg dark:bg-[#2E3856] text-qz-text-light'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && <CheckCircle2 size={16} className="text-qz-success" />}
                          </div>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="bg-qz-blue/5 dark:bg-[#2E3856] rounded-2xl p-6 border border-qz-blue/10">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-qz-blue mb-3">
                        <BookOpen size={12} /> 
                        <span>Explanation / 解説</span>
                      </div>
                      <p className="text-sm md:text-[15px] font-bold text-qz-text dark:text-white leading-relaxed italic">
                        {bookmark.explanation || '解説はまだありません。'}
                      </p>
                    </div>
                  </div>
                </div>
              </details>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
