'use client';

import React from 'react';
import { Search, X, Calendar, Filter, RotateCcw } from 'lucide-react';
import { ReportCategory, ReportStatus } from '@/lib/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onReset: () => void;
  totalCount: number;
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: '定期巡回', label: '定期巡回' },
  { value: '現地調査', label: '現地調査' },
  { value: '納品・設置', label: '納品・設置' },
  { value: '点検・メンテナンス', label: '点検・メンテ' },
  { value: '営業訪問', label: '営業訪問' },
  { value: 'トラブル・障害対応', label: 'トラブル対応' },
];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedDate,
  onDateChange,
  onReset,
  totalCount,
}: FilterBarProps) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    Boolean(selectedDate);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-4 sm:p-5 space-y-3.5 mb-6">
      {/* Top Search & Date row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search input */}
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="訪問先、報告者名、コメント内容で検索..."
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900 placeholder:text-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Filter */}
        <div className="sm:col-span-4 relative flex items-center">
          <Calendar className="w-4 h-4 absolute left-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-800"
            title="訪問日で絞り込み"
          />
          {selectedDate && (
            <button
              onClick={() => onDateChange('')}
              className="absolute right-3 text-zinc-400 hover:text-zinc-600 p-0.5"
              title="日付クリア"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category segmented filter & status & reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-zinc-100">
        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status filter + Reset */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            <option value="all">すべてのステータス</option>
            <option value="完了">完了のみ</option>
            <option value="確認中">確認中のみ</option>
            <option value="要対応">要対応のみ</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer text-xs"
              title="フィルターを全リセット"
            >
              <RotateCcw className="w-3 h-3" />
              リセット
            </button>
          )}

          <span className="text-zinc-400 text-xs pl-1">
            {totalCount} 件
          </span>
        </div>
      </div>
    </div>
  );
}
