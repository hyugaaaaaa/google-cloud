import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'CloudMaster にログインして学習セットを作成・学習しましょう。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/login',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
