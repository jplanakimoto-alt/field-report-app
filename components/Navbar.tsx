'use client';

import React from 'react';
import {
  Camera,
  Plus,
  Server,
  Database,
  Cloud,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { BackendStatus } from '@/lib/types';

interface NavbarProps {
  onOpenCreate: () => void;
  onOpenGuide: () => void;
  backendStatus: BackendStatus | null;
  reportCount: number;
}

export default function Navbar({
  onOpenCreate,
  onOpenGuide,
  backendStatus,
  reportCount,
}: NavbarProps) {
  const isNeonConnected = backendStatus?.neonConnected ?? false;
  const isHstorageConnected = backendStatus?.hstorageConnected ?? false;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-bold text-base shadow-xs">
            FR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-zinc-900 tracking-tight">
                FIELD REPORT
              </h1>
              <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                現地報告
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">
              写真付き現地報告・点検管理システム
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Badge */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100 transition-colors text-xs text-zinc-700"
            title="接続ステータス詳細・設定手順を表示"
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isNeonConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="hidden md:inline font-medium">
                {isNeonConnected ? 'Neon DB 接続中' : 'デモ動作中'}
              </span>
              <span className="md:hidden font-medium">
                {isNeonConnected ? 'Neon' : 'Demo'}
              </span>
            </div>
            <span className="text-zinc-300">|</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isHstorageConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="hidden md:inline font-medium">
                {isHstorageConnected ? 'HStorage' : 'デモストレージ'}
              </span>
              <span className="md:hidden font-medium">
                {isHstorageConnected ? 'HS' : 'Demo'}
              </span>
            </div>
          </button>

          {/* Guide Button */}
          <button
            onClick={onOpenGuide}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors shadow-2xs"
          >
            <Server className="w-3.5 h-3.5 text-zinc-500" />
            設定手順
          </button>

          {/* Create Button */}
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden xs:inline">新規報告を作成</span>
            <span className="xs:hidden">新規作成</span>
          </button>
        </div>
      </div>
    </header>
  );
}
