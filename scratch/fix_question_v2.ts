import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixQuestion() {
  console.log('Searching for the question...')
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .ilike('content', '%仮想マシンに接続するストレージとして%')

  if (error) {
    console.error('Error fetching question:', error)
    return
  }

  if (!questions || questions.length === 0) {
    console.log('Question not found. Trying a different search term...')
    // Try a shorter search term
    const { data: questions2 } = await supabase
      .from('questions')
      .select('*')
      .ilike('content', '%Persistent Disk%')
      .ilike('content', '%ローカル SSD%')
    
    if (!questions2 || questions2.length === 0) {
      console.log('Question still not found.')
      return
    }
    questions.push(...questions2)
  }

  const q = questions[0]
  console.log('Target Question ID:', q.id)
  console.log('Current Options:', q.options)

  // 正解となるべき選択肢を特定する（Persistent Disk = 長期保存、Local SSD = 一時的）
  // スクリーンショットではCかDにあるはずです。
  const correctOption = q.options.find(opt => 
    opt.includes('Persistent Disk') && (opt.includes('長期間') || opt.includes('永続')) && 
    opt.includes('ローカル SSD') && (opt.includes('一時的') || opt.includes('キャッシュ'))
  )

  if (correctOption) {
    console.log('Identified correct option:', correctOption)
    
    const { error: updateError } = await supabase
      .from('questions')
      .update({ 
        answer: correctOption,
        explanation: 'Persistent Disk（永続ディスク）は耐久性があり、仮想マシンを削除してもデータを保持できるため長期間の保存に適しています。一方、ローカル SSD は仮想マシンが停止または削除されるとデータが失われるため、一時的なキャッシュや高速なI/Oが必要な処理に適しています。'
      })
      .eq('id', q.id)

    if (updateError) {
      console.error('Update error:', updateError)
    } else {
      console.log('Successfully updated the question! The fix is now live.')
    }
  } else {
    console.log('Could not automatically identify the correct option. Please check the options manually.')
    console.log('Options are:', q.options)
  }
}

fixQuestion()
