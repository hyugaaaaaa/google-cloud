import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugDB() {
  console.log('Connecting to:', supabaseUrl)
  
  // Check categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
  
  if (catError) {
    console.error('Error fetching categories:', catError)
  } else {
    console.log('Categories count:', categories?.length)
    console.log('Categories sample:', categories?.slice(0, 2))
  }

  // Check questions
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('id', { count: 'exact' })
    .limit(0)
  
  if (qError) {
    console.error('Error fetching questions:', qError)
  } else {
    console.log('Questions count:', questions?.length || 0)
  }
}

debugDB()
