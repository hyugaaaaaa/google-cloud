# Google Cloud Digital Leader (CDL) 資格対策アプリ

Google Cloud Digital Leader (CDL) 試験に向けた、モバイルフレンドリーな一問一答形式の学習Webアプリケーションです。忙しい社会人がスマホで隙間時間にサクッと学べることをコンセプトに設計されています。

## 🛠 技術スタック
- **フロントエンド:** Next.js 15 (App Router), React 19, Tailwind CSS
- **バックエンド / DB:** Supabase (PostgreSQL, GoTrue Auth)
- **インフラ・ホスティング:** Vercel (予定)
- **言語:** TypeScript

---

## 🚀 現在の進捗状況 (Phase 2完了)

本日のシステム開発にて、フロントエンドのUI構築から実際のデータベースとの統合、およびユーザー認証システムの基盤が完成しました。

### ✅ 実装済みの機能・コンポーネント (Phase 1 & Phase 2)
1. **学習ドメイン UI (`src/components/study`)**
   - `QuestionCard.tsx`: 問題文と選択肢をダイナミックにレンダリングし、解答状況に応じたスタイリング（正誤の色分けなど）を表示。
   - `ExplanationArea.tsx`: 解答後に表示される解説パネルと「次の問題へ」の進行機能。
   - `ProgressBar.tsx`: 全体の問題数に対する現在の進捗状況を視覚的に表示。
2. **データベーススキーマ (`supabase/migrations/`)**
   - `categories`, `questions`, `profiles`, `histories` の4テーブルの設計。
   - Row Level Security (RLS) を設定し、自分自身の履歴データのみアクセスできる安全な構造を採用。
3. **認証機能 (Supabase Auth)**
   - `login/page.tsx` および `register/page.tsx` を用いた認証UIの実装。
   - Next.js 15 の Server Actions (`src/app/(auth)/actions.ts`) を利用した安全なセッション処理。
   - Middleware (`src/middleware.ts`) による、未ログインユーザーの学習ページアクセスブロックと自動リダイレクト。
4. **実データ連携**
   - トップページにて、Supabaseに登録された `categories` を動的にFetchして表示。
   - 学習ページにて、選択されたカテゴリに紐づく問題を動的にFetch。
   - 解答完了時、バックグラウンドで `histories` テーブルに正誤情報を自動保存する処理を実装完了。

---

## 🏃 ローカル環境の立ち上げ方

開発を再開する際の手順です。

1. 依存関係のインストール（初回・更新時のみ）
   ```bash
   npm install
   ```
2. 環境変数の確認
   `.env.local` ファイルに以下のSupabaseの設定が記述されていることを確認してください。
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 開発用サーバーの起動
   ```bash
   npm run dev
   ```
   ブラウザで `http://localhost:3000` にアクセスしてください。

---

## 📝 次のステップ (今後の開発課題)
ここからの開発では、アプリの価値を高める「追加機能」や「UX改善」に取り組むことが可能です。

- `[ ]` **学習履歴・成績の表示機能**
  - ダッシュボード（マイページ）を作成し、`histories` テーブルのデータを集計して「正答率」や「苦手分野」を表示する。
- `[ ]` **模擬試験モードの追加**
  - 時間制限付きで、全カテゴリからランダムに出題されるモードを実装。
- `[ ]` **UI/UX のブラッシュアップ**
  - アニメーション（Frammer Motionなど）の追加や、ローディング状態の改善。
- `[ ]` **Vercel への本番デプロイ**

---
*最終更新日: 2026年4月*
