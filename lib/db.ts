import { neon } from '@neondatabase/serverless';
import { FieldReport, CreateReportInput, UpdateReportInput, BackendStatus } from './types';

// デモ初期データ（Neon未接続時に画面や全機能をテスト可能にするためのデータ）
const INITIAL_DEMO_REPORTS: FieldReport[] = [
  {
    id: 'report_demo_01',
    reporterName: '田中 健一',
    destination: '株式会社アドバンス 渋谷本社',
    visitDate: '2026-10-26',
    category: '点検・メンテナンス',
    status: '完了',
    comment: '第2サーバーラックの空調点検および配線整理を実施しました。吸気フィルターの清掃を完了し、温度センサーの測定値も正常値（23.4℃）に安定していることを確認しました。次回定期点検は11月下旬予定です。',
    photos: [
      {
        id: 'photo_demo_1',
        name: 'ラック配線点検後.jpg',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        storageKey: 'reports/2026-10-26/rack_inspection.jpg',
        size: 1024 * 780,
        mimeType: 'image/jpeg',
        uploadedAt: '2026-10-26T14:30:00Z',
        isMockStorage: true,
      },
      {
        id: 'photo_demo_2',
        name: '温度センサー計測値.jpg',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        storageKey: 'reports/2026-10-26/temperature_sensor.jpg',
        size: 1024 * 540,
        mimeType: 'image/jpeg',
        uploadedAt: '2026-10-26T14:32:00Z',
        isMockStorage: true,
      },
    ],
    createdAt: '2026-10-26T15:00:00Z',
    updatedAt: '2026-10-26T15:00:00Z',
    storageSource: 'demo_memory',
  },
  {
    id: 'report_demo_02',
    reporterName: '佐藤 美咲',
    destination: '東京ロジスティクスセンター 湾岸倉庫',
    visitDate: '2026-10-25',
    category: '納品・設置',
    status: '完了',
    comment: '新型バーコード検品端末3台の現地納品・WiFi接続テスト完了。現場担当の鈴木様立ち会いのもと、スキャン動作および在庫システム連携のテストスキャンを10回行い、全件正常終了しました。マニュアルも1部手渡し済み。',
    photos: [
      {
        id: 'photo_demo_3',
        name: '端末設置状況.jpg',
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
        storageKey: 'reports/2026-10-25/terminal_setup.jpg',
        size: 1024 * 620,
        mimeType: 'image/jpeg',
        uploadedAt: '2026-10-25T11:20:00Z',
        isMockStorage: true,
      },
    ],
    createdAt: '2026-10-25T11:45:00Z',
    updatedAt: '2026-10-25T11:45:00Z',
    storageSource: 'demo_memory',
  },
  {
    id: 'report_demo_03',
    reporterName: '高橋 雄大',
    destination: 'サンライズ建設 新宿新築現場',
    visitDate: '2026-10-24',
    category: 'トラブル・障害対応',
    status: '要対応',
    comment: '現場仮設事務所のネットワーク瞬断について緊急調査。光成端箱からルーター間のLANケーブル被膜に擦れによる芯線露出を確認しました。応急処置としてカテゴリー6ケーブルに交換し復旧しましたが、配管ルートの見直しが必要です。',
    photos: [
      {
        id: 'photo_demo_4',
        name: '破損ケーブル箇所.jpg',
        url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        storageKey: 'reports/2026-10-24/cable_damage.jpg',
        size: 1024 * 890,
        mimeType: 'image/jpeg',
        uploadedAt: '2026-10-24T16:15:00Z',
        isMockStorage: true,
      },
    ],
    createdAt: '2026-10-24T16:30:00Z',
    updatedAt: '2026-10-24T16:30:00Z',
    storageSource: 'demo_memory',
  },
];

// Nodeグローバル変数にインメモリストアを保持（開発中の再コンパイルでも消えないようにする）
const globalForReports = globalThis as unknown as {
  inMemoryReports: FieldReport[] | undefined;
  neonTableInitialized: boolean | undefined;
};

if (!globalForReports.inMemoryReports) {
  globalForReports.inMemoryReports = [...INITIAL_DEMO_REPORTS];
}

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.trim() === '') {
    return null;
  }
  return neon(databaseUrl);
}

/**
 * Neon PostgreSQL のテーブルを自動セットアップ
 */
