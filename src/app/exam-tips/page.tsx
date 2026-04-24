import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CDL Exam Tips',
  description: 'Google Cloud Digital Leader 試験で失点しやすいポイントと直前対策のコツ。',
}

export default function ExamTipsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <article className="prose prose-slate max-w-none">
        <h1>Google Cloud CDL Exam Tips</h1>

        <h2>1. 問題文の「要件」を先に見る</h2>
        <p>
          「コスト最優先」「運用負荷を下げたい」「短期導入」などの要件が正解選択肢を決めます。
          サービス暗記だけではなく、要件と選択肢の整合を評価することが重要です。
        </p>

        <h2>2. 紛らわしい選択肢は責務分界で切る</h2>
        <p>
          CDLでは、マネージドサービスを選ぶ判断が頻出します。
          自分で管理すべきか、Google Cloudに任せるべきかを責任共有モデルで整理しましょう。
        </p>

        <h2>3. 時間配分の目安を決める</h2>
        <p>
          Mock Examで、1問あたりに使う時間を計測しておくと本番の焦りを減らせます。
          難問で止まりすぎず、最後に見直し時間を残す設計が有効です。
        </p>

        <h2>4. 直前は「間違いのみ」復習</h2>
        <p>
          新規学習より、間違えた理由を潰す方がスコア改善に直結します。
          CloudMasterのReview incorrect onlyモードで、苦手を短時間で再確認してください。
        </p>
      </article>
    </main>
  )
}
