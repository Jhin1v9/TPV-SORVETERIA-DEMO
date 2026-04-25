import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BugDetector,
  BugDetectorOverlay,
  BugReportModal,
  BugTrackerPanel,
} from '@auris/bug-detector';
import type {
  BugDetectorConfig,
  BugReport,
  BugStats,
  CreateReportData,
  ExportOptions,
  ExportResult,
  InspectedElement,
} from '@auris/bug-detector';

type WorkspaceStatus = 'new' | 'triaged' | 'in_progress' | 'blocked' | 'done';
type WorkspacePriority = 'low' | 'medium' | 'high' | 'critical';
type AIState = 'idle' | 'loading' | 'ready' | 'error';

interface TPVBugDetectorContextValue {
  isOpen: boolean;
  isPanelOpen: boolean;
  isInspecting: boolean;
  openReport: () => void;
  closeReport: () => void;
  openPanel: () => void;
  closePanel: () => void;
  createReport: (data: CreateReportData) => Promise<BugReport>;
  getReports: () => BugReport[];
  getStats: () => BugStats;
  exportReport: (reportId: string, options: ExportOptions) => Promise<ExportResult>;
  exportAllReports: (options: ExportOptions) => Promise<ExportResult>;
  printAllReports: () => Promise<void>;
  fetchHealth: () => Promise<{ ok: boolean; status: number; data?: unknown }>;
}

interface TeamComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

interface KimiInsight {
  title: string;
  summary: string;
  reproductionSteps: string[];
  suspectedArea: string;
  userImpact: string;
  fixDirection: string;
  suggestedOwner: string;
  confidence: 'low' | 'medium' | 'high';
  generatedAt: string;
  model: string;
}

interface WorkspaceMeta {
  reportId: string;
  owner: string;
  status: WorkspaceStatus;
  priority: WorkspacePriority;
  comments: TeamComment[];
  aiState: AIState;
  aiError?: string;
  insight?: KimiInsight;
  createdAt: string;
  updatedAt: string;
}

type WorkspaceStore = Record<string, WorkspaceMeta>;

const TPVBugDetectorContext = createContext<TPVBugDetectorContextValue | null>(null);

const WORKSPACE_STORAGE_KEY = 'tpv-bug-detector-workspace-v2';
const KIMI_API_KEY = import.meta.env.VITE_MOONSHOT_API_KEY || import.meta.env.VITE_KIMI_API_KEY || '';
const KIMI_BASE_URL = import.meta.env.VITE_MOONSHOT_BASE_URL || import.meta.env.VITE_KIMI_BASE_URL || 'https://api.moonshot.ai/v1';
const KIMI_MODEL = import.meta.env.VITE_KIMI_MODEL || 'kimi-k2.5';

const config: BugDetectorConfig = {
  trigger: 'manual',
  persistTo: 'localStorage',
  guestMode: false,
  zIndexBase: 50,
  capture: {
    screenshot: true,
    console: true,
    network: true,
    performance: true,
    includeHTML: false,
    includeStyles: true,
  },
  branding: {
    primaryColor: '#4CAF50',
    position: 'bottom-right',
    buttonText: 'Bug',
  },
};

const emptyStats: BugStats = {
  total: 0,
  pending: 0,
  resolved: 0,
  bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
  byType: { bug: 0, improvement: 0, question: 0 },
};

const statusLabels: Record<WorkspaceStatus, string> = {
  new: 'Novo',
  triaged: 'Triado',
  in_progress: 'Em andamento',
  blocked: 'Bloqueado',
  done: 'Concluido',
};

const priorityLabels: Record<WorkspacePriority, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
};

export function useTPVBugDetector() {
  const ctx = useContext(TPVBugDetectorContext);
  if (!ctx) throw new Error('useTPVBugDetector must be used inside TPVBugDetectorProvider');
  return ctx;
}

