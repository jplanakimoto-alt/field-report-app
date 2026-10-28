import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'FIELD REPORT - 写真付き現地報告アプリ',
  description: 'スマートフォンで撮影した写真とともに、訪問先・訪問日・報告内容を記録・管理できる現地報告アプリ。Neon PostgreSQLとHStorageストレージ連携に対応。',
  openGraph: {
    title: 'FIELD REPORT - 写真付き現地報告アプリ',
    description: 'スマートフォンで撮影した写真とともに、訪問先・訪問日・報告内容を記録・管理できる現地報告アプリ。Neon PostgreSQLとHStorageストレージ連携に対応。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FIELD REPORT - 写真付き現地報告アプリ',
    description: 'スマートフォンで撮影した写真とともに、訪問先・訪問日・報告内容を記録・管理できる現地報告アプリ。',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
