import { ReportPhoto } from './types';

export interface UploadResult {
  photo: ReportPhoto;
  isMock: boolean;
  message: string;
}

/**
 * HStorage または デモストレージへの写真アップロード処理
 * サーバーサイド (API Routes) で実行され、クライアントに機密キーを露出しません。
 */
export async function uploadPhotoToStorage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  const endpoint = process.env.HSTORAGE_ENDPOINT;
  const apiKey = process.env.HSTORAGE_API_KEY;
  const bucketId = process.env.HSTORAGE_BUCKET_ID;
  const publicBaseUrl = process.env.HSTORAGE_PUBLIC_URL;

  const uniqueId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const ext = fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
  const storageKey = `reports/${new Date().toISOString().slice(0, 10)}/${uniqueId}.${ext}`;

  // 1. 本番: HStorageの環境変数が設定されている場合
  if (endpoint && apiKey) {
    try {
      // HStorage REST API 仕様に合わせたリクエスト
      // (マルチパートまたはバイナリストリームPUT)
      const uploadUrl = endpoint.endsWith('/')
        ? `${endpoint}upload`
        : `${endpoint}/upload`;

      const formData = new FormData();
      const uint8 = new Uint8Array(fileBuffer);
      const blob = new Blob([uint8], { type: mimeType });
      formData.append('file', blob, fileName);
      if (bucketId) {
        formData.append('bucket', bucketId);
      }
      formData.append('key', storageKey);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'X-Storage-Key': storageKey,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        const resolvedUrl =
          data?.url ||
          (publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, '')}/${storageKey}` : null) ||
          `${uploadUrl}/${data?.id || uniqueId}`;

        return {
          photo: {
            id: data?.id || uniqueId,
            name: fileName,
            url: resolvedUrl,
            storageKey: data?.key || storageKey,
            size: fileBuffer.length,
            mimeType,
            uploadedAt: new Date().toISOString(),
            isMockStorage: false,
          },
          isMock: false,
          message: 'HStorageへ正常にアップロードされました',
        };
      } else {
        const errText = await response.text().catch(() => 'Upload failed');
        console.warn(`[HStorage API Warning] Status: ${response.status}: ${errText}. Falling back to demo mode.`);
      }
    } catch (err: unknown) {
      console.warn('[HStorage Connection Error]:', err);
    }
  }

  // 2. デモモード: HStorage未設定または接続失敗時のフォールバック
  // 実装できないAPI機能は仮実装であることを明示（偽装しない）
  const base64Data = fileBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  return {
    photo: {
      id: uniqueId,
      name: fileName,
      url: dataUrl,
      storageKey: `[DEMO-STORAGE]/${storageKey}`,
      size: fileBuffer.length,
      mimeType,
      uploadedAt: new Date().toISOString(),
      isMockStorage: true,
    },
    isMock: true,
    message: '【デモ動作】HStorage API未設定のため、メモリ内デモストレージに一時保存されました。本番ではHSTORAGE_ENDPOINTとHSTORAGE_API_KEYの設定が必要です。',
  };
}

export function isHStorageConfigured(): boolean {
  return Boolean(process.env.HSTORAGE_ENDPOINT && process.env.HSTORAGE_API_KEY);
}
