import { type ReactNode, createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { BugDetector } from '@auris/bug-detector';
import type { BugDetectorConfig, BugReport, BugStats } from '@auris/bug-detector';

// ============================================================================
// Context
// ============================================================================
interface TPVBugDetectorContextValue {
  isOpen: boolean;
  openReport: () => void;
  closeReport: () => void;
  createReport: (data: { description: string; type?: string; severity?: string }) => Promise<BugReport | null>;
  getReports: () => BugReport[];
  getStats: () => BugStats;
  fetchHealth: () => Promise<{ ok: boolean; status: number; data?: unknown }>;
}

const TPVBugDetectorContext = createContext<TPVBugDetectorContextValue | null>(null);

export function useTPVBugDetector() {
  const ctx = useContext(TPVBugDetectorContext);
  if (!ctx) throw new Error('useTPVBugDetector must be used inside TPVBugDetectorProvider');
  return ctx;
}

// ============================================================================
// Config
// ============================================================================
const config: BugDetectorConfig = {
  trigger: 'manual',
  persistTo: 'localStorage',
  guestMode: true,
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
    buttonText: '🐛',
  },
};

// ============================================================================
// Provider
// ============================================================================
export function TPVBugDetectorProvider({ children }: { children: ReactNode }) {
  const detectorRef = useRef<BugDetector | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [, setReports] = useState<BugReport[]>([]);

  // Initialize detector in headless mode (NEVER activate inspection overlay)
  useEffect(() => {
    detectorRef.current = new BugDetector({
      ...config,
      headless: true,
      callbacks: {
        onReportCreated: (report: BugReport) => {
          setReports((prev) => [...prev, report]);
        },
      },
    });
    setReports(detectorRef.current.getReports());
    return () => {
      // Ensure inspection mode is never left active
      detectorRef.current?.deactivate();
    };
  }, []);

  const openReport = useCallback(() => setIsOpen(true), []);
  const closeReport = useCallback(() => setIsOpen(false), []);

  const createReport = useCallback(
    async (data: { description: string; type?: string; severity?: string }) => {
      if (!detectorRef.current) return null;
      const report = await detectorRef.current.createReport({
        description: data.description,
        type: (data.type as any) || 'bug',
        severity: (data.severity as any) || 'medium',
      });
      setReports(detectorRef.current.getReports());
      return report;
    },
    []
  );

  const getReports = useCallback(() => {
    return detectorRef.current?.getReports() || [];
  }, []);

  const getStats = useCallback(() => {
    const reps = detectorRef.current?.getReports() || [];
    return {
      total: reps.length,
      pending: reps.filter((r) => r.status === 'pending').length,
      open: reps.filter((r) => r.status !== 'resolved' && r.status !== 'rejected').length,
      resolved: reps.filter((r) => r.status === 'resolved').length,
      byType: reps.reduce(
        (acc, r) => {
          acc[r.type] = (acc[r.type] || 0) + 1;
          return acc;
        },
        {} as Record<'bug' | 'improvement' | 'question', number>
      ),
      bySeverity: reps.reduce(
        (acc, r) => {
          acc[r.severity] = (acc[r.severity] || 0) + 1;
          return acc;
        },
        {} as Record<'low' | 'medium' | 'high' | 'critical', number>
      ),
    };
  }, []);

  // Fetch health check - connects to page via fetch to know state
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
    } catch (e) {
      return { ok: false, status: 0, data: String(e) };
    }
  }, []);

  return (
    <TPVBugDetectorContext.Provider
      value={{ isOpen, openReport, closeReport, createReport, getReports, getStats, fetchHealth }}
    >
      {children}
      <BugDetectorFloatingButton />
      {isOpen && <BugReportModal onClose={closeReport} onSubmit={createReport} />}
    </TPVBugDetectorContext.Provider>
  );
}

// ============================================================================
// Floating Button (custom, non-blocking)
// ============================================================================
function BugDetectorFloatingButton() {
  const { openReport } = useTPVBugDetector();
  const [pulse, setPulse] = useState(false);

  // Pulse animation on first load
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 1000);
    const t2 = setTimeout(() => setPulse(false), 3000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  return (
    <button
      onClick={openReport}
      title="Reportar bug ou problema"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2D8A4E, #4CAF50)',
        color: '#fff',
        border: 'none',
        boxShadow: '0 4px 12px rgba(45,138,78,0.4)',
        cursor: 'pointer',
        zIndex: 9999,
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        animation: pulse ? 'bug-detector-pulse 2s ease-in-out' : 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(45,138,78,0.5)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(45,138,78,0.4)';
      }}
    >
      🐛
    </button>
  );
}

// ============================================================================
// Report Modal (custom, does NOT block page interaction when closed)
// ============================================================================
function BugReportModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { description: string; type: string; severity: string }) => Promise<BugReport | null>;
}) {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bug');
  const [severity, setSeverity] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ description: description.trim(), type, severity });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to create report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 600, margin: 0 }}>Report enviado!</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Obrigado por ajudar a melhorar o app.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 600, margin: 0 }}>🐛 Reportar Problema</h3>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 6 }}>
                  Tipo
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'bug', label: 'Bug', color: '#ef4444' },
                    { id: 'improvement', label: 'Melhoria', color: '#f59e0b' },
                    { id: 'other', label: 'Outro', color: '#6b7280' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: type === t.id ? t.color : 'rgba(255,255,255,0.08)',
                        color: type === t.id ? '#fff' : 'rgba(255,255,255,0.6)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 6 }}>
                  Severidade
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'low', label: 'Baixa' },
                    { id: 'medium', label: 'Média' },
                    { id: 'high', label: 'Alta' },
                    { id: 'critical', label: 'Crítica' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeverity(s.id)}
                      style={{
                        flex: 1,
                        padding: '8px 8px',
                        borderRadius: 8,
                        border: 'none',
                        background: severity === s.id ? '#4CAF50' : 'rgba(255,255,255,0.08)',
                        color: severity === s.id ? '#fff' : 'rgba(255,255,255,0.6)',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 6 }}>
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o problema que você encontrou..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: 14,
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !description.trim()}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: submitting ? 'rgba(76,175,80,0.5)' : 'linear-gradient(135deg, #2D8A4E, #4CAF50)',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: submitting || !description.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: submitting || !description.trim() ? 0.7 : 1,
                }}
              >
                {submitting ? 'Enviando...' : 'Enviar Report'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