async function ensureNeonTable(sql: any) {
  if (globalForReports.neonTableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS field_reports (
        id VARCHAR(100) PRIMARY KEY,
        reporter_name VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        visit_date VARCHAR(20) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'その他',
        status VARCHAR(50) NOT NULL DEFAULT '完了',
        comment TEXT NOT NULL,
        photos JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    globalForReports.neonTableInitialized = true;
  } catch (error) {
    console.warn('[Neon Table Setup Warning]:', error);
  }
}

/**
 * Neon または デモメモリから報告一覧を取得
 */
export async function getReports(filter?: {
  search?: string;
  reporter?: string;
  category?: string;
  date?: string;
}): Promise<{ reports: FieldReport[]; source: 'neon' | 'demo_memory' }> {
  const sql = getSql();

  if (sql) {
    try {
      await ensureNeonTable(sql);

      // Neon から直接取得
      const rows = await sql`
        SELECT 
          id,
          reporter_name as "reporterName",
          destination,
          visit_date as "visitDate",
          category,
          status,
          comment,
          photos,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM field_reports
        ORDER BY visit_date DESC, created_at DESC
      `;

      let reports: FieldReport[] = rows.map((r: any) => ({
        id: String(r.id),
        reporterName: String(r.reporterName || ''),
        destination: String(r.destination || ''),
        visitDate: String(r.visitDate || ''),
        category: (r.category || 'その他'),
        status: (r.status || '完了'),
        comment: String(r.comment || ''),
        photos: Array.isArray(r.photos) ? r.photos : [],
        createdAt: new Date(r.createdAt || Date.now()).toISOString(),
        updatedAt: new Date(r.updatedAt || Date.now()).toISOString(),
        storageSource: 'neon',
      }));

      // 検索フィルターの適用
      if (filter) {
        reports = applyFilter(reports, filter);
      }

      return { reports, source: 'neon' };
    } catch (err) {
      console.warn('[Neon Fetch Error, falling back to demo memory]:', err);
    }
  }

  // デモモード（インメモリ）
  let reports = [...(globalForReports.inMemoryReports || [])];
  if (filter) {
    reports = applyFilter(reports, filter);
  }
  // 日付順ソート
  reports.sort((a, b) => {
    const cmp = b.visitDate.localeCompare(a.visitDate);
    if (cmp !== 0) return cmp;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return { reports, source: 'demo_memory' };
}

/**
 * フィルター適用ユーティリティ
 */
function applyFilter(
  reports: FieldReport[],
  filter: { search?: string; reporter?: string; category?: string; date?: string }
): FieldReport[] {
  return reports.filter((r) => {
    if (filter.search) {
      const q = filter.search.toLowerCase();
      const match =
        r.reporterName.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filter.reporter && !r.reporterName.toLowerCase().includes(filter.reporter.toLowerCase())) {
      return false;
    }
    if (filter.category && filter.category !== 'all' && r.category !== filter.category) {
      return false;
    }
    if (filter.date && r.visitDate !== filter.date) {
      return false;
    }
    return true;
  });
}

/**
 * 単一の報告を取得
 */
export async function getReportById(id: string): Promise<FieldReport | null> {
  const sql = getSql();
  if (sql) {
    try {
      await ensureNeonTable(sql);
      const rows = await sql`
        SELECT 
          id,
          reporter_name as "reporterName",
          destination,
          visit_date as "visitDate",
          category,
          status,
          comment,
          photos,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM field_reports
        WHERE id = ${id}
        LIMIT 1
      `;
      if (rows.length > 0) {
        const r: any = rows[0];
        return {
          id: String(r.id),
          reporterName: String(r.reporterName || ''),
          destination: String(r.destination || ''),
          visitDate: String(r.visitDate || ''),
          category: r.category || 'その他',
          status: r.status || '完了',
          comment: String(r.comment || ''),
          photos: Array.isArray(r.photos) ? r.photos : [],
          createdAt: new Date(r.createdAt || Date.now()).toISOString(),
          updatedAt: new Date(r.updatedAt || Date.now()).toISOString(),
          storageSource: 'neon',
        };
      }
    } catch (err) {
      console.warn('[Neon getReportById Error]:', err);
    }
  }

  const found = (globalForReports.inMemoryReports || []).find((r) => r.id === id);
  return found || null;
}

/**
 * 新規報告作成
 */
export async function createReport(
  input: CreateReportInput
): Promise<{ report: FieldReport; source: 'neon' | 'demo_memory' }> {
  const sql = getSql();
  const id = `report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();
  const category = input.category || '定期巡回';
  const status = input.status || '完了';
  const photos = input.photos.slice(0, 3); // 最大3枚を厳格に遵守

  if (sql) {
    try {
      await ensureNeonTable(sql);
      await sql`
        INSERT INTO field_reports (
          id, reporter_name, destination, visit_date, category, status, comment, photos, created_at, updated_at
        ) VALUES (
          ${id},
          ${input.reporterName},
          ${input.destination},
          ${input.visitDate},
          ${category},
          ${status},
          ${input.comment},
          ${JSON.stringify(photos)},
          ${now},
          ${now}
        )
      `;

      return {
        report: {
          id,
          reporterName: input.reporterName,
          destination: input.destination,
          visitDate: input.visitDate,
          category,
          status,
          comment: input.comment,
          photos,
          createdAt: now,
          updatedAt: now,
          storageSource: 'neon',
        },
        source: 'neon',
      };
    } catch (err) {
      console.warn('[Neon createReport Error, falling back to demo memory]:', err);
    }
  }

  // デモメモリへの保存
  const newReport: FieldReport = {
    id,
    reporterName: input.reporterName,
    destination: input.destination,
    visitDate: input.visitDate,
    category,
    status,
    comment: input.comment,
    photos,
    createdAt: now,
    updatedAt: now,
    storageSource: 'demo_memory',
  };

  globalForReports.inMemoryReports = [newReport, ...(globalForReports.inMemoryReports || [])];

  return { report: newReport, source: 'demo_memory' };
}

/**
 * 報告の編集・更新
 */
export async function updateReport(
  id: string,
  input: UpdateReportInput
): Promise<{ report: FieldReport | null; source: 'neon' | 'demo_memory' }> {
  const sql = getSql();
  const now = new Date().toISOString();

  if (sql) {
    try {
      await ensureNeonTable(sql);
      const existing = await getReportById(id);
      if (!existing) return { report: null, source: 'neon' };

      const updated = {
        reporterName: input.reporterName ?? existing.reporterName,
        destination: input.destination ?? existing.destination,
        visitDate: input.visitDate ?? existing.visitDate,
        category: input.category ?? existing.category,
        status: input.status ?? existing.status,
        comment: input.comment ?? existing.comment,
        photos: (input.photos ?? existing.photos).slice(0, 3),
      };

      await sql`
        UPDATE field_reports
        SET 
          reporter_name = ${updated.reporterName},
          destination = ${updated.destination},
          visit_date = ${updated.visitDate},
          category = ${updated.category},
          status = ${updated.status},
          comment = ${updated.comment},
          photos = ${JSON.stringify(updated.photos)},
          updated_at = ${now}
        WHERE id = ${id}
      `;

      return {
        report: {
          id,
          ...updated,
          createdAt: existing.createdAt,
          updatedAt: now,
          storageSource: 'neon',
        },
        source: 'neon',
      };
    } catch (err) {
      console.warn('[Neon updateReport Error]:', err);
    }
  }

  // デモメモリ更新
  const reports = globalForReports.inMemoryReports || [];
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) {
    return { report: null, source: 'demo_memory' };
  }

  const existing = reports[index];
  const updatedReport: FieldReport = {
    ...existing,
    reporterName: input.reporterName ?? existing.reporterName,
    destination: input.destination ?? existing.destination,
    visitDate: input.visitDate ?? existing.visitDate,
    category: input.category ?? existing.category,
    status: input.status ?? existing.status,
    comment: input.comment ?? existing.comment,
    photos: (input.photos ?? existing.photos).slice(0, 3),
    updatedAt: now,
    storageSource: 'demo_memory',
  };

  reports[index] = updatedReport;
  globalForReports.inMemoryReports = reports;

  return { report: updatedReport, source: 'demo_memory' };
}

/**
 * 報告の削除
 */
export async function deleteReport(id: string): Promise<boolean> {
  const sql = getSql();
  if (sql) {
    try {
      await ensureNeonTable(sql);
      await sql`DELETE FROM field_reports WHERE id = ${id}`;
      return true;
    } catch (err) {
      console.warn('[Neon deleteReport Error]:', err);
    }
  }

  // デモメモリから削除
  const beforeLen = (globalForReports.inMemoryReports || []).length;
  globalForReports.inMemoryReports = (globalForReports.inMemoryReports || []).filter((r) => r.id !== id);
  return globalForReports.inMemoryReports.length < beforeLen;
}

/**
 * バックエンドおよび外部サービス（Neon, HStorage）の接続状態チェック
 */
export async function getBackendStatus(): Promise<BackendStatus> {
  const databaseUrl = process.env.DATABASE_URL;
  const hstorageEndpoint = process.env.HSTORAGE_ENDPOINT;
  const hstorageKey = process.env.HSTORAGE_API_KEY;

  let neonConnected = false;
  const sql = getSql();

  if (sql) {
    try {
      await sql`SELECT 1;`;
      neonConnected = true;
    } catch (err) {
      neonConnected = false;
    }
  }

  const hstorageConfigured = Boolean(hstorageEndpoint && hstorageKey);

  const isProduction = Boolean(neonConnected && hstorageConfigured);

  let message = '';
  if (neonConnected && hstorageConfigured) {
    message = 'Neon PostgreSQLおよびHStorageに正常に接続されています（本番稼働中）。';
  } else if (neonConnected && !hstorageConfigured) {
    message = 'Neon PostgreSQLに接続済ですが、HStorage設定が未完了です。写真はデモストレージに保存されます。';
  } else if (!neonConnected && hstorageConfigured) {
    message = 'HStorage設定済ですが、Neon PostgreSQL（DATABASE_URL）に未接続です。報告データはデモメモリに保存されます。';
  } else {
    message = '【デモ環境】Neon PostgreSQLおよびHStorageが未接続です。すべての機能は安全なデモデータおよびメモリ内ストアで動作確認できます。';
  }

  return {
    neonConfigured: Boolean(databaseUrl && databaseUrl.trim() !== ''),
    neonConnected,
    hstorageConfigured,
    hstorageConnected: hstorageConfigured, // HStorageはAPIキー有無で判定
    databaseUrlProvided: Boolean(databaseUrl),
    storageMode: isProduction ? 'production' : 'demo',
    message,
  };
}
