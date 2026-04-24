import type { Question } from '@/types/app.types'

type QueryError = {
  code?: string | null
  message?: string | null
} | null

type QueryResult<T> = {
  data: T | null
  error: QueryError
}

export type QuestionQueryMode = 'modern' | 'legacy'

export const QUESTION_SELECT_MODERN = `
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
`

export const QUESTION_SELECT_LEGACY = `
  id,
  category_id,
  content,
  options,
  answer,
  explanation,
  created_at
`

const EXTENDED_QUESTION_COLUMNS = [
  'explanation_why_correct',
  'explanation_why_others_wrong',
  'related_concepts',
  'difficulty',
  'is_active',
]

function shouldFallbackToLegacyQuestionSchema(error: QueryError): boolean {
  if (!error) return false

  if (error.code === '42703') {
    return true
  }

  const message = (error.message || '').toLowerCase()
  return EXTENDED_QUESTION_COLUMNS.some((column) => message.includes(column))
}

async function runQuestionQueryWithFallback<T>(
  run: (mode: QuestionQueryMode) => Promise<QueryResult<T>>,
): Promise<QueryResult<T> & { mode: QuestionQueryMode }> {
  const modernResult = await run('modern')
  if (!shouldFallbackToLegacyQuestionSchema(modernResult.error)) {
    return { ...modernResult, mode: 'modern' }
  }

  const legacyResult = await run('legacy')
  return { ...legacyResult, mode: 'legacy' }
}

export async function queryQuestionsArrayWithFallback<T>(
  run: (mode: QuestionQueryMode) => Promise<QueryResult<T[]>>,
) {
  return runQuestionQueryWithFallback(run)
}

export async function queryQuestionSingleWithFallback<T>(
  run: (mode: QuestionQueryMode) => Promise<QueryResult<T>>,
) {
  return runQuestionQueryWithFallback(run)
}

function parseOptions(options: unknown): string[] {
  if (Array.isArray(options)) {
    return options.filter((option): option is string => typeof option === 'string')
  }

  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options)
      return Array.isArray(parsed)
        ? parsed.filter((option): option is string => typeof option === 'string')
        : []
    } catch {
      return []
    }
  }

  return []
}

type RawQuestionRecord = {
  id: string
  category_id: string
  content: string
  options: unknown
  answer: string
  explanation?: string | null
  explanation_why_correct?: string | null
  explanation_why_others_wrong?: string | null
  related_concepts?: unknown
  difficulty?: 'easy' | 'medium' | 'hard' | null
  is_active?: boolean | null
  created_at: string
}

export function normalizeQuestionRecord(raw: RawQuestionRecord): Question {
  return {
    id: raw.id,
    category_id: raw.category_id,
    content: raw.content,
    options: parseOptions(raw.options),
    answer: raw.answer,
    explanation: raw.explanation || '',
    explanation_why_correct: raw.explanation_why_correct || null,
    explanation_why_others_wrong: raw.explanation_why_others_wrong || null,
    related_concepts: Array.isArray(raw.related_concepts)
      ? raw.related_concepts.filter((concept): concept is string => typeof concept === 'string')
      : [],
    difficulty: raw.difficulty || 'medium',
    is_active: raw.is_active !== false,
    created_at: raw.created_at,
  }
}
