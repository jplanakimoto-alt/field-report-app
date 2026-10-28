'use client';

import React from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';
import { ReportPhoto } from '@/lib/types';

interface PhotoLightboxProps {
  photo: ReportPhoto | null;
  onClose: () => void;
}

export default function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 text-zinc-200">
          <div className="truncate mr-4">
            <p className="text-sm font-medium text-white truncate">{photo.name}</p>
            <p className="text-xs text-zinc-400">
              ID: {photo.id} · {photo.size ? `${(photo.size / 1024).toFixed(1)} KB` : ''} ·{' '}
              {photo.isMockStorage ? 'デモストレージ' : 'HStorage保存'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={photo.url}
              target="_blank"
              rel="noopener noreferrer"
              download={photo.name}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="ダウンロード・新しいタブで開く"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image view */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-zinc-950 min-h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={photo.name}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded select-none"
          />
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-zinc-900 text-xs text-zinc-400 flex items-center justify-between border-t border-zinc-800">
          <span className="truncate">Key: {photo.storageKey}</span>
          <span>{new Date(photo.uploadedAt).toLocaleString('ja-JP')}</span>
        </div>
      </div>
    </div>
  );
}
