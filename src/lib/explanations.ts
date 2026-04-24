import type { Question } from '@/types/app.types';

export type StructuredExplanation = {
  whyCorrect: string;
  whyOthersWrong: string;
  relatedConcepts: string[];
};

function splitBySentences(text: string): string[] {
  return text
    .split(/[。.!?]\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function buildStructuredExplanation(question: Question): StructuredExplanation {
  const fallback = (question.explanation || '').trim();
  const sentences = splitBySentences(fallback);

  const whyCorrect =
    (question.explanation_why_correct || '').trim() ||
    sentences[0] ||
    `${question.answer} が要件を最も満たす選択肢です。`;

  const whyOthersWrong =
    (question.explanation_why_others_wrong || '').trim() ||
    sentences.slice(1).join('。 ').trim() ||
    '他の選択肢は要件の一部を満たしていても、コスト・運用性・責務分界のいずれかが不適切です。';

  const relatedConcepts =
    question.related_concepts && question.related_concepts.length > 0
      ? question.related_concepts
      : ['Google Cloud の責任共有モデル', 'コスト最適化', '運用ベストプラクティス'];

  return {
    whyCorrect,
    whyOthersWrong,
    relatedConcepts,
  };
}
