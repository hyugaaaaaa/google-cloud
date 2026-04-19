import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function finalizeFix() {
  const targetId = 'da9901cd-9db3-4075-a089-252dcc91c447'
  
  const { data: q } = await supabase
    .from('questions')
    .select('*')
    .eq('id', targetId)
    .single()

  if (!q) return

  // 選択肢の3番目（インデックス2）を正解として文字列を完全コピー
  const exactCorrectOption = q.options[2]
  console.log('Synchronizing answer with exact option string:', exactCorrectOption)

  const { error } = await supabase
    .from('questions')
    .update({ 
      answer: exactCorrectOption,
      explanation: '予測保全は故障の「予兆」を検知し、実際に壊れる前にメンテナンスを行うことで、無駄な停止時間をなくすことが目的です。'
    })
    .eq('id', targetId)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('SUCCESS: Answer and option are now perfectly synchronized.')
  }
}

finalizeFix()
