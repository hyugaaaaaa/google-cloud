import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CDL Study Guide',
  description: 'CloudMaster の Google Cloud CDL 学習ガイド。4週間の推奨学習プランを紹介します。',
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'CDL合格に必要な学習期間は？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '目安は2〜6週間です。クラウド経験が少ない場合は4週間以上の計画が推奨です。',
      },
    },
    {
      '@type': 'Question',
      name: '毎日どのくらい解くべき？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '1日15〜25問を目標にすると、理解と定着のバランスが取りやすくなります。',
      },
    },
  ],
}

export default function StudyGuidePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <article className="prose prose-slate max-w-none">
        <h1>Google Cloud CDL Study Guide</h1>
        <p>CloudMasterでの推奨学習フローを、4週間プランでまとめました。</p>

        <h2>Week 1: 基礎把握</h2>
        <ul>
          <li>カテゴリ学習を毎日10〜20問</li>
          <li>間違えた問題はすぐにブックマーク</li>
          <li>説明を読み、関連概念まで確認</li>
        </ul>

        <h2>Week 2: 応用理解</h2>
        <ul>
          <li>カテゴリ横断で20問セット</li>
          <li>Daily Challengeを毎日完了</li>
          <li>弱点カテゴリを重点復習</li>
        </ul>

        <h2>Week 3: 実戦</h2>
        <ul>
          <li>Mock Examを実施し、時間配分を最適化</li>
          <li>Review incorrect only で再学習</li>
          <li>正答率70%以上を目標に</li>
        </ul>

        <h2>Week 4: 仕上げ</h2>
        <ul>
          <li>高頻出カテゴリを短時間で回す</li>
          <li>弱点分析レコメンドに従って最終調整</li>
          <li>試験前日は軽い復習のみ</li>
        </ul>
      </article>
    </main>
  )
}
