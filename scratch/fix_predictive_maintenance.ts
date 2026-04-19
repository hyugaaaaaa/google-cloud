import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function fixPredictiveMaintenance() {
  console.log('Searching for Predictive Maintenance question...')
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .ilike('content', '%予測保全%')
    .ilike('content', '%Predictive Maintenance%')

  if (error || !questions || questions.length === 0) {
    console.log('Question not found')
    return
  }

  const q = questions[0]
  console.log('Target Question ID:', q.id)

  // 正解となるべき選択肢を特定する（ダウンタイムの最小化、故障の予兆検知など）
  const correctOption = q.options.find(opt => 
    (opt.includes('故障') && opt.includes('前')) || 
    (opt.includes('ダウンタイム') && opt.includes('最小化')) ||
    (opt.includes('予兆') && opt.includes('検知'))
  )

  if (correctOption) {
    console.log('Identified correct option:', correctOption)
    
    const { error: updateError } = await supabase
      .from('questions')
      .update({ 
        answer: correctOption,
        explanation: '予測保全（Predictive Maintenance）は、IoTセンサーデータなどをAIで分析し、機器の故障の予兆を事前に検知する手法です。これにより、突然の故障による稼働停止（ダウンタイム）を防ぎ、計画的なメンテナンスを可能にします。'
      })
      .eq('id', q.id)

    if (updateError) {
      console.error('Update error:', updateError)
    } else {
      console.log('Successfully updated the Predictive Maintenance question!')
    }
  } else {
    console.log('Options found:', q.options)
  }
}

fixPredictiveMaintenance()
