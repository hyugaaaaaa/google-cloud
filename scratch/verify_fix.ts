import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://crneyaypvwajykafwade.supabase.co',
  'sb_publishable_wuni7zNUoNZa3B5qNUcBQA_wDiQ57x-'
)

const QUESTION_ID = '877e468f-1dcc-4878-a41e-bf29e2814325'

async function checkAndFix() {
  const { data, error } = await supabase
    .from('questions')
    .select('id,content,options,answer,explanation')
    .eq('id', QUESTION_ID)
    .single()

  if (error || !data) {
    console.error('Fetch error:', error)
    return
  }

  const opts = typeof data.options === 'string' ? JSON.parse(data.options) : data.options
  console.log('=== 現在の状態 ===')
  opts.forEach((opt: string, i: number) => {
    const label = String.fromCharCode(65 + i)
    const isAnswer = opt === data.answer
    console.log(`  ${label}: ${opt}${isAnswer ? ' ← [ANSWER ✅]' : ''}`)
  })
  console.log()
  console.log('Explanation:', data.explanation)
}

checkAndFix()
