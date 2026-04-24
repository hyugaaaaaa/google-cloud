import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CDL Category Explanations',
  description: 'Google Cloud CDL の主要カテゴリ別に、学習観点と得点のコツを解説します。',
}

const categories = [
  {
    title: 'デジタル・トランスフォーメーション',
    points: ['クラウド導入のビジネス価値', 'CapEx/OpExの違い', '変革のユースケース設計'],
  },
  {
    title: 'データとイノベーション',
    points: ['BigQuery / Storage / Pub/Subの役割分担', '分析基盤の選定基準', 'データ活用の組織設計'],
  },
  {
    title: 'インフラとアプリの近代化',
    points: ['IaaS/PaaS/Serverlessの使い分け', '可用性設計（リージョン/ゾーン）', 'モダンなデプロイ戦略'],
  },
  {
    title: 'AIと機械学習',
    points: ['Vertex AIの基本ユースケース', '事前学習モデル活用', 'ビジネス課題とAI適用判断'],
  },
  {
    title: 'セキュリティと信頼性',
    points: ['IAM最小権限', '暗号化と鍵管理', 'SLO/SLA/エラーバジェット'],
  },
  {
    title: 'コスト管理と運用',
    points: ['課金レポートと予算アラート', 'Recommender活用', 'FinOpsの基本原則'],
  },
]

export default function CategoryExplanationsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <section className="mb-8">
        <h1 className="text-4xl font-black tracking-tight">CDL Category Explanations</h1>
        <p className="mt-3 text-sm font-bold text-qz-text-light">
          カテゴリごとの学習観点を先に押さえると、問題演習の理解速度が大きく上がります。
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((category) => (
          <article key={category.title} className="qz-card p-6">
            <h2 className="text-xl font-black">{category.title}</h2>
            <ul className="mt-4 space-y-2 text-sm font-bold text-qz-text-light">
              {category.points.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  )
}
