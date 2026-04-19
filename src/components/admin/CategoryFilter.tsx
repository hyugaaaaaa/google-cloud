'use client'

import React from 'react'
import { Search } from 'lucide-react'

type Category = {
  id: string
  name: string
}

interface CategoryFilterProps {
  categories: Category[]
  initialQuery: string
  initialCategoryId: string
}

export function CategoryFilter({ categories, initialQuery, initialCategoryId }: CategoryFilterProps) {
  return (
    <form className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <div className="relative flex-1 md:w-80">
        <input 
          type="text"
          name="q"
          defaultValue={initialQuery}
          placeholder="問題を検索..."
          className="qz-input w-full pl-12 h-14"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-qz-text-light" size={20} />
      </div>
      
      <select 
        name="category"
        defaultValue={initialCategoryId}
        onChange={(e) => {
          const form = e.currentTarget.form;
          if (form) form.requestSubmit();
        }}
        className="qz-input h-14 px-4 bg-white dark:bg-[#2E3856] min-w-[200px]"
      >
        <option value="">全てのカテゴリ</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <button type="submit" className="hidden">検索</button>
    </form>
  )
}
