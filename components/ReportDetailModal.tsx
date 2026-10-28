'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  Building,
  Tag,
  CheckCircle2,
  Share2,
  Copy,
  Printer,
  Edit2,
  Trash2,
  Maximize2,
  Database,
  ExternalLink,
  Check,
} from 'lucide-react';
import { FieldReport, ReportPhoto } from '@/lib/types';

interface ReportDetailModalProps {
  report: FieldReport | null;
  onClose: () => void;
  onEdit: (report: FieldReport) => void;
  onDelete: (id: string) => void;
  onPhotoClick: (photo: ReportPhoto) => void;
}

export default function ReportDetailModal({
  report,
  onClose,
  onEdit,
  onDelete,
  onPhotoClick,
}: ReportDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const handleCopyText = async () => {
    const text = `【現地報告】${report.destination}
訪問日: ${report.visitDate}
報告者: ${report.reporterName}
区分: ${report.category} / 状態: ${report.status}
写真枚数: ${report.photos?.length || 0}枚

【報告内容】
${report.comment}
`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const statusColor = {
    完了: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    確認中: 'text-amber-700 bg-amber-50 border-amber-200',
    要対応: 'text-rose-700 bg-rose-50 border-rose-200',
  }[report.status] || 'text-zinc-700 bg-zinc-50 border-zinc-200';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70 print:hidden">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="font-mono text-zinc-400">ID: {report.id}</span>
            <span aria-hidden="true">·</span>
            {report.storageSource === 'neon' ? (
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                <Database className="w-3 h-3" /> Neon PostgreSQL 保存済
              </span>
            ) : (
              <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                <Database className="w-3 h-3" /> デモDB (Neon未接続)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              title="報告文をコピー"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'コピー完了' : '報告をコピー'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              title="印刷 / PDF出力"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Title & Status */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-snug">
                {report.destination}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border shrink-0 ${statusColor}`}>
                {report.status}
              </span>
            </div>

            {/* Metadata Bar */}
            <div className="mt-3 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-zinc-500 border-b border-zinc-100 pb-3">
              <span className="flex items-center gap-1 text-zinc-700">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                訪問日: <strong className="font-semibold text-zinc-800">{report.visitDate}</strong>
              </span>
              <span aria-hidden="true" className="text-zinc-300">·</span>
              <span className="flex items-center gap-1 text-zinc-700">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                報告者: <strong className="font-semibold text-zinc-800">{report.reporterName}</strong>
              </span>
              <span aria-hidden="true" className="text-zinc-300">·</span>
              <span className="flex items-center gap-1 text-zinc-700">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                区分: <strong className="font-semibold text-zinc-800">{report.category}</strong>
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              報告内容・所見
            </h4>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
              {report.comment}
            </div>
          </div>

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                現場写真 ({report.photos?.length || 0}枚)
              </h4>
              <span className="text-[11px] text-zinc-400">タップして高画質拡大</span>
            </div>

            {report.photos && report.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {report.photos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="group bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden p-2 flex flex-col justify-between"
                  >
                    <div
                      onClick={() => onPhotoClick(photo)}
                      className="relative aspect-4/3 w-full bg-zinc-900 rounded-lg overflow-hidden cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                      </div>
                      <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-zinc-700 truncate font-medium" title={photo.name}>
                      {photo.name}
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                      <span>{photo.size ? `${(photo.size / 1024).toFixed(0)} KB` : ''}</span>
                      <span className={photo.isMockStorage ? 'text-amber-600' : 'text-emerald-600'}>
                        {photo.isMockStorage ? 'デモ保存' : 'HStorage'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">写真は添付されていません</p>
            )}
          </div>

          {/* Timestamps */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
            <span>作成日時: {new Date(report.createdAt).toLocaleString('ja-JP')}</span>
            <span>更新日時: {new Date(report.updatedAt).toLocaleString('ja-JP')}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-6 py-4 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between print:hidden">
          <button
            onClick={() => onDelete(report.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            報告を削除
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(report);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              報告を編集
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-2xs"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
