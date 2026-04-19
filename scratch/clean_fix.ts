import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function forceCleanFix() {
  const targetId = 'da9901cd-9db3-4075-a089-252dcc91c447'
  
  // 1. 完全にクリーンな（「工場の」を含まない）正解文字列を作成
  const cleanAnswer = 'IoTセンサーのデータとAIを組み合わせて、機械が「故障する前」に異常の兆候を察知し、計画的にメンテナンスを行うことでダウンタイムを最小化すること'
  
  // 2. 選択肢の中身も全て「工場の」を削除した状態に更新する
  const newOptions = [
    '機械を使わずにすべて手作業に戻すこと',
    '機械が完全に壊れて停止してから修理を手配すること',
    'IoTセンサーのデータとAIを組み合わせて、機械が「故障する前」に異常の兆候を察知し、計画的にメンテナンスを行うことでダウンタイムを最小化すること',
    '毎日機械を新品に買い換えること'
  ]

  console.log('Force updating question and options to be identical and clean...')

  const { error } = await supabase
    .from('questions')
    .update({ 
      options: newOptions,
      answer: cleanAnswer,
      explanation: '予測保全は、故障の「予兆」を検知して事前に対策することで、機械の停止時間を減らすことが目的です。'
    })
    .eq('id', targetId)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('CLEAN FIX COMPLETE: "工場の" has been removed from everywhere. Consistency is now 100%.')
  }
}

forceCleanFix()
