'use client';

import React, { useState } from 'react';
import {
  X,
  Database,
  Cloud,
  Server,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Globe,
  Terminal,
} from 'lucide-react';
import { BackendStatus } from '@/lib/types';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendStatus: BackendStatus | null;
  onRefreshStatus: () => Promise<void>;
}

export default function SetupGuideModal({
  isOpen,
  onClose,
  backendStatus,
  onRefreshStatus,
}: SetupGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'neon' | 'hstorage' | 'vercel'>('status');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshStatus();
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-zinc-700" />
              Neon & HStorage 接続設定・運用マニュアル
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              本番環境（Neon PostgreSQL / HStorage / Vercel）への接続手順
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-zinc-200 px-6 gap-2 bg-zinc-50/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Server className="w-4 h-4" />
            接続状況確認
          </button>
          <button
            onClick={() => setActiveTab('neon')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'neon'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Database className="w-4 h-4" />
            ① Neon PostgreSQL設定
          </button>
          <button
            onClick={() => setActiveTab('hstorage')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hstorage'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Cloud className="w-4 h-4" />
            ② HStorage写真保存設定
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vercel'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            ③ Vercelデプロイ手順
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-sm text-zinc-700">
          {/* TAB 1: 接続状況確認 */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm">現在のシステム稼働ステータス</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    環境変数の設定状況とサーバー側接続状態です
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  接続テスト再実行
                </button>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Neon DB Card */}
                <div
                  className={`p-4 rounded-xl border ${
                    backendStatus?.neonConnected
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-zinc-600" />
                      Neon PostgreSQL
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        backendStatus?.neonConnected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {backendStatus?.neonConnected ? '● 接続完了' : '▲ 未接続 (デモ動作)'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {backendStatus?.neonConnected
                      ? 'Neon PostgreSQLに接続中。報告データはクラウドDBへ永続保存されています。'
                      : 'DATABASE_URL が未設定です。現在はメモリ内デモDBで動作しています。'}
                  </p>
                </div>

                {/* HStorage Card */}
                <div
                  className={`p-4 rounded-xl border ${
                    backendStatus?.hstorageConfigured
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-zinc-600" />
                      HStorage 写真ストレージ
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        backendStatus?.hstorageConfigured
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {backendStatus?.hstorageConfigured ? '● 設定済' : '▲ 未設定 (デモ保存)'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {backendStatus?.hstorageConfigured
                      ? 'HStorage API連携が設定されています。撮影写真は安全にクラウド保管されます。'
                      : 'HSTORAGE_API_KEY が未設定です。現在はデモ用画像データとして一時保持されています。'}
                  </p>
                </div>
              </div>

              {/* 偽装防止に関する透明性の通知 */}
              <div className="p-4 bg-zinc-900 text-zinc-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  仕様と実装透明性についてのお約束
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  本アプリは、外部サービス接続が未設定の状態でも画面デザインや全操作（写真撮影、報告登録、編集、削除、検索）を安全に確認できるよう構築されています。
                  <strong>未設定の外部サービスに「保存完了した」と偽装することはありません。</strong>
                  本番運用へ切り替える際は、上部タブの手順に従ってNeonおよびHStorageの環境変数を設定してください。
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Neon PostgreSQL 設定 */}
          {activeTab === 'neon' && (
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 text-base">
                ① Neon PostgreSQL 接続手順
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Neon（https://neon.tech）はサーバーレスPostgreSQLサービスです。無料枠があり、数秒でデータベースを作成できます。
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <h4 className="font-semibold text-xs text-zinc-900 mb-1">
                    ステップ 1: Neonプロジェクトの作成
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-zinc-600 space-y-1">
                    <li>Neon公式サイト（https://console.neon.tech）にログイン</li>
                    <li>「New Project」をクリックしてプロジェクトを作成（リージョンは日本最寄りの ap-southeast-1 や us-east-1 などを選択）</li>
                    <li>ダッシュボードに表示される「Connection Details」を確認</li>
                  </ol>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <h4 className="font-semibold text-xs text-zinc-900 mb-1">
                    ステップ 2: 接続文字列（DATABASE_URL）のコピー
                  </h4>
                  <p className="text-xs text-zinc-600 mb-2">
                    「Connection string」から以下の形式のURLをコピーします:
                  </p>
                  <div className="bg-zinc-900 text-zinc-100 p-2.5 rounded-lg text-xs font-mono flex items-center justify-between">
                    <span className="truncate mr-2">
                      postgresql://user:password@ep-sample-123.region.neon.tech/neondb?sslmode=require
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          'postgresql://user:password@ep-sample-123.region.neon.tech/neondb?sslmode=require',
                          'sample_db'
                        )
                      }
                      className="text-zinc-400 hover:text-white shrink-0"
                    >
                      {copiedKey === 'sample_db' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <h4 className="font-semibold text-xs text-zinc-900 mb-1">
                    ステップ 3: テーブル自動生成について
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    本アプリのサーバー層には自動マイグレーション機能（<code>CREATE TABLE IF NOT EXISTS field_reports</code>）が組み込まれているため、
                    <code>DATABASE_URL</code> を設定してアプリを起動するだけで、自動的にテーブルとインデックスが準備されます。手動でSQLを実行する必要はありません。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HStorage 設定 */}
          {activeTab === 'hstorage' && (
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 text-base">
                ② HStorage 写真保存設定手順
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                写真ファイル本体はHStorageに保存し、Neon PostgreSQL側にはファイルID・キー・URL・ファイルサイズを登録して紐付け管理します。
              </p>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                <h4 className="font-semibold text-xs text-zinc-900">
                  設定が必要な環境変数
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="bg-zinc-900 text-zinc-100 p-2.5 rounded-lg">
                    <p className="text-zinc-400 text-[10px]"># HStorage APIエンドポイント</p>
                    <p>{'HSTORAGE_ENDPOINT="https://api.hstorage.io/v1"'}</p>
                  </div>
                  <div className="bg-zinc-900 text-zinc-100 p-2.5 rounded-lg">
                    <p className="text-zinc-400 text-[10px]"># HStorage API認証トークン（秘密情報）</p>
                    <p>{'HSTORAGE_API_KEY="your_api_key_here"'}</p>
                  </div>
                  <div className="bg-zinc-900 text-zinc-100 p-2.5 rounded-lg">
                    <p className="text-zinc-400 text-[10px]"># バケットID / プロジェクトID（任意）</p>
                    <p>{'HSTORAGE_BUCKET_ID="field-reports-photos"'}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <h4 className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  セキュリティ設計（秘密情報の保護）
                </h4>
                <p className="leading-relaxed">
                  アップロード処理はすべてサーバー側API（<code>/api/upload</code>）を経由して実行されます。ブラウザ側にはHStorageのAPIキーが一切露出しない設計となっています。
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Vercel デプロイ */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 text-base">
                ③ GitHub & Vercel 公開手順
              </h3>
              <ol className="list-decimal list-inside text-xs text-zinc-600 space-y-3">
                <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900">GitHubリポジトリへのプッシュ:</strong>
                  <p className="mt-1">
                    完成したソースコードをご自身のGitHubリポジトリにプッシュします（<code>.env.local</code> などの機密ファイルは <code>.gitignore</code> により自動除外されます）。
                  </p>
                </li>
                <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900">Vercelでプロジェクトをインポート:</strong>
                  <p className="mt-1">
                    Vercelダッシュボード（vercel.com）で「Add New...」→「Project」を選択し、GitHubリポジトリを選択します。
                  </p>
                </li>
                <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900">Environment Variables（環境変数）の登録:</strong>
                  <p className="mt-1 mb-2">
                    Vercelのプロジェクト設定画面の「Environment Variables」に以下を入力します:
                  </p>
                  <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-zinc-700 bg-white p-2 rounded border border-zinc-200">
                    <li>DATABASE_URL: (Neonの接続URL)</li>
                    <li>HSTORAGE_ENDPOINT: (HStorageのエンドポイント)</li>
                    <li>HSTORAGE_API_KEY: (HStorageのAPIキー)</li>
                    <li>HSTORAGE_BUCKET_ID: (任意)</li>
                  </ul>
                </li>
                <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900">Deployの実行:</strong>
                  <p className="mt-1">
                    「Deploy」ボタンをクリックすると、自動でNext.jsアプリがビルドされ世界中に高速配信されます。
                  </p>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs">
          <span className="text-zinc-500">Firebase不使用 / Neon & HStorage対応</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-2xs"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
