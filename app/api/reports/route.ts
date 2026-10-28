import { NextRequest, NextResponse } from 'next/server';
import { getReports, createReport } from '@/lib/db';
import { CreateReportInput } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const reporter = searchParams.get('reporter') || undefined;
    const date = searchParams.get('date') || undefined;

    const { reports, source } = await getReports({
      search,
      category,
      reporter,
      date,
    });

    return NextResponse.json({
      success: true,
      reports,
      source,
      count: reports.length,
      storageNote:
        source === 'neon'
          ? 'Neon PostgreSQLから取得しました'
          : '【デモ動作】Neon未接続のためメモリ内デモDBから取得しました',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 入力バリデーション
    const { reporterName, destination, visitDate, comment, photos, category, status } = body;

    if (!reporterName || typeof reporterName !== 'string' || !reporterName.trim()) {
      return NextResponse.json(
        { success: false, error: '報告者名を入力してください' },
        { status: 400 }
      );
    }

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return NextResponse.json(
        { success: false, error: '訪問先を入力してください' },
        { status: 400 }
      );
    }

    if (!visitDate || typeof visitDate !== 'string' || !visitDate.trim()) {
      return NextResponse.json(
        { success: false, error: '訪問日を選択してください' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return NextResponse.json(
        { success: false, error: '報告内容（コメント）を入力してください' },
        { status: 400 }
      );
    }

    const photoList = Array.isArray(photos) ? photos.slice(0, 3) : [];

    const input: CreateReportInput = {
      reporterName: reporterName.trim(),
      destination: destination.trim(),
      visitDate: visitDate.trim(),
      comment: comment.trim(),
      photos: photoList,
      category: category || '定期巡回',
      status: status || '完了',
    };

    const { report, source } = await createReport(input);

    return NextResponse.json({
      success: true,
      report,
      source,
      message:
        source === 'neon'
          ? 'Neon PostgreSQLに報告を保存しました'
          : '【デモ動作】Neon未接続のため、デモストレージに保存しました。ブラウザ再読み込み時も開発サーバー内で保持されます。',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || '報告の保存に失敗しました' },
      { status: 500 }
    );
  }
}
