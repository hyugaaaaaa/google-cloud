import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase
    .from('histories')
    .select(`
      is_correct,
      questions (
        category_id,
        categories (
          name
        )
      )
    `)
    .limit(1)
  
  console.log(JSON.stringify(data, null, 2))
  console.log('Error:', error)
}
test()
