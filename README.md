# CloudMaster — Google Cloud CDL 資格対策アプリ

Google Cloud Digital Leader (CDL) 試験に向けた、モバイルフレンドリーな学習 Web アプリケーションです。
忙しい社会人がスマホで隙間時間に学べるよう、ゲストでも即座に問題を解き始めながら、登録後は学習履歴・苦手分析などの高度な機能が解放されるデザインになっています。

## 🛠 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| バックエンド / DB | Supabase (PostgreSQL + GoTrue Auth) |
| 状態管理 / データ取得 | React Server Components, Server Actions |
| ライブラリ | Framer Motion (アニメーション), Recharts (統計), Lucide (アイコン), Sonner (トースト) |
| ホスティング | Vercel |
| 言語 | TypeScript |

---

## ✅ 実装済み機能一覧

### 認証 & アクセス制御
- **ゲストモード**: アカウント不要でカテゴリ学習・模擬試験・デイリーチャレンジに挑戦可能
- **Supabase Auth**: メール/パスワード + Google OAuth による登録 & ログイン (`/login`, `/register`)
- **Middleware (`src/lib/supabase/middleware.ts`) によるルート保護**
  - ✅ ゲスト可: `/category/*`, `/mock-exam`, `/dashboard/daily`
  - 🔒 要ログイン: `/dashboard`, `/dashboard/mistakes`, `/bookmarks`

### 学習機能
- **カテゴリ別学習** (`/category/[categoryId]`): カテゴリを選んで 10 / 20 / 40 / 全問 から問題数を選択
- **模擬試験** (`/mock-exam`): 全問からランダム 20 問・15 分制限の本番形式
- **デイリーチャレンジ** (`/dashboard/daily`): 毎日リセットされる 6 問（カテゴリごとに 1 問）
- **ブックマーク機能**: 気になった問題をブックマーク → `/bookmarks` でまとめて復習
- **苦手問題の復習** (`/dashboard/mistakes`): 直近で間違えた問題をピックアップして再挑戦
- **個別問題レビュー** (`/review/[questionId]`): 特定の問題の詳細な解説と復習

### ダッシュボード（要ログイン）
- **Stats Overview**: 総解答数・正答率・連続学習日数（ストリーク）・本日の解答数
- **Activity Chart**: 週間アクティビティの棒グラフ
- **Achievement バッジ**: ストリーク・総問題数・満点カテゴリ・模擬試験完了などの実績
- **Category Performance**: カテゴリ別の正答率と弱点問題数を一覧表示
- **Recent Sessions**: 最近解いた問題の一覧と個別再挑戦リンク

### データベース (`supabase/migrations/`)
| テーブル | 用途 |
|---|---|
| `categories` | 学習カテゴリ（例: Compute, Storage …）|
| `questions` | 問題文・選択肢・正解・解説 |
| `profiles` | ユーザープロフィール・ストリーク情報 |
| `histories` | 解答履歴（RLS により本人のみアクセス可） |
| `bookmarks` | ブックマーク（RLS により本人のみアクセス可） |

### その他
- **PWA 対応**: インストール可能・オフラインバナー表示
- **SEO 最適化**: `sitemap.ts`, `robots.ts` による動的生成、メタデータの最適化
- **ダークモード**: システム設定に追従
- **Admin ページ** (`/admin/questions`): 特定ユーザーのみ問題の追加・編集・削除が可能

---

## 🏃 ローカル環境の立ち上げ方

```bash
# 1. 依存関係のインストール（初回・更新時のみ）
npm install

# 2. 環境変数の確認
# .env.local に以下を設定
# NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
# URL_ENCRYPTION_KEY=<32文字以上のランダム文字列>
# ADMIN_EMAILS=<admin1@example.com,admin2@example.com>   # 任意
# NEXT_PUBLIC_ADMIN_EMAILS=<admin1@example.com,admin2@example.com> # 任意（管理リンク表示用）

# 3. 開発サーバーの起動
npm run dev
# → http://localhost:3000 でアクセス
```

開発サーバーを停止するには `Ctrl + C` を押してください。

---

## 🚀 デプロイ (Vercel)

### 環境変数の設定（Vercel ダッシュボード）

Vercel の Project Settings → Environment Variables に以下を追加してください：

| キー | 説明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の匿名キー |
| `URL_ENCRYPTION_KEY` | URL 暗号化用シークレット（32文字以上） |
| `ADMIN_EMAILS` | 管理者メールの許可リスト（任意。カンマ区切り） |
| `NEXT_PUBLIC_ADMIN_EMAILS` | 管理リンク表示用の許可リスト（任意。カンマ区切り） |

Google OAuth を有効化する場合は、以下を設定してください。
- Supabase Dashboard `Authentication > Providers > Google` で Google Provider を有効化し、Google Client ID / Secret を登録
- Supabase Dashboard `Authentication > URL Configuration` の Redirect URLs に `https://<your-domain>/auth/callback`（ローカル開発は `http://localhost:3000/auth/callback`）を追加
- Google Cloud Console 側の OAuth クライアント「承認済みのリダイレクト URI」に Supabase の Callback URL（`https://<project-ref>.supabase.co/auth/v1/callback`）を登録

---

## 📁 主要なディレクトリ構成

```
src/
├── app/
│   ├── (auth)/          # ログイン・登録ページ
│   ├── (study)/         # 学習関連
│   │   ├── bookmarks/   # ブックマーク一覧
│   │   ├── category/    # カテゴリ別学習
│   │   ├── dashboard/   # ダッシュボード・デイリー・苦手問題
│   │   ├── mock-exam/   # 模擬試験
│   │   └── review/      # 問題レビュー
│   ├── admin/           # 管理者専用ページ
│   ├── layout.tsx       # 共通レイアウト（Header, Providers）
│   ├── loading.tsx      # グローバルローディング
│   ├── page.tsx         # トップページ
│   ├── robots.ts        # SEO: robots.txt
│   └── sitemap.ts       # SEO: sitemap.xml
├── components/
│   ├── admin/           # 管理者用コンポーネント
│   ├── common/          # Header, ThemeToggle, PWA 関連
│   ├── study/           # QuestionCard, ExplanationArea, ResultView…
│   └── dashboard/       # StatsOverview, ActivityChart, Achievements…
├── hooks/               # useQuiz, useMockExam, useDailyChallenge…
├── lib/
│   ├── supabase/        # Supabase クライアント・middleware
│   └── crypto.ts        # ID の暗号化・復号化
└── types/               # 共通型定義
```

---

## 🚀 デプロイ・更新フロー

変更を GitHub に push すると、Vercel によって自動的に本番環境へデプロイされます。

```bash
# 変更をコミットして本番環境に反映
git add .
git commit -m "fix: limit admin list and normalize text to resolve hydration error"
git push origin main
```

---

*最終更新日: 2026年4月24日*
