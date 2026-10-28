'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, Server } from 'lucide-react';
import { BackendStatus } from '@/lib/types';

interface ConnectionBannerProps {
  backendStatus: BackendStatus | null;
  onOpenGuide: () => void;
}

export default function ConnectionBanner({
  backendStatus,
  onOpenGuide,
}: ConnectionBannerProps) {
  if (!backendStatus) return null;

  const isProduction =
    backendStatus.neonConnected && backendStatus.hstorageConnected;

  if (isProduction) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-100 text-emerald-900 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>本番稼働中:</strong> Neon PostgreSQL および HStorage に正常に接続されています。
            </span>
          </div>
          <button
            onClick={onOpenGuide}
            className="text-emerald-700 hover:text-emerald-900 underline font-medium text-[11px] shrink-0"
          >
            詳細を見る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 border-b border-amber-200/80 text-amber-900 px-4 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>デモモードで動作中:</strong>{' '}
            {!backendStatus.neonConnected && !backendStatus.hstorageConfigured
              ? 'Neon PostgreSQL & HStorage が未接続です。'
              : !backendStatus.neonConnected
              ? 'Neon PostgreSQL が未接続です。'
              : 'HStorage が未接続です。'}
            全機能（写真撮影・報告作成・編集・削除・検索）をメモリ内ストアで安全にお試しいただけます。
          </span>
        </div>
        <button
          onClick={onOpenGuide}
          className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-amber-950 underline shrink-0 cursor-pointer text-xs"
        >
          <span>接続設定手順マニュアル</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
