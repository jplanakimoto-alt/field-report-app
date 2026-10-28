import { NextRequest, NextResponse } from 'next/server';
import { getReportById, updateReport, deleteReport } from '@/lib/db';
import { UpdateReportInput } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await getReportById(id);

    if (!report) {
      return NextResponse.json(
        { success: false, error: '指定された報告が見つかりませんでした' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || '報告の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const input: UpdateReportInput = {};
    if (body.reporterName !== undefined) input.reporterName = String(body.reporterName).trim();
    if (body.destination !== undefined) input.destination = String(body.destination).trim();
    if (body.visitDate !== undefined) input.visitDate = String(body.visitDate).trim();
    if (body.comment !== undefined) input.comment = String(body.comment).trim();
    if (body.category !== undefined) input.category = body.category;
    if (body.status !== undefined) input.status = body.status;
    if (Array.isArray(body.photos)) {
      input.photos = body.photos.slice(0, 3);
    }

    const { report, source } = await updateReport(id, input);

    if (!report) {
      return NextResponse.json(
        { success: false, error: '更新対象の報告が見つかりませんでした' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
      source,
      message:
        source === 'neon'
          ? 'Neon PostgreSQLのデータを更新しました'
          : '【デモ動作】デモストレージ内の報告を更新しました',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || '報告の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteReport(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '削除対象の報告が見つかりませんでした' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '報告を正常に削除しました',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || '報告の削除に失敗しました' },
      { status: 500 }
    );
  }
}
