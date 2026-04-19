import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixQuestion() {
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .ilike('content', '%仮想マシンに接続するストレージとして%')

  if (error) {
    console.error('Error fetching question:', error)
    return
  }

  if (!questions || questions.length === 0) {
    console.log('Question not found')
    return
  }

  const q = questions[0]
  console.log('Current Question:', JSON.stringify(q, null, 2))

  // 正しい選択肢を見つける（通常、Persistent Disk = 長期, ローカルSSD = 一時的）
  // 選択肢を精査して、正しいものをanswerにセットする
  const correctOption = q.options.find(opt => 
    opt.includes('Persistent Disk') && opt.includes('長期間') && opt.includes('ローカル SSD') && opt.includes('一時的')
  )

  if (correctOption) {
    console.log('Found correct option:', correctOption)
    
    const { error: updateError } = await supabase
      .from('questions')
      .update({ 
        answer: correctOption,
        explanation: 'Persistent Disk（永続ディスク）は耐久性がありデータの長期保存に適していますが、ローカル SSD は仮想マシンのライフサイクルに依存するため、一時的なキャッシュや高速なI/Oが必要な作業データに適しています。'
      })
      .eq('id', q.id)

    if (updateError) {
      console.error('Update error:', updateError)
    } else {
      console.log('Successfully updated the question!')
    }
  } else {
    console.log('Could not find a valid correct option in the existing options.')
  }
}

fixQuestion()
