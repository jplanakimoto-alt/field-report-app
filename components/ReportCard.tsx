'use client';

import React from 'react';
import {
  Calendar,
  User,
  Building,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Camera,
  Maximize2,
  Database,
} from 'lucide-react';
import { FieldReport, ReportPhoto } from '@/lib/types';

interface ReportCardProps {
  report: FieldReport;
  onViewDetail: (report: FieldReport) => void;
  onEdit: (report: FieldReport) => void;
  onDelete: (id: string) => void;
  onPhotoClick: (photo: ReportPhoto) => void;
}

export default function ReportCard({
  report,
  onViewDetail,
  onEdit,
  onDelete,
  onPhotoClick,
}: ReportCardProps) {
  const statusColor = {
    完了: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    確認中: 'text-amber-700 bg-amber-50 border-amber-200',
    要対応: 'text-rose-700 bg-rose-50 border-rose-200',
  }[report.status] || 'text-zinc-700 bg-zinc-50 border-zinc-200';

  const statusDot = {
    完了: 'bg-emerald-500',
    確認中: 'bg-amber-500',
    要対応: 'bg-rose-500',
  }[report.status] || 'bg-zinc-400';

  return (
    <article className="group bg-white rounded-2xl border border-zinc-200/90 hover:border-zinc-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Header Info */}
      <div className="p-5 pb-3">
        {/* Top meta & status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{report.visitDate}</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>{report.category || '一般報告'}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${statusColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              {report.status}
            </span>
          </div>
        </div>

        {/* Destination Name */}
        <h3
          onClick={() => onViewDetail(report)}
          className="text-base font-bold text-zinc-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1 mb-1.5"
          title={report.destination}
        >
          {report.destination}
        </h3>

        {/* Reporter */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-3">
          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="font-medium text-zinc-700">{report.reporterName}</span>
          <span aria-hidden="true" className="text-zinc-300">·</span>
          <span className="text-[11px] text-zinc-400">
            {report.storageSource === 'neon' ? (
              <span className="text-emerald-700 inline-flex items-center gap-1">
                <Database className="w-3 h-3" /> Neon DB
              </span>
            ) : (
              <span className="text-zinc-500 inline-flex items-center gap-1">
                <Database className="w-3 h-3" /> デモDB
              </span>
            )}
          </span>
        </div>

        {/* Comment snippet */}
        <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
          {report.comment}
        </p>
      </div>

      {/* Photo Gallery (Max 3) */}
      {report.photos && report.photos.length > 0 && (
        <div className="px-5 py-2">
          <div
            className={`grid gap-2 ${
              report.photos.length === 1
                ? 'grid-cols-1'
                : report.photos.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }`}
          >
            {report.photos.map((photo, index) => (
              <div
                key={photo.id || index}
                onClick={() => onPhotoClick(photo)}
                className="group/photo relative aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 cursor-pointer border border-zinc-200/80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors flex items-center justify-center">
                  <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity drop-shadow-md" />
                </div>
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-xs font-mono">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Action Footer */}
      <div className="mt-3 px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
          <Camera className="w-3.5 h-3.5" />
          {report.photos?.length || 0} 枚添付
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewDetail(report)}
            className="px-2.5 py-1 text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/70 rounded-lg transition-colors"
          >
            詳細
          </button>
          <button
            onClick={() => onEdit(report)}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/70 rounded-lg transition-colors"
            title="編集"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(report.id)}
            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="削除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
