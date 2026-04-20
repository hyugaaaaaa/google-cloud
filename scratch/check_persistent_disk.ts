import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://crneyaypvwajykafwade.supabase.co',
  'sb_publishable_wuni7zNUoNZa3B5qNUcBQA_wDiQ57x-'
)

async function checkQuestion() {
  const { data, error } = await supabase
    .from('questions')
    .select('id,content,options,answer,explanation')
    .ilike('content', '%Persistent Disk%')

  if (error) {
    console.error('Error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('Question not found.')
    return
  }

  for (const q of data) {
    console.log('=== Question ===')
    console.log('ID:', q.id)
    console.log('Content:', q.content)
    const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    opts.forEach((opt: string, i: number) => {
      const label = String.fromCharCode(65 + i)
      const isAnswer = opt === q.answer
      console.log(`  ${label}: ${opt}${isAnswer ? ' ← [CURRENT ANSWER]' : ''}`)
    })
    console.log('Explanation:', q.explanation)
    console.log()
  }
}

checkQuestion()
