import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'What Is Google Cloud CDL',
  description:
    'Google Cloud Digital Leader (CDL) 試験の概要、対象者、出題領域、学習の進め方をわかりやすく解説します。',
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'What Is Google Cloud Digital Leader (CDL)?',
  description:
    'Google Cloud Digital Leader (CDL) の試験概要と学習戦略を解説するガイド。',
  author: {
    '@type': 'Organization',
    name: 'CloudMaster Team',
  },
}

export default function WhatIsGoogleCloudCDLPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <article className="prose prose-slate max-w-none">
        <h1>What Is Google Cloud Digital Leader (CDL)?</h1>
        <p>
          Google Cloud Digital Leader (CDL) は、クラウドの基礎、Google Cloud の主要サービス、
          ビジネス課題への適用力を問うエントリー向け資格です。
        </p>
        <h2>試験で問われること</h2>
        <ul>
          <li>クラウド導入の価値（俊敏性、コスト最適化、信頼性）</li>
          <li>Google Cloud の主要サービス理解（Compute、Storage、Data、AI）</li>
          <li>セキュリティ、運用、組織導入の基本</li>
        </ul>
        <h2>こんな人におすすめ</h2>
        <ul>
          <li>クラウド案件に関わるビジネス職・非エンジニア職</li>
          <li>GCPの全体像を短期間で掴みたい初学者</li>
          <li>チームで共通言語としてクラウド基礎を揃えたい方</li>
        </ul>
        <h2>最短で合格する学習ステップ</h2>
        <ol>
          <li>カテゴリ別に基礎知識を固める</li>
          <li>Daily Challenge で毎日の継続を作る</li>
          <li>Mock Exam で時間配分と弱点を確認する</li>
          <li>間違いのみ復習で苦手を潰す</li>
        </ol>
      </article>
    </main>
  )
}