export function TPVBugDetectorProvider({ children }: { children: ReactNode }) {
  const detectorRef = useRef<BugDetector | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<InspectedElement | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceStore>({});
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const isAnyOverlayOpen = isOpen || isPanelOpen || isWorkspaceOpen;

  useEffect(() => {
    detectorRef.current = new BugDetector({
      ...config,
      headless: true,
      callbacks: {
        onActivate: () => {
          setIsInspecting(true);
        },
        onDeactivate: () => {
          setIsInspecting(false);
        },
        onReportCreated: (report: BugReport) => {
          setReports((prev) => [report, ...prev.filter((item) => item.id !== report.id)]);
          setSelectedReportId(report.id);
          setIsPanelOpen(false);
          setIsWorkspaceOpen(true);
        },
      },
    });

    setReports(detectorRef.current.getReports());
    setWorkspace(readWorkspaceStore());

    return () => {
      detectorRef.current?.deactivate();
    };
  }, []);

  useEffect(() => {
    setWorkspace((current) => {
      let changed = false;
      const next: WorkspaceStore = { ...current };

      for (const report of reports) {
        if (!next[report.id]) {
          next[report.id] = createDefaultMeta(report);
          changed = true;
        }
      }

      for (const reportId of Object.keys(next)) {
        if (!reports.some((report) => report.id === reportId)) {
          delete next[reportId];
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [reports]);

  useEffect(() => {
    writeWorkspaceStore(workspace);
  }, [workspace]);

  useEffect(() => {
    if (!isAnyOverlayOpen) return;

    const stopDetectorUIClickLeak = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest('[data-bug-detector-ui]')) return;
      event.stopPropagation();
    };

    document.addEventListener('pointerdown', stopDetectorUIClickLeak, true);
    document.addEventListener('mousedown', stopDetectorUIClickLeak, true);
    document.addEventListener('touchstart', stopDetectorUIClickLeak, true);

    return () => {
      document.removeEventListener('pointerdown', stopDetectorUIClickLeak, true);
      document.removeEventListener('mousedown', stopDetectorUIClickLeak, true);
      document.removeEventListener('touchstart', stopDetectorUIClickLeak, true);
    };
  }, [isAnyOverlayOpen]);

  const refreshReports = useCallback(() => {
    setReports(detectorRef.current?.getReports() ?? []);
  }, []);

  const capturePageScreenshot = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        scale: 1,
        ignoreElements: (element) =>
          element instanceof HTMLElement && Boolean(element.closest('[data-bug-detector-ui]')),
      });
      setScreenshotDataUrl(canvas.toDataURL('image/png'));
    } catch {
      setScreenshotDataUrl(null);
    }
  }, []);

  const openReport = useCallback(() => {
    setIsOpen(false);
    setIsPanelOpen(false);
    setIsWorkspaceOpen(false);
    setSelectedElement(null);
    setScreenshotDataUrl(null);
    detectorRef.current?.activate();
  }, []);

  const closeReport = useCallback(() => {
    setIsOpen(false);
    setSelectedElement(null);
    setScreenshotDataUrl(null);
  }, []);

  const openPanel = useCallback(() => {
    setIsWorkspaceOpen(false);
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const openWorkspace = useCallback((reportId?: string) => {
    if (reportId) setSelectedReportId(reportId);
    setIsPanelOpen(false);
    setIsWorkspaceOpen(true);
  }, []);

  const closeWorkspace = useCallback(() => {
    setIsWorkspaceOpen(false);
  }, []);

  useEffect(() => {
    if (!isAnyOverlayOpen) return;

    const handleEscapeToCloseActiveOverlay = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      event.preventDefault();
      event.stopPropagation();

      if (isOpen) {
        closeReport();
        return;
      }

      if (isPanelOpen) {
        closePanel();
        return;
      }

      if (isWorkspaceOpen) {
        closeWorkspace();
      }
    };

    document.addEventListener('keydown', handleEscapeToCloseActiveOverlay, true);

    return () => {
      document.removeEventListener('keydown', handleEscapeToCloseActiveOverlay, true);
    };
  }, [closePanel, closeReport, closeWorkspace, isAnyOverlayOpen, isOpen, isPanelOpen, isWorkspaceOpen]);

  const updateMeta = useCallback((reportId: string, updater: (meta: WorkspaceMeta) => WorkspaceMeta) => {
    setWorkspace((current) => {
      const base = current[reportId] ?? createDefaultMeta({ id: reportId, severity: 'medium' } as BugReport);
      return {
        ...current,
        [reportId]: {
          ...updater(base),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const handleElementClick = useCallback(
    (element: InspectedElement) => {
      setSelectedElement(element);
      detectorRef.current?.deactivate();
      setIsOpen(true);
      setScreenshotDataUrl(null);
      void capturePageScreenshot();
    },
    [capturePageScreenshot]
  );

  const createReport = useCallback(
    async (data: CreateReportData) => {
      if (!detectorRef.current) throw new Error('BugDetector not initialized');

      const report = await detectorRef.current.createReport({
        ...data,
        element: data.element ?? selectedElement ?? undefined,
        screenshot: data.screenshot ?? screenshotDataUrl ?? undefined,
      });

      refreshReports();
      setWorkspace((current) => ({
        ...current,
        [report.id]: createDefaultMeta(report),
      }));
      setIsOpen(false);
      setSelectedElement(null);
      setScreenshotDataUrl(null);
      setSelectedReportId(report.id);
      setIsWorkspaceOpen(true);
      void enrichReportWithKimi(report.id);
      return report;
    },
    [refreshReports, screenshotDataUrl, selectedElement]
  );

  const resolveReport = useCallback(async (id: string) => {
    if (!detectorRef.current) return;
    await detectorRef.current.resolveReport(id);
    updateMeta(id, (meta) => ({ ...meta, status: 'done' }));
    refreshReports();
  }, [refreshReports, updateMeta]);

  const deleteReport = useCallback(async (id: string) => {
    if (!detectorRef.current) return;
    await detectorRef.current.deleteReport(id);
    setWorkspace((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (selectedReportId === id) {
      setSelectedReportId(null);
    }
    refreshReports();
  }, [refreshReports, selectedReportId]);

  const exportReport = useCallback(async (reportId: string, options: ExportOptions) => {
    if (!detectorRef.current) throw new Error('BugDetector not initialized');
    return detectorRef.current.exportReport(reportId, options);
  }, []);

  const exportAllReports = useCallback(async (options: ExportOptions) => {
    if (!detectorRef.current) throw new Error('BugDetector not initialized');
    return detectorRef.current.exportAllReports(options);
  }, []);

  const downloadExport = useCallback((result: ExportResult) => {
    const blob = new Blob([result.content], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const printAllReports = useCallback(async () => {
    const result = await exportAllReports({
      format: 'html',
      includeScreenshot: true,
      includeAIAnalysis: true,
    });

    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1280,height=900');
    if (!printWindow) {
      downloadExport(result);
      return;
    }

    printWindow.document.open();
    printWindow.document.write(result.content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }, [downloadExport, exportAllReports]);

  const getReports = useCallback(() => {
    return detectorRef.current?.getReports() ?? [];
  }, []);

  const getStats = useCallback(() => {
    return detectorRef.current?.getStats() ?? emptyStats;
  }, []);

  const stats = useMemo(() => getStats(), [getStats, reports]);

  const fetchHealth = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(window.location.href, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      return { ok: res.ok, status: res.status };
    } catch (error) {
      return { ok: false, status: 0, data: String(error) };
    }
  }, []);

  const addComment = useCallback((reportId: string, author: string, message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    updateMeta(reportId, (meta) => ({
      ...meta,
      comments: [
        ...meta.comments,
        {
          id: crypto.randomUUID(),
          author: author.trim() || 'Equipe',
          message: trimmed,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, [updateMeta]);

  const updateOwner = useCallback((reportId: string, owner: string) => {
    updateMeta(reportId, (meta) => ({ ...meta, owner }));
  }, [updateMeta]);

  const updateStatus = useCallback((reportId: string, status: WorkspaceStatus) => {
    updateMeta(reportId, (meta) => ({ ...meta, status }));
  }, [updateMeta]);

  const updatePriority = useCallback((reportId: string, priority: WorkspacePriority) => {
    updateMeta(reportId, (meta) => ({ ...meta, priority }));
  }, [updateMeta]);

  const enrichReportWithKimi = useCallback(async (reportId: string) => {
    const report = detectorRef.current?.getReport(reportId);
    if (!report) return;

    if (!KIMI_API_KEY) {
      updateMeta(reportId, (meta) => ({
        ...meta,
        aiState: 'error',
        aiError: 'Defina VITE_MOONSHOT_API_KEY ou VITE_KIMI_API_KEY na Vercel para ativar a IA Kimi.',
      }));
      return;
    }

    updateMeta(reportId, (meta) => ({
      ...meta,
      aiState: 'loading',
      aiError: undefined,
    }));

    try {
      const insight = await generateKimiInsight(report);
      updateMeta(reportId, (meta) => ({
        ...meta,
        aiState: 'ready',
        aiError: undefined,
        owner: meta.owner || insight.suggestedOwner,
        priority: meta.priority || reportSeverityToPriority(report.severity),
        insight,
      }));
    } catch (error) {
      updateMeta(reportId, (meta) => ({
        ...meta,
        aiState: 'error',
        aiError: error instanceof Error ? error.message : String(error),
      }));
    }
  }, [updateMeta]);

  const selectedWorkspaceReport = useMemo(() => {
    const currentReportId = selectedReportId ?? reports[0]?.id ?? null;
    if (!currentReportId) return null;
    return reports.find((report) => report.id === currentReportId) ?? null;
  }, [reports, selectedReportId]);

  const selectedWorkspaceMeta = selectedWorkspaceReport ? workspace[selectedWorkspaceReport.id] : undefined;

  return (
    <TPVBugDetectorContext.Provider
      value={{
        isOpen,
        isPanelOpen,
        isInspecting,
        openReport,
        closeReport,
        openPanel,
        closePanel,
        createReport,
        getReports,
        getStats,
        exportReport,
        exportAllReports,
        printAllReports,
        fetchHealth,
      }}
    >
      {children}

      <BugDetectorStyleFixes isAnyOverlayOpen={isAnyOverlayOpen} />

      {isAnyOverlayOpen && <BugDetectorInteractionShield />}

      <BugDetectorCommandDock
        isOverlayActive={isAnyOverlayOpen}
        isInspecting={isInspecting}
        isKimiReady={Boolean(KIMI_API_KEY)}
        stats={stats}
        workspaceCount={Object.keys(workspace).length}
        onInspect={() => {
          if (isInspecting) {
            detectorRef.current?.deactivate();
            return;
          }

          openReport();
        }}
        onOpenPanel={openPanel}
        onOpenWorkspace={() => openWorkspace()}
        onPrint={printAllReports}
      />

      <BugDetectorOverlay
        isActive={isInspecting && !isOpen}
        selectedElement={selectedElement}
        onDeactivate={() => detectorRef.current?.deactivate()}
        reportCount={reports.length}
        onElementClick={(element) => {
          void handleElementClick(element);
        }}
      />

      <BugReportModal
        isOpen={isOpen}
        element={selectedElement}
        screenshotDataUrl={screenshotDataUrl}
        onClose={closeReport}
        onSubmit={createReport}
        primaryColor={config.branding?.primaryColor}
      />

      <BugTrackerPanel
        isOpen={isPanelOpen}
        reports={reports}
        stats={stats}
        onClose={closePanel}
        onResolve={resolveReport}
        onDelete={deleteReport}
        onSyncGitHub={
          detectorRef.current
            ? async (id: string) => {
                await detectorRef.current?.syncGitHubStatus(id);
                refreshReports();
              }
            : undefined
        }
        primaryColor={config.branding?.primaryColor}
      />

      <BugDetectorWorkspacePanel
        isOpen={isWorkspaceOpen}
        report={selectedWorkspaceReport}
        meta={selectedWorkspaceMeta}
        reports={reports}
        workspace={workspace}
        onClose={closeWorkspace}
        onSelectReport={(reportId) => {
          setSelectedReportId(reportId);
        }}
        onOpenNativeReport={(reportId) => {
          setSelectedReportId(reportId);
          openPanel();
        }}
        onStatusChange={updateStatus}
        onPriorityChange={updatePriority}
        onOwnerChange={updateOwner}
        onAddComment={addComment}
        onRunKimi={(reportId) => {
          void enrichReportWithKimi(reportId);
        }}
        onExport={async (reportId, format) => {
          const result = await exportReport(reportId, {
            format,
            includeScreenshot: true,
            includeAIAnalysis: true,
          });
          downloadExport(result);
        }}
      />
    </TPVBugDetectorContext.Provider>
  );
}

function BugDetectorStyleFixes({ isAnyOverlayOpen }: { isAnyOverlayOpen: boolean }) {
  return (
    <style>{`
      :root {
        --tpv-bd-ink: #f8f4ea;
        --tpv-bd-muted: rgba(248, 244, 234, 0.72);
        --tpv-bd-dim: rgba(248, 244, 234, 0.52);
        --tpv-bd-line: rgba(255, 255, 255, 0.12);
        --tpv-bd-panel: linear-gradient(180deg, rgba(10, 18, 30, 0.985), rgba(17, 29, 44, 0.975));
        --tpv-bd-panel-soft: rgba(21, 33, 51, 0.9);
        --tpv-bd-panel-soft-2: rgba(32, 45, 63, 0.82);
        --tpv-bd-overlay: rgba(5, 10, 20, 0.82);
        --tpv-bd-green: #4fd08b;
        --tpv-bd-green-strong: #2fb96d;
        --tpv-bd-gold: #f4c96b;
        --tpv-bd-gold-soft: rgba(244, 201, 107, 0.18);
        --tpv-bd-cyan: #66d9ff;
        --tpv-bd-danger: #ff6b6b;
        --tpv-bd-shadow: 0 30px 80px rgba(0, 0, 0, 0.42);
      }

      [data-bug-detector-ui] {
        isolation: isolate;
        font-family: "Trebuchet MS", "Segoe UI", sans-serif !important;
        color: var(--tpv-bd-ink);
      }

      [data-bug-detector-ui][class*="fixed inset-0 z-[10000]"] {
        background:
          radial-gradient(circle at top, rgba(79, 208, 139, 0.16), transparent 24%),
          radial-gradient(circle at 80% 10%, rgba(244, 201, 107, 0.12), transparent 22%),
          linear-gradient(180deg, rgba(4, 8, 16, 0.9), rgba(8, 13, 24, 0.88)),
          var(--tpv-bd-overlay) !important;
        backdrop-filter: blur(14px) saturate(115%) !important;
        overflow-y: auto !important;
        overscroll-behavior: contain !important;
      }

      [data-bug-detector-ui][class*="fixed inset-0 z-[10000]"] > div,
      [data-bug-detector-ui][class*="fixed inset-y-0 right-0"],
      [data-bug-detector-ui].tpv-bug-detector-workspace-panel {
        background:
          radial-gradient(circle at top, rgba(244, 201, 107, 0.08), transparent 26%),
          radial-gradient(circle at 85% 0%, rgba(79, 208, 139, 0.12), transparent 22%),
          var(--tpv-bd-panel) !important;
        backdrop-filter: none !important;
        box-shadow: var(--tpv-bd-shadow) !important;
      }

      [data-bug-detector-ui][class*="fixed inset-0 z-[10000]"] > div {
        border: 1px solid rgba(244, 201, 107, 0.12) !important;
      }

      [data-bug-detector-ui][class*="fixed inset-0 z-[10000]"][class*="items-center"] {
        align-items: flex-start !important;
        padding-top: max(16px, env(safe-area-inset-top)) !important;
        padding-bottom: max(20px, env(safe-area-inset-bottom)) !important;
      }

      [data-bug-detector-ui][class*="fixed inset-0 z-[10000]"] > div[class*="max-w-2xl"] {
        margin-top: clamp(12px, 3vh, 28px) !important;
        margin-bottom: clamp(14px, 4vh, 36px) !important;
        max-height: none !important;
        min-height: min-content !important;
      }

      [data-bug-detector-ui][class*="fixed inset-0 z-[10000]"] > div[class*="max-w-2xl"] > div[class*="flex-1 overflow-y-auto"] {
        overflow-y: auto !important;
        overscroll-behavior: contain !important;
        scrollbar-gutter: stable both-edges;
      }

      @media (max-height: 860px) {
        [data-bug-detector-ui][class*="fixed inset-0 z-[10000]"][class*="items-center"] {
          padding-top: 10px !important;
          padding-bottom: 14px !important;
        }

        [data-bug-detector-ui][class*="fixed inset-0 z-[10000]"] > div[class*="max-w-2xl"] {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
      }

      [data-bug-detector-ui] textarea,
      [data-bug-detector-ui] input,
      [data-bug-detector-ui] select {
        background: rgba(243, 236, 220, 0.98) !important;
        color: #18212f !important;
        border-color: rgba(244, 201, 107, 0.34) !important;
        box-shadow: 0 0 0 1px rgba(255,255,255,0.02) inset !important;
      }

      [data-bug-detector-ui] textarea::placeholder,
      [data-bug-detector-ui] input::placeholder {
        color: rgba(24, 33, 47, 0.48) !important;
      }

      [data-bug-detector-ui] label,
      [data-bug-detector-ui] .text-slate-500,
      [data-bug-detector-ui] .text-slate-400 {
        color: var(--tpv-bd-muted) !important;
      }

      [data-bug-detector-ui] .text-white,
      [data-bug-detector-ui] .text-slate-300,
      [data-bug-detector-ui] .text-cyan-400,
      [data-bug-detector-ui] .text-emerald-300 {
        color: var(--tpv-bd-ink) !important;
      }

      [data-bug-detector-ui] .border-slate-700,
      [data-bug-detector-ui] .border-slate-700\\/50,
      [data-bug-detector-ui] .border-slate-800,
      [data-bug-detector-ui] .border-slate-600 {
        border-color: var(--tpv-bd-line) !important;
      }

      [data-bug-detector-ui] .bg-slate-900,
      [data-bug-detector-ui] .bg-slate-900\\/50,
      [data-bug-detector-ui] .bg-slate-900\\/30,
      [data-bug-detector-ui] .bg-slate-900\\/60,
      [data-bug-detector-ui] .bg-slate-800,
      [data-bug-detector-ui] .bg-slate-800\\/50,
      [data-bug-detector-ui] .bg-slate-800\\/30,
      [data-bug-detector-ui] .bg-slate-800\\/20 {
        background: var(--tpv-bd-panel-soft) !important;
      }

      [data-bug-detector-ui] .rounded-2xl,
      [data-bug-detector-ui] .rounded-3xl {
        border-radius: 22px !important;
      }

      [data-bug-detector-ui] .bg-black,
      [data-bug-detector-ui] .bg-black\\/60,
      [data-bug-detector-ui] .bg-black\\/70 {
        background-color: rgba(4, 10, 18, 0.88) !important;
      }

      [data-bug-detector-ui] button {
        transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, border-color 0.16s ease !important;
      }

      [data-bug-detector-ui] button:hover {
        transform: translateY(-1px);
      }

      [data-bug-detector-ui] button:not(:disabled):active {
        transform: translateY(0);
      }

      [data-bug-detector-ui] .from-red-500.to-orange-500,
      [data-bug-detector-ui] .bg-red-500\\/90 {
        background: linear-gradient(135deg, #ef7c63, #d85858) !important;
      }

      [data-bug-detector-ui] button[style*="linear-gradient(135deg"] {
        box-shadow: 0 18px 40px rgba(47, 185, 109, 0.24) !important;
      }

      [data-bug-detector-ui] img,
      [data-bug-detector-ui] video {
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
      }

      [data-bug-detector-ui] code {
        background: rgba(244, 201, 107, 0.14) !important;
        color: #fff3cf !important;
        border-radius: 8px !important;
        padding-inline: 8px !important;
      }

      [data-bug-detector-ui] .text-red-400 {
        color: #ff9b8e !important;
      }

      [data-bug-detector-ui] .text-green-400,
      [data-bug-detector-ui] .text-emerald-400 {
        color: #8cf0b9 !important;
      }

      [data-bug-detector-ui] .text-yellow-400,
      [data-bug-detector-ui] .text-amber-400 {
        color: #ffd87f !important;
      }

      [data-bug-detector-ui] .text-blue-500,
      [data-bug-detector-ui] .text-blue-400 {
        color: #8fdcff !important;
      }

      [data-bug-detector-ui] h1,
      [data-bug-detector-ui] h2,
      [data-bug-detector-ui] h3 {
        letter-spacing: -0.02em;
      }

      [data-bug-detector-ui] ol li::marker {
        color: var(--tpv-bd-gold) !important;
      }

      body {
        ${isAnyOverlayOpen ? 'overflow: hidden;' : ''}
      }
    `}</style>
  );
}

function BugDetectorInteractionShield() {
  return (
    <div
      data-bug-detector-ui
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 6, 23, 0.4)',
      }}
    />
  );
}

function BugDetectorCommandDock({
  isOverlayActive,
  isInspecting,
  isKimiReady,
  stats,
  workspaceCount,
  onInspect,
  onOpenPanel,
  onOpenWorkspace,
  onPrint,
}: {
  isOverlayActive: boolean;
  isInspecting: boolean;
  isKimiReady: boolean;
  stats: BugStats;
  workspaceCount: number;
  onInspect: () => void;
  onOpenPanel: () => void;
  onOpenWorkspace: () => void;
  onPrint: () => void;
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => setPulse(true), 800);
    const end = setTimeout(() => setPulse(false), 2600);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, []);

  if (isOverlayActive || isInspecting) return null;

  return (
    <>
      <style>{`
        @keyframes tpv-bug-detector-pulse {
          0% { transform: scale(1); box-shadow: 0 10px 30px rgba(76, 175, 80, 0.24); }
          50% { transform: scale(1.04); box-shadow: 0 14px 40px rgba(76, 175, 80, 0.32); }
          100% { transform: scale(1); box-shadow: 0 10px 30px rgba(76, 175, 80, 0.24); }
        }
      `}</style>

      <div
        data-bug-detector-ui
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 10003,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: 10,
            borderRadius: 26,
            background: 'linear-gradient(180deg, rgba(13, 20, 31, 0.96), rgba(18, 30, 46, 0.94))',
            border: '1px solid rgba(244, 201, 107, 0.2)',
            boxShadow: '0 28px 70px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <DockButton label="Inspecionar" accent="#4CAF50" onClick={onInspect} />
          <DockButton label={`Nativo ${stats.total}`} accent="#0ea5e9" onClick={onOpenPanel} />
          <DockButton
            label={`Workspace ${workspaceCount}`}
            accent={isKimiReady ? '#22c55e' : '#f59e0b'}
            onClick={onOpenWorkspace}
          />
          <DockButton label="Print" accent="#f59e0b" onClick={() => void onPrint()} />
        </div>

        <div
          data-bug-detector-ui
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 12px',
            borderRadius: 999,
            background: 'linear-gradient(180deg, rgba(17, 27, 40, 0.98), rgba(11, 19, 31, 0.94))',
            border: '1px solid rgba(244, 201, 107, 0.22)',
            color: '#f8f4ea',
            fontSize: 11,
            fontWeight: 700,
            boxShadow: '0 14px 32px rgba(0, 0, 0, 0.32)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: isKimiReady ? '#4ade80' : '#fbbf24',
              boxShadow: `0 0 14px ${isKimiReady ? '#4ade80' : '#fbbf24'}`,
            }}
          />
          <span style={{ color: isKimiReady ? '#4ade80' : '#fbbf24' }}>IA Kimi</span>
          <span style={{ color: 'rgba(255,255,255,0.56)' }}>
            {isKimiReady ? `ativa em ${KIMI_MODEL}` : 'aguardando chave'}
          </span>
        </div>

        <button
          onClick={onInspect}
          title="Inspecionar elemento"
          data-bug-detector-ui
          style={{
            minWidth: 146,
            height: 58,
            padding: '0 20px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #1d8c5d, #4fd08b 58%, #f4c96b 130%)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 18px 40px rgba(35, 157, 103, 0.32)',
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: 0.2,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
            animation: pulse ? 'tpv-bug-detector-pulse 1.8s ease-in-out' : 'none',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform = 'translateY(-1px)';
            event.currentTarget.style.boxShadow = '0 14px 40px rgba(76, 175, 80, 0.32)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = 'translateY(0)';
            event.currentTarget.style.boxShadow = '0 10px 30px rgba(76, 175, 80, 0.24)';
          }}
        >
          Bug Detector
        </button>
      </div>
    </>
  );
}

function BugDetectorWorkspacePanel({
  isOpen,
  report,
  meta,
  reports,
  workspace,
  onClose,
  onSelectReport,
  onOpenNativeReport,
  onStatusChange,
  onPriorityChange,
  onOwnerChange,
  onAddComment,
  onRunKimi,
  onExport,
}: {
  isOpen: boolean;
  report: BugReport | null;
  meta?: WorkspaceMeta;
  reports: BugReport[];
  workspace: WorkspaceStore;
  onClose: () => void;
  onSelectReport: (reportId: string) => void;
  onOpenNativeReport: (reportId: string) => void;
  onStatusChange: (reportId: string, status: WorkspaceStatus) => void;
  onPriorityChange: (reportId: string, priority: WorkspacePriority) => void;
  onOwnerChange: (reportId: string, owner: string) => void;
  onAddComment: (reportId: string, author: string, message: string) => void;
  onRunKimi: (reportId: string) => void;
  onExport: (reportId: string, format: ExportOptions['format']) => Promise<void>;
}) {
  const [commentAuthor, setCommentAuthor] = useState('Equipe');
  const [commentMessage, setCommentMessage] = useState('');

  useEffect(() => {
    setCommentMessage('');
  }, [report?.id]);

  if (!isOpen) return null;

  return (
    <div
      className="tpv-bug-detector-workspace-panel"
      data-bug-detector-ui
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 10004,
        width: 'min(1260px, 100vw)',
        background: 'linear-gradient(180deg, rgba(8, 14, 24, 0.99), rgba(15, 24, 37, 0.99))',
        borderLeft: '1px solid rgba(244, 201, 107, 0.16)',
        boxShadow: '-30px 0 70px rgba(0, 0, 0, 0.48)',
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div
        style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: 20,
          overflowY: 'auto',
          background: 'linear-gradient(180deg, rgba(11, 18, 28, 0.98), rgba(16, 26, 39, 0.92))',
        }}
      >
        <div
          style={{
            marginBottom: 18,
            padding: 18,
            borderRadius: 24,
            background:
              'radial-gradient(circle at top right, rgba(244, 201, 107, 0.18), transparent 26%), linear-gradient(180deg, rgba(24, 39, 58, 0.96), rgba(13, 22, 35, 0.94))',
            border: '1px solid rgba(244, 201, 107, 0.18)',
            boxShadow: '0 22px 48px rgba(0, 0, 0, 0.22)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ color: '#fff4d2', fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                Auris Labs
              </div>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 900, lineHeight: 1.05, marginBottom: 8 }}>
                Inspect + IA Workspace
              </div>
              <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: 12, lineHeight: 1.5 }}>
                Triagem, comentarios, artefatos e handoff com cara de produto premium.
              </div>
            </div>
            <button onClick={onClose} style={ghostButtonStyle}>
              Fechar
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <MetricCard label="Reports vivos" value={String(reports.length)} accent="#f4c96b" />
            <MetricCard
              label="Kimi Ops"
              value={KIMI_API_KEY ? 'Ativo' : 'Config'}
              accent={KIMI_API_KEY ? '#4ade80' : '#fbbf24'}
            />
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 800, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 10 }}>
          Queue viva
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.map((item) => {
            const itemMeta = workspace[item.id] ?? createDefaultMeta(item);
            const title = itemMeta.insight?.title || deriveFallbackTitle(item);
            const active = report?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectReport(item.id)}
                style={{
                  textAlign: 'left',
                  padding: 15,
                  borderRadius: 22,
                  border: active ? '1px solid rgba(79, 208, 139, 0.46)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: active
                    ? 'radial-gradient(circle at top right, rgba(79, 208, 139, 0.14), transparent 28%), linear-gradient(180deg, rgba(25, 48, 41, 0.95), rgba(16, 29, 42, 0.95))'
                    : 'linear-gradient(180deg, rgba(18, 28, 42, 0.88), rgba(13, 20, 32, 0.84))',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: active ? '0 18px 34px rgba(35, 157, 103, 0.16)' : '0 10px 24px rgba(0, 0, 0, 0.12)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{title}</span>
                  <StatusPill label={statusLabels[itemMeta.status]} tone={statusTone(itemMeta.status)} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: 11, marginBottom: 10 }}>
                  {item.element.selector}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <StatusPill label={priorityLabels[itemMeta.priority]} tone={priorityTone(itemMeta.priority)} />
                  <StatusPill label={item.type} tone="#0ea5e9" />
                  <StatusPill label={itemMeta.aiState === 'ready' ? 'IA pronta' : itemMeta.aiState === 'loading' ? 'IA rodando' : 'IA pendente'} tone={itemMeta.aiState === 'ready' ? '#22c55e' : itemMeta.aiState === 'loading' ? '#f59e0b' : '#64748b'} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: 24, overflowY: 'auto' }}>
        {!report || !meta ? (
          <div style={{ color: '#fff' }}>Selecione um report para abrir o workspace.</div>
        ) : (
          <>
            <div
              style={{
                marginBottom: 20,
                padding: 22,
                borderRadius: 28,
                background:
                  'radial-gradient(circle at top right, rgba(244, 201, 107, 0.16), transparent 22%), radial-gradient(circle at left top, rgba(79, 208, 139, 0.14), transparent 26%), linear-gradient(180deg, rgba(17, 27, 42, 0.92), rgba(10, 18, 29, 0.9))',
                border: '1px solid rgba(244, 201, 107, 0.16)',
                boxShadow: '0 20px 44px rgba(0, 0, 0, 0.22)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
                <div>
                  <div style={{ color: '#fff4d2', fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
                    Live triage cockpit
                  </div>
                  <div style={{ color: '#fff', fontSize: 30, fontWeight: 900, marginBottom: 8, lineHeight: 1.05 }}>
                    {meta.insight?.title || deriveFallbackTitle(report)}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.66)', fontSize: 14, maxWidth: 760, lineHeight: 1.6 }}>
                    {meta.insight?.summary || report.description}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button onClick={() => onOpenNativeReport(report.id)} style={ghostButtonStyle}>
                    Painel nativo
                  </button>
                  <button onClick={() => onRunKimi(report.id)} style={primaryButtonStyle('#22c55e')}>
                    {meta.aiState === 'loading' ? 'Analisando...' : 'Rodar Kimi'}
                  </button>
                  <button onClick={() => void onExport(report.id, 'markdown')} style={ghostButtonStyle}>
                    Markdown
                  </button>
                  <button onClick={() => void onExport(report.id, 'json')} style={ghostButtonStyle}>
                    JSON
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: 12,
                }}
              >
                <MetricCard label="Status atual" value={statusLabels[meta.status]} accent={statusTone(meta.status)} />
                <MetricCard label="Prioridade" value={priorityLabels[meta.priority]} accent={priorityTone(meta.priority)} />
                <MetricCard label="Tipo" value={report.type} accent="#66d9ff" />
                <MetricCard label="App" value={inferAppContext(report.url)} accent="#f4c96b" />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginBottom: 18,
              }}
            >
              <FieldCard label="Status">
                <SelectLike
                  value={meta.status}
                  options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
                  onChange={(value) => onStatusChange(report.id, value as WorkspaceStatus)}
                />
              </FieldCard>
              <FieldCard label="Prioridade">
                <SelectLike
                  value={meta.priority}
                  options={Object.entries(priorityLabels).map(([value, label]) => ({ value, label }))}
                  onChange={(value) => onPriorityChange(report.id, value as WorkspacePriority)}
                />
              </FieldCard>
              <FieldCard label="Owner">
                <input
                  value={meta.owner}
                  onChange={(event) => onOwnerChange(report.id, event.target.value)}
                  placeholder="Ex: Frontend, Caixa, API"
                  style={inputStyle}
                />
              </FieldCard>
              <FieldCard label="Elemento">
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{report.element.tag}</div>
                <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: 12, marginTop: 4, wordBreak: 'break-word' }}>
                  {report.element.selector}
                </div>
              </FieldCard>
            </div>

            {meta.aiError && (
              <div
                style={{
                  marginBottom: 18,
                  borderRadius: 18,
                  padding: 15,
                  border: '1px solid rgba(251, 191, 36, 0.35)',
                  background: 'linear-gradient(180deg, rgba(120, 53, 15, 0.28), rgba(69, 26, 3, 0.22))',
                  color: '#fde68a',
                  fontSize: 13,
                }}
              >
                {meta.aiError}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
                gap: 18,
                alignItems: 'start',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <WorkspaceSection title="IA Kimi">
                  <div style={{ display: 'grid', gap: 14 }}>
                    <InsightCard label="Resumo executivo" value={meta.insight?.summary || 'Execute a analise Kimi para gerar um resumo automatico.'} />
                    <InsightCard label="Impacto no usuario" value={meta.insight?.userImpact || 'Ainda nao calculado.'} />
                    <InsightCard label="Area suspeita" value={meta.insight?.suspectedArea || 'Ainda nao calculada.'} />
                    <InsightCard label="Direcao de correcao" value={meta.insight?.fixDirection || 'Ainda nao sugerida.'} />
                    <div
                      style={{
                        padding: 18,
                        borderRadius: 20,
                        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.84), rgba(10, 18, 32, 0.82))',
                        border: '1px solid rgba(148, 163, 184, 0.12)',
                      }}
                    >
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                        Passos de reproducao
                      </div>
                      <ol style={{ margin: 0, paddingLeft: 18, color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.6 }}>
                        {(meta.insight?.reproductionSteps?.length ? meta.insight.reproductionSteps : deriveFallbackSteps(report)).map((step, index) => (
                          <li key={`${step}-${index}`}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </WorkspaceSection>

                <WorkspaceSection title="Comentarios do time">
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 10 }}>
                      <input
                        value={commentAuthor}
                        onChange={(event) => setCommentAuthor(event.target.value)}
                        placeholder="Autor"
                        style={inputStyle}
                      />
                      <input
                        value={commentMessage}
                        onChange={(event) => setCommentMessage(event.target.value)}
                        placeholder="Adicionar contexto, observacao ou handoff"
                        style={inputStyle}
                      />
                      <button
                        onClick={() => {
                          onAddComment(report.id, commentAuthor, commentMessage);
                          setCommentMessage('');
                        }}
                        style={primaryButtonStyle('#0ea5e9')}
                      >
                        Comentar
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: 10 }}>
                      {meta.comments.length === 0 ? (
                        <div style={emptyBoxStyle}>Nenhum comentario ainda. Use este espaco para triagem, handoff e follow-up.</div>
                      ) : (
                        meta.comments.map((comment) => (
                          <div
                            key={comment.id}
                            style={{
                              padding: 14,
                              borderRadius: 16,
                              background: 'linear-gradient(180deg, rgba(18, 28, 41, 0.78), rgba(12, 19, 29, 0.82))',
                              border: '1px solid rgba(148, 163, 184, 0.12)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{comment.author}</div>
                              <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: 11 }}>
                                {new Date(comment.createdAt).toLocaleString('pt-BR')}
                              </div>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.74)', fontSize: 13, lineHeight: 1.55 }}>{comment.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </WorkspaceSection>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <WorkspaceSection title="Artefatos">
                  <div style={{ display: 'grid', gap: 12 }}>
                    {report.screenshot ? (
                      <img
                        src={report.screenshot}
                        alt="Screenshot do report"
                        style={{
                          width: '100%',
                          maxHeight: 280,
                          objectFit: 'cover',
                          borderRadius: 20,
                          border: '1px solid rgba(148, 163, 184, 0.16)',
                        }}
                      />
                    ) : (
                      <div style={emptyBoxStyle}>Este report nao tem screenshot anexado.</div>
                    )}

                    {report.video ? (
                      <video
                        src={report.video}
                        controls
                        style={{
                          width: '100%',
                          borderRadius: 20,
                          border: '1px solid rgba(148, 163, 184, 0.16)',
                          background: '#000',
                        }}
                      />
                    ) : (
                      <div style={emptyBoxStyle}>Nenhum video gravado neste report.</div>
                    )}
                  </div>
                </WorkspaceSection>

                <WorkspaceSection title="Brief tecnico">
                  <div style={{ display: 'grid', gap: 10 }}>
                    <InsightCard label="Descricao original" value={report.description} />
                    <InsightCard label="Comportamento esperado" value={report.expectedBehavior || 'Nao informado.'} />
                    <InsightCard label="URL" value={report.url} />
                    <InsightCard
                      label="Contexto Kimi"
                      value={
                        meta.insight
                          ? `Modelo ${meta.insight.model} gerado em ${new Date(meta.insight.generatedAt).toLocaleString('pt-BR')} com confianca ${meta.insight.confidence}.`
                          : 'Aguardando analise Kimi.'
                      }
                    />
                  </div>
                </WorkspaceSection>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DockButton({
  label,
  accent,
  onClick,
}: {
  label: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-bug-detector-ui
      style={{
        border: '1px solid rgba(244, 201, 107, 0.14)',
        background: 'linear-gradient(180deg, rgba(27, 40, 58, 0.9), rgba(15, 24, 36, 0.9))',
        color: '#f8f4ea',
        borderRadius: 16,
        padding: '10px 12px',
        fontSize: 12,
        fontWeight: 800,
        cursor: 'pointer',
        minWidth: 98,
        letterSpacing: 0.15,
        boxShadow: `inset 0 0 0 1px ${accent}26, 0 12px 24px rgba(0, 0, 0, 0.18)`,
      }}
    >
      {label}
    </button>
  );
}

function MetricCard({ label, value, accent = '#0ea5e9' }: { label: string; value: string; accent?: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        background:
          'radial-gradient(circle at top right, rgba(244, 201, 107, 0.08), transparent 30%), linear-gradient(180deg, rgba(18, 30, 45, 0.9), rgba(13, 20, 32, 0.84))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ color: 'rgba(255,255,255,0.52)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.9 }}>{label}</div>
      <div style={{ color: accent, fontSize: 24, fontWeight: 900, lineHeight: 1.05 }}>{value}</div>
    </div>
  );
}

function WorkspaceSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        padding: 18,
        borderRadius: 24,
        background:
          'radial-gradient(circle at top right, rgba(244, 201, 107, 0.06), transparent 32%), linear-gradient(180deg, rgba(17, 27, 42, 0.9), rgba(10, 18, 29, 0.84))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 18px 38px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div style={{ color: '#fff', fontSize: 16, fontWeight: 900, marginBottom: 14, letterSpacing: -0.02 }}>
        {title}
      </div>
      {children}
    </section>
  );
}

function FieldCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        background: 'linear-gradient(180deg, rgba(21, 32, 48, 0.82), rgba(14, 22, 33, 0.8))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div style={{ color: 'rgba(255,255,255,0.52)', fontSize: 11, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function SelectLike({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        background: 'linear-gradient(180deg, rgba(24, 36, 53, 0.78), rgba(13, 21, 31, 0.82))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 8 }}>{label}</div>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 8px',
        borderRadius: 999,
        background: `${tone}22`,
        border: `1px solid ${tone}44`,
        color: tone,
        fontSize: 10,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
      }}
    >
      {label}
    </span>
  );
}

