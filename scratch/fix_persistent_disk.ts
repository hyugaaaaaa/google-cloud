import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://crneyaypvwajykafwade.supabase.co',
  'sb_publishable_wuni7zNUoNZa3B5qNUcBQA_wDiQ57x-'
)

const QUESTION_ID = '877e468f-1dcc-4878-a41e-bf29e2814325'
const CORRECT_ANSWER = 'Persistent Disk はVMが停止・削除されてもデータが保持され耐久性が高いが、ローカル SSD はVMと物理的に結びついており最高速な反面、VM終了時にデータが消去される'
const EXPLANATION = 'Persistent Disk（永続ディスク）はネットワーク経由で接続されており、VMを停止・削除してもデータは保持されます。スナップショットや複数VMへのアタッチも可能で、一般的なストレージ用途に適しています。一方、ローカル SSD はVMのホストサーバーに物理的に直結されているため非常に高速ですが、VMが停止・削除されるとデータが失われます。そのため、一時的なキャッシュや高速なI/Oが必要なスクラッチ領域に使用します。'

async function fixAnswer() {
  console.log('Updating answer for question:', QUESTION_ID)

  const { error } = await supabase
    .from('questions')
    .update({
      answer: CORRECT_ANSWER,
      explanation: EXPLANATION
    })
    .eq('id', QUESTION_ID)

  if (error) {
    console.error('Update failed:', error)
    return
  }

  console.log('✅ Answer updated successfully!')

  // 確認
  const { data } = await supabase
    .from('questions')
    .select('id,answer,explanation')
    .eq('id', QUESTION_ID)
    .single()

  console.log('Current answer:', data?.answer)
  console.log('Current explanation:', data?.explanation)
}

fixAnswer()
