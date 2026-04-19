import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkQuestion() {
  console.log('Checking database for the question...')
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .ilike('content', '%予測保全%')

  if (error) {
    console.error('Database error:', error)
    return
  }

  if (!questions || questions.length === 0) {
    console.log('❌ Question NOT FOUND in DB.')
  } else {
    console.log('✅ Question FOUND in DB.')
    questions.forEach((q, i) => {
      console.log(`\n--- Question ${i+1} ---`)
      console.log('Content:', q.content)
      console.log('Answer:', q.answer)
      console.log('Options:', q.options)
      console.log('Explanation:', q.explanation)
    })
  }
}

checkQuestion()