async function generateKimiInsight(report: BugReport): Promise<KimiInsight> {
  const response = await fetch(`${KIMI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a startup-grade bug triage copilot for a POS/kiosk system. Return only valid JSON with keys: title, summary, reproductionSteps, suspectedArea, userImpact, fixDirection, suggestedOwner, confidence. reproductionSteps must be an array of short strings. confidence must be one of low, medium, high.',
        },
        buildKimiUserMessage(report),
      ],
      temperature: 0.6,
      thinking: { type: 'disabled' },
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar Kimi: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('Kimi retornou uma resposta vazia.');
  }

  const payload = typeof rawContent === 'string' ? extractJsonBlock(rawContent) : rawContent;

  return normalizeInsight(payload);
}

function buildKimiUserMessage(report: BugReport) {
  const textBlock = [
    'Analyze this front-end bug report from a multi-app ice cream POS project.',
    `Type: ${report.type}`,
    `Severity: ${report.severity}`,
    `Page title: ${report.pageTitle}`,
    `URL: ${report.url}`,
    `Element tag: ${report.element.tag}`,
    `Element selector: ${report.element.selector}`,
    `Element text: ${report.element.textContent || 'n/a'}`,
    `Description: ${report.description}`,
    `Expected behavior: ${report.expectedBehavior || 'n/a'}`,
    `Console log count: ${report.consoleLogs?.length ?? 0}`,
    `Network request count: ${report.networkRequests?.length ?? 0}`,
    `App context guess: ${inferAppContext(report.url)}`,
  ].join('\n');

  if (report.screenshot) {
    return {
      role: 'user',
      content: [
        { type: 'text', text: textBlock },
        {
          type: 'image_url',
          image_url: {
            url: report.screenshot,
          },
        },
      ],
    };
  }

  return {
    role: 'user',
    content: textBlock,
  };
}

function normalizeInsight(payload: unknown): KimiInsight {
  const object = typeof payload === 'object' && payload ? (payload as Record<string, unknown>) : {};
  const steps = Array.isArray(object.reproductionSteps)
    ? object.reproductionSteps.map((step) => String(step)).filter(Boolean)
    : [];

  return {
    title: String(object.title || 'Triagem automatica do report'),
    summary: String(object.summary || 'Resumo nao disponivel.'),
    reproductionSteps: steps.length > 0 ? steps : ['Abrir a tela afetada', 'Interagir com o elemento reportado', 'Observar o comportamento incorreto'],
    suspectedArea: String(object.suspectedArea || 'UI / evento do componente'),
    userImpact: String(object.userImpact || 'Impacto no usuario ainda nao quantificado.'),
    fixDirection: String(object.fixDirection || 'Revisar handler, estado e feedback visual do elemento reportado.'),
    suggestedOwner: String(object.suggestedOwner || 'Frontend'),
    confidence: normalizeConfidence(object.confidence),
    generatedAt: new Date().toISOString(),
    model: KIMI_MODEL,
  };
}

function normalizeConfidence(value: unknown): 'low' | 'medium' | 'high' {
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  return 'medium';
}

function extractJsonBlock(raw: string): unknown {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Nao foi possivel extrair JSON da resposta do Kimi.');
  }
  return JSON.parse(match[0]);
}

function readWorkspaceStore(): WorkspaceStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? (parsed as WorkspaceStore) : {};
  } catch {
    return {};
  }
}

function writeWorkspaceStore(store: WorkspaceStore) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(store));
}

function createDefaultMeta(report: Pick<BugReport, 'id' | 'severity'>): WorkspaceMeta {
  const now = new Date().toISOString();
  return {
    reportId: report.id,
    owner: '',
    status: 'new',
    priority: reportSeverityToPriority(report.severity),
    comments: [],
    aiState: 'idle',
    createdAt: now,
    updatedAt: now,
  };
}

function reportSeverityToPriority(severity: BugReport['severity']): WorkspacePriority {
  if (severity === 'critical') return 'critical';
  if (severity === 'high') return 'high';
  if (severity === 'medium') return 'medium';
  return 'low';
}

function deriveFallbackTitle(report: BugReport): string {
  const raw = report.description.split('\n').find((line) => line.trim());
  return raw?.trim().slice(0, 72) || `Report ${report.id.slice(0, 6)}`;
}

function deriveFallbackSteps(report: BugReport): string[] {
  return [
    `Abrir ${inferAppContext(report.url)} e navegar ate a area afetada.`,
    `Interagir com o elemento ${report.element.selector}.`,
    'Comparar o comportamento atual com o esperado informado no report.',
  ];
}

function inferAppContext(url: string): string {
  if (url.includes('kiosk')) return 'Kiosk';
  if (url.includes('cliente')) return 'Cliente';
  if (url.includes('admin')) return 'Admin';
  if (url.includes('kds')) return 'KDS';
  return 'app principal';
}

function statusTone(status: WorkspaceStatus): string {
  switch (status) {
    case 'new':
      return '#38bdf8';
    case 'triaged':
      return '#f59e0b';
    case 'in_progress':
      return '#a78bfa';
    case 'blocked':
      return '#ef4444';
    case 'done':
      return '#22c55e';
  }
}

function priorityTone(priority: WorkspacePriority): string {
  switch (priority) {
    case 'low':
      return '#60a5fa';
    case 'medium':
      return '#fbbf24';
    case 'high':
      return '#fb7185';
    case 'critical':
      return '#ef4444';
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 42,
  borderRadius: 12,
  border: '1px solid rgba(244, 201, 107, 0.24)',
  background: 'rgba(247, 239, 224, 0.98)',
  color: '#18212f',
  padding: '10px 12px',
  fontSize: 13,
  outline: 'none',
};

const emptyBoxStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: 'linear-gradient(180deg, rgba(19, 28, 42, 0.72), rgba(12, 19, 29, 0.68))',
  border: '1px dashed rgba(244, 201, 107, 0.2)',
  color: 'rgba(248,244,234,0.6)',
  fontSize: 13,
  lineHeight: 1.6,
};

const ghostButtonStyle: React.CSSProperties = {
  height: 38,
  borderRadius: 12,
  padding: '0 12px',
  border: '1px solid rgba(244, 201, 107, 0.18)',
  background: 'linear-gradient(180deg, rgba(27, 40, 58, 0.82), rgba(16, 24, 36, 0.84))',
  color: '#f8f4ea',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

function primaryButtonStyle(color: string): React.CSSProperties {
  return {
    height: 38,
    borderRadius: 12,
    padding: '0 14px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: `linear-gradient(135deg, ${color}, #f4c96b)`,
    color: '#102030',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 14px 28px rgba(0, 0, 0, 0.2)',
  };
}
