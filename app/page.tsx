'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ConnectionBanner from '@/components/ConnectionBanner';
import FilterBar from '@/components/FilterBar';
import ReportCard from '@/components/ReportCard';
import ReportFormModal from '@/components/ReportFormModal';
import ReportDetailModal from '@/components/ReportDetailModal';
import SetupGuideModal from '@/components/SetupGuideModal';
import PhotoLightbox from '@/components/PhotoLightbox';
import { FieldReport, ReportPhoto, BackendStatus } from '@/lib/types';
import {
  Camera,
  Plus,
  Server,
  Database,
  Cloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Inbox,
  Calendar,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTargetReport, setEditTargetReport] = useState<FieldReport | null>(null);
  const [detailTargetReport, setDetailTargetReport] = useState<FieldReport | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<ReportPhoto | null>(null);

  // Toast / Notice
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialData() {
      try {
        const [statusRes, reportsRes] = await Promise.all([
          fetch('/api/status'),
          fetch('/api/reports'),
        ]);
        if (statusRes.ok && !ignore) {
          const statusData = await statusRes.json();
          setBackendStatus(statusData);
        }
        if (reportsRes.ok && !ignore) {
          const reportsData = await reportsRes.json();
          if (reportsData.success && Array.isArray(reportsData.reports)) {
            setReports(reportsData.reports);
          }
        }
      } catch (e) {
        console.error('Failed to load initial data', e);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // 検索ワード
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.destination.toLowerCase().includes(q) ||
          r.reporterName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // カテゴリ
      if (selectedCategory !== 'all' && r.category !== selectedCategory) {
        return false;
      }
      // ステータス
      if (selectedStatus !== 'all' && r.status !== selectedStatus) {
        return false;
      }
      // 訪問日
      if (selectedDate && r.visitDate !== selectedDate) {
        return false;
      }
      return true;
    });
  }, [reports, searchQuery, selectedCategory, selectedStatus, selectedDate]);

  // Statistics
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = reports.filter((r) => r.visitDate === todayStr).length;
  const pendingCount = reports.filter((r) => r.status === '要対応').length;
  const totalPhotos = reports.reduce((acc, r) => acc + (r.photos?.length || 0), 0);

  // Handlers
  const handleOpenCreate = () => {
    setEditTargetReport(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (report: FieldReport) => {
    setEditTargetReport(report);
    setIsFormOpen(true);
  };

  const handleViewDetail = (report: FieldReport) => {
    setDetailTargetReport(report);
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('この報告を削除してもよろしいですか？この操作は取り消せません。')) {
      return;
    }

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReports((prev) => prev.filter((r) => r.id !== id));
        if (detailTargetReport?.id === id) {
          setDetailTargetReport(null);
        }
        showToast('報告を削除しました', 'info');
      } else {
        throw new Error(data.error || '削除に失敗しました');
      }
    } catch (err: any) {
      showToast(err.message || '削除中にエラーが発生しました', 'error');
    }
  };

  const handleFormSubmitSuccess = (savedReport: FieldReport, isEdit: boolean) => {
    if (isEdit) {
      setReports((prev) =>
        prev.map((r) => (r.id === savedReport.id ? savedReport : r))
      );
      if (detailTargetReport?.id === savedReport.id) {
        setDetailTargetReport(savedReport);
      }
      showToast(
        savedReport.storageSource === 'neon'
          ? 'Neon PostgreSQLの報告を更新しました'
          : '【デモ保存】報告内容を更新しました',
        'success'
      );
    } else {
      setReports((prev) => [savedReport, ...prev]);
      showToast(
        savedReport.storageSource === 'neon'
          ? 'Neon PostgreSQLに新規報告を保存しました'
          : '【デモ保存】メモリ内デモDBに新規報告を登録しました',
        'success'
      );
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedDate('');
  };

  const handleRefreshStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data: BackendStatus = await res.json();
        setBackendStatus(data);
      }
    } catch (e) {
      console.warn('Failed to refresh status', e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100/60 text-zinc-900 flex flex-col font-sans antialiased selection:bg-zinc-900 selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenCreate={handleOpenCreate}
        onOpenGuide={() => setIsGuideOpen(true)}
        backendStatus={backendStatus}
        reportCount={reports.length}
      />

      {/* Transparent Connection Banner */}
      <ConnectionBanner
        backendStatus={backendStatus}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-5 duration-200 ${
              toastMessage.type === 'success'
                ? 'bg-zinc-900 text-white border-zinc-800'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-zinc-800 text-zinc-100 border-zinc-700'
            }`}
          >
            {toastMessage.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {toastMessage.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            {toastMessage.type === 'info' && (
              <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Hero Section */}
        <section className="mb-6 bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md">
                <span>Vercel / Neon / HStorage Ready</span>
                <span className="text-zinc-400">·</span>
                <span className="text-zinc-500">Firebase不使用</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-tight">
                写真付き現地報告システム
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                訪問先での状況をスマートフォンで撮影し、報告者名・訪問日・コメントとともに即時登録。
                データベース（Neon PostgreSQL）と写真ストレージ（HStorage）をサーバー側APIで安全に制御します。
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-98"
              >
                <Camera className="w-4 h-4" />
                写真付き報告を作成
              </button>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl transition-all cursor-pointer"
              >
                <Server className="w-4 h-4 text-zinc-600" />
                接続設定・マニュアル
              </button>
            </div>
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-100">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-[11px] font-medium text-zinc-500 block">総報告件数</span>
              <span className="text-xl font-bold text-zinc-900">{reports.length} 件</span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-[11px] font-medium text-zinc-500 block">本日の現地報告</span>
              <span className="text-xl font-bold text-zinc-900">{todayCount} 件</span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-[11px] font-medium text-zinc-500 block">要対応ステータス</span>
              <span className={`text-xl font-bold ${pendingCount > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
                {pendingCount} 件
              </span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-[11px] font-medium text-zinc-500 block">添付写真総数</span>
              <span className="text-xl font-bold text-zinc-900">{totalPhotos} 枚</span>
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onReset={handleResetFilters}
          totalCount={filteredReports.length}
        />

        {/* Reports Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 bg-white rounded-2xl border border-zinc-200 animate-pulse p-5 space-y-4"
              >
                <div className="h-4 bg-zinc-200 rounded w-1/3" />
                <div className="h-6 bg-zinc-200 rounded w-3/4" />
                <div className="h-16 bg-zinc-100 rounded" />
                <div className="h-20 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onViewDetail={handleViewDetail}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteReport}
                onPhotoClick={(photo) => setLightboxPhoto(photo)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center max-w-lg mx-auto">
            <Inbox className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              該当する報告が見つかりませんでした
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              検索条件を変更するか、右上のボタンから新しい報告を作成してください。
            </p>
            <div className="flex items-center justify-center gap-3">
              {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedDate) && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                >
                  フィルターを解除
                </button>
              )}
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                新規報告を作成
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 FIELD REPORT · 写真付き現地報告アプリ</p>
          <div className="flex items-center gap-4 text-zinc-500">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-zinc-900 underline"
            >
              Neon / HStorage 接続仕様書
            </button>
            <span>·</span>
            <span>Next.js 15 App Router</span>
            <span>·</span>
            <span>Vercel Compatible</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditTargetReport(null);
        }}
        onSubmitSuccess={handleFormSubmitSuccess}
        editReport={editTargetReport}
        backendStatus={backendStatus}
      />

      <ReportDetailModal
        report={detailTargetReport}
        onClose={() => setDetailTargetReport(null)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteReport}
        onPhotoClick={(photo) => setLightboxPhoto(photo)}
      />

      <SetupGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        backendStatus={backendStatus}
        onRefreshStatus={handleRefreshStatus}
      />

      <PhotoLightbox
        photo={lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
      />
    </div>
  );
}
