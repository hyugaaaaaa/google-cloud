import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function reFix() {
  const targetId = '877e468f-1dcc-4878-a41e-bf29e2814325'
  
  const { data: q } = await supabase
    .from('questions')
    .select('*')
    .eq('id', targetId)
    .single()

  if (!q) return

  // 確実に正しい知識の選択肢（インデックス2）を指定
  const correctOption = q.options[2] 
  console.log('Setting true correct option:', correctOption)

  const { error } = await supabase
    .from('questions')
    .update({ 
      answer: correctOption,
      explanation: 'Persistent Disk（永続ディスク）はネットワーク経由で接続されており、VMが削除されてもデータを保持できる「耐久性」が特徴です。一方、ローカル SSD は物理的にサーバーに直結されているため「最高速」ですが、VMが終了するとデータが消える「一時的」な性質を持ちます。'
    })
    .eq('id', targetId)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('RE-FIX COMPLETE: The correct answer is now properly set.')
  }
}

reFix()
