import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function listAllPredictiveMaintenance() {
  console.log('Listing ALL Predictive Maintenance related questions...')
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .ilike('content', '%予測保全%')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${questions.length} questions.`)
  questions.forEach((q, i) => {
    console.log(`\n[ID: ${q.id}]`)
    console.log('Content:', q.content)
    console.log('Options:', q.options)
    console.log('Answer:', q.answer)
  })
}

listAllPredictiveMaintenance()
