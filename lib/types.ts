export interface ReportPhoto {
  id: string;
  name: string;
  url: string;
  storageKey: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  isMockStorage?: boolean;
}

export type ReportCategory =
  | '定期巡回'
  | '現地調査'
  | '納品・設置'
  | '点検・メンテナンス'
  | '営業訪問'
  | 'トラブル・障害対応'
  | 'その他';

export type ReportStatus = '完了' | '確認中' | '要対応';

export interface FieldReport {
  id: string;
  reporterName: string;
  destination: string;
  visitDate: string; // YYYY-MM-DD
  comment: string;
  photos: ReportPhoto[];
  category: ReportCategory;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  storageSource: 'neon' | 'demo_memory';
}

export interface BackendStatus {
  neonConfigured: boolean;
  neonConnected: boolean;
  hstorageConfigured: boolean;
  hstorageConnected: boolean;
  databaseUrlProvided: boolean;
  storageMode: 'production' | 'demo';
  message: string;
}

export interface CreateReportInput {
  reporterName: string;
  destination: string;
  visitDate: string;
  comment: string;
  photos: ReportPhoto[];
  category?: ReportCategory;
  status?: ReportStatus;
}

export interface UpdateReportInput {
  reporterName?: string;
  destination?: string;
  visitDate?: string;
  comment?: string;
  photos?: ReportPhoto[];
  category?: ReportCategory;
  status?: ReportStatus;
}
