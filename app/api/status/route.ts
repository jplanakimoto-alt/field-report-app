import { NextResponse } from 'next/server';
import { getBackendStatus } from '@/lib/db';

export async function GET() {
  try {
    const status = await getBackendStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      {
        neonConfigured: false,
        neonConnected: false,
        hstorageConfigured: false,
        hstorageConnected: false,
        databaseUrlProvided: false,
        storageMode: 'demo',
        message: '接続ステータスの取得中にエラーが発生しました。',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
