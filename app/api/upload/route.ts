import { NextRequest, NextResponse } from 'next/server';
import { uploadPhotoToStorage } from '@/lib/storage';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '写真ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック (上限10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: '写真サイズは10MB以内である必要があります' },
        { status: 400 }
      );
    }

    // MIMEタイプ検証
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpe?g|png|webp|gif|heic)$/i)) {
      return NextResponse.json(
        { success: false, error: '対応している画像形式はJPEG, PNG, WebP, HEICのみです' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadPhotoToStorage(
      buffer,
      file.name || 'field_photo.jpg',
      file.type || 'image/jpeg'
    );

    return NextResponse.json({
      success: true,
      photo: result.photo,
      isMock: result.isMock,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[Upload Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || '写真のアップロード処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
