import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'アカウント登録',
  description: 'CloudMaster に新しくアカウントを登録して、Google Cloud マスターへの第一歩を踏み出しましょう。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/register',
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
