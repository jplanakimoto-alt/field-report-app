'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  Calendar,
  Building,
  User,
  FileText,
  Tag,
} from 'lucide-react';
import { FieldReport, ReportPhoto, ReportCategory, ReportStatus, BackendStatus } from '@/lib/types';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (report: FieldReport, isEdit: boolean) => void;
  editReport?: FieldReport | null;
  backendStatus?: BackendStatus | null;
}

const CATEGORIES: ReportCategory[] = [
  '定期巡回',
  '現地調査',
  '納品・設置',
  '点検・メンテナンス',
  '営業訪問',
  'トラブル・障害対応',
  'その他',
];

const STATUSES: { value: ReportStatus; label: string; color: string }[] = [
  { value: '完了', label: '完了', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: '確認中', label: '確認中', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: '要対応', label: '要対応', color: 'text-rose-700 bg-rose-50 border-rose-200' },
];

export default function ReportFormModal(props: ReportFormModalProps) {
  if (!props.isOpen) return null;

  return (
    <ReportFormInner
      key={props.editReport?.id || 'create_new'}
      {...props}
    />
  );
}

function ReportFormInner({
  onClose,
  onSubmitSuccess,
  editReport,
  backendStatus,
}: ReportFormModalProps) {
  const isEdit = Boolean(editReport);
  const today = new Date().toISOString().slice(0, 10);

  const [reporterName, setReporterName] = useState(editReport?.reporterName || '');
  const [destination, setDestination] = useState(editReport?.destination || '');
  const [visitDate, setVisitDate] = useState(editReport?.visitDate || today);
  const [category, setCategory] = useState<ReportCategory>(editReport?.category || '定期巡回');
  const [status, setStatus] = useState<ReportStatus>(editReport?.status || '完了');
  const [comment, setComment] = useState(editReport?.comment || '');
  const [photos, setPhotos] = useState<ReportPhoto[]>(editReport?.photos || []);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 写真アップロード処理
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - photos.length;
    if (remainingSlots <= 0) {
      setErrorMessage('写真は最大3枚まで添付可能です。不要な写真を削除してから追加してください。');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const uploadedPhotos: ReportPhoto[] = [];

      for (const file of filesToUpload) {
        // 10MB制限
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`「${file.name}」のサイズが10MBを超えています。`);
        }

        const formData = new FormData();
        formData.append('photo', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || '写真のアップロードに失敗しました');
        }

        uploadedPhotos.push(data.photo);
      }

      setPhotos((prev) => [...prev, ...uploadedPhotos].slice(0, 3));
    } catch (err: any) {
      setErrorMessage(err.message || '写真のアップロード中にエラーが発生しました');
    } finally {
      setIsUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 写真削除
  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // バリデーション
    if (!reporterName.trim()) {
      setErrorMessage('報告者名を入力してください');
      return;
    }
    if (!destination.trim()) {
      setErrorMessage('訪問先を入力してください');
      return;
    }
    if (!visitDate.trim()) {
      setErrorMessage('訪問日を選択してください');
      return;
    }
    if (!comment.trim()) {
      setErrorMessage('報告内容（コメント）を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isEdit ? `/api/reports/${editReport?.id}` : '/api/reports';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        reporterName: reporterName.trim(),
        destination: destination.trim(),
        visitDate: visitDate.trim(),
        category,
        status,
        comment: comment.trim(),
        photos,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '保存処理に失敗しました');
      }

      onSubmitSuccess(data.report, isEdit);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || '報告の送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNeonConnected = backendStatus?.neonConnected ?? false;
  const isHstorageConnected = backendStatus?.hstorageConnected ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-zinc-700" />
              {isEdit ? '現地報告を編集' : '新規 現地報告の作成'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              スマートフォンでの写真撮影と現場メモを素早く記録します
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* 報告先 & 報告者 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                報告者名 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="例: 山田 太郎"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-zinc-500" />
                訪問先・現場名 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="例: 株式会社ABC 新宿オフィス"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* 訪問日 & カテゴリ & ステータス */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                訪問日 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                報告区分
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                進捗ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* コメント・報告内容 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                コメント・報告内容 <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400">{comment.length} 文字</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="現地の作業内容、確認事項、機器の状態、次回アクションなどを詳しく入力してください..."
              rows={4}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900 placeholder:text-zinc-400 resize-y min-h-[90px]"
            />
          </div>

          {/* 写真アップロード（最大3枚） */}
          <div className="pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-zinc-600" />
                  現場写真（最大3枚まで）
                </label>
                <p className="text-[11px] text-zinc-500">
                  スマホのカメラで撮影するか、ライブラリから選択してください
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  photos.length >= 3
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {photos.length} / 3 枚
              </span>
            </div>

            {/* スマホカメラ / ライブラリボタン */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* スマホカメラ直接起動 */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={photos.length >= 3 || isUploading}
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <button
                type="button"
                disabled={photos.length >= 3 || isUploading}
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
              >
                <Camera className="w-4 h-4" />
                スマホカメラで撮影
              </button>

              {/* 写真ライブラリから選択 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={photos.length >= 3 || isUploading}
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <button
                type="button"
                disabled={photos.length >= 3 || isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed border border-zinc-200"
              >
                <ImageIcon className="w-4 h-4 text-zinc-600" />
                写真ライブラリから選択
              </button>

              {isUploading && (
                <div className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900" />
                  アップロード中...
                </div>
              )}
            </div>

            {/* 写真プレビューリスト */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {photos.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="relative group bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden p-2 flex flex-col justify-between"
                  >
                    <div className="relative aspect-4/3 w-full bg-zinc-900 rounded-lg overflow-hidden mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-600 px-0.5">
                      <span className="truncate max-w-[120px]" title={p.name}>
                        {p.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="写真を削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                      <span>{p.size ? `${(p.size / 1024).toFixed(0)} KB` : ''}</span>
                      <span
                        className={
                          p.isMockStorage ? 'text-amber-600' : 'text-emerald-600'
                        }
                      >
                        {p.isMockStorage ? 'デモストレージ' : 'HStorage'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-zinc-200 rounded-xl text-center bg-zinc-50/50">
                <UploadCloud className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                <p className="text-xs text-zinc-500">写真がまだ添付されていません（任意・最大3枚）</p>
              </div>
            )}
          </div>

          {/* 保存先の事前通知 */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-zinc-500 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-800">
                保存先ステータス:{' '}
                {isNeonConnected ? (
                  <span className="text-emerald-700 font-semibold">Neon PostgreSQL (本番DB)</span>
                ) : (
                  <span className="text-amber-700 font-semibold">デモメモリDB (Neon未接続)</span>
                )}{' '}
                / 写真:{' '}
                {isHstorageConnected ? (
                  <span className="text-emerald-700 font-semibold">HStorage (本番)</span>
                ) : (
                  <span className="text-amber-700 font-semibold">デモストレージ</span>
                )}
              </p>
              {!isNeonConnected && (
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  ※ DATABASE_URL未設定のためデモデータとして動作します。画面上のデータ操作（追加・編集・削除）は即座に確認できます。
                </p>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : isEdit ? (
                '更新を保存する'
              ) : (
                '現地報告を登録する'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
