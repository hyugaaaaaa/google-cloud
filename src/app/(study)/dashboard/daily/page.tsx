import { createClient } from '@/lib/supabase/server'
import { DailyChallengeClient } from './DailyChallengeClient'
import { resolvePlanTier } from '@/lib/feature-gates'

export default async function DailyChallengePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all categories
  const { data: categories } = await supabase.from('categories').select('id, name').order('id')
  
  // Get all questions
  const { data: allQuestions } = await supabase
    .from('questions')
    .select(`
      id,
      category_id,
      content,
      options,
      answer,
      explanation,
      explanation_why_correct,
      explanation_why_others_wrong,
      related_concepts,
      difficulty,
      is_active,
      created_at
    `)
    .eq('is_active', true)
  
  if (!categories || !allQuestions) {
    return <div>データを読み込めませんでした。</div>
  }

  // Deterministic selection based on date
  // We use JST date to reset at 24:00 JST
  const now = new Date()
  const jstDate = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now).replace(/\//g, '-') // YYYY-MM-DD

  // Seed-based random selection
  const seed = jstDate.split('-').join('') // e.g., 20260418
  
  const dailyQuestions = categories.map(cat => {
    const catQuestions = allQuestions.filter(q => q.category_id === cat.id)
    if (catQuestions.length === 0) return null
    
    // Simple deterministic random index
    const seedNum = parseInt(seed)
    // Use cat index to vary the offset
    const catIdx = categories.findIndex(c => c.id === cat.id)
    const index = (seedNum + catIdx * 13) % catQuestions.length
    
    const q = catQuestions[index]
    return {
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }
  }).filter(q => q !== null)

  let isCompleted = false
  let initialBookmarkedIds: string[] = []
  let streak = 0
  let xp = 0
  let level = 1
  let planTier = resolvePlanTier(null)

  if (user) {
    // Check if already completed today
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    
    const { data: existingHistories } = await supabase
      .from('histories')
      .select('id')
      .eq('user_id', user.id)
      .eq('study_mode', 'daily')
      .gte('created_at', startOfDay.toISOString())

    isCompleted = !!(existingHistories && existingHistories.length >= 6)

    const { data: bookmarkData } = await supabase
      .from('bookmarks')
      .select('question_id')
      .eq('user_id', user.id)
    
    initialBookmarkedIds = (bookmarkData || []).map(b => b.question_id)

    // プロフィールを取得（streak用）
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count, xp, level, plan_tier')
      .eq('id', user.id)
      .single()
    
    streak = profile?.streak_count || 0
    xp = profile?.xp || 0
    level = profile?.level || 1
    planTier = resolvePlanTier(profile?.plan_tier)
  }

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg text-qz-text dark:text-qz-text">
      <DailyChallengeClient 
        questions={dailyQuestions} 
        userEmail={user?.email || ''} 
        streak={streak}
        isCompleted={isCompleted}
        dateString={jstDate}
        initialBookmarkedIds={initialBookmarkedIds}
        xp={xp}
        level={level}
        planTier={planTier}
      />
    </div>
  )
}
