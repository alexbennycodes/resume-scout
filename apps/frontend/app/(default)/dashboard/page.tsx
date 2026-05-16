'use client';

import { ResumeUploadDialog } from '@/components/dashboard/resume-upload-dialog';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { cn } from '@/lib/utils';

import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Settings from 'lucide-react/dist/esm/icons/settings';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

import {
  fetchResume,
  fetchResumeList,
  deleteResume,
  retryProcessing,
  fetchJobDescription,
  type ResumeListItem,
} from '@/lib/api/resume';
import { useStatusCache } from '@/lib/context/status-cache';

type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'loading';

export default function DashboardPage() {
  const { t, locale } = useTranslations();
  const [masterResumeId, setMasterResumeId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('loading');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tailoredResumes, setTailoredResumes] = useState<ResumeListItem[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const router = useRouter();

  const {
    status: systemStatus,
    isLoading: statusLoading,
    incrementResumes,
    decrementResumes,
    setHasMasterResume,
  } = useStatusCache();

  const loadRequestIdRef = useRef(0);
  const jobSnippetCacheRef = useRef<Record<string, string>>({});

  const isLlmConfigured = !statusLoading && systemStatus?.llm_configured;

  const isTailorEnabled =
    Boolean(masterResumeId) && processingStatus === 'ready' && isLlmConfigured;

  const formatDate = (value: string) => {
    if (!value) return t('common.unknown');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t('common.unknown');

    const dateLocale =
      locale === 'es' ? 'es-ES' : locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US';

    return date.toLocaleDateString(dateLocale, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const checkResumeStatus = useCallback(async (resumeId: string) => {
    try {
      setProcessingStatus('loading');
      const data = await fetchResume(resumeId);
      const status = data.raw_resume?.processing_status || 'pending';
      setProcessingStatus(status as ProcessingStatus);
    } catch (err: unknown) {
      console.error('Failed to check resume status:', err);
      if (err instanceof Error && err.message.includes('404')) {
        localStorage.removeItem('master_resume_id');
        setMasterResumeId(null);
        return;
      }
      setProcessingStatus('failed');
    }
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem('master_resume_id');
    if (storedId) {
      setMasterResumeId(storedId);
      checkResumeStatus(storedId);
    }
  }, [checkResumeStatus]);

  const loadTailoredResumes = useCallback(async () => {
    try {
      const data = await fetchResumeList(true);
      const masterFromList = data.find((r) => r.is_master);
      const storedId = localStorage.getItem('master_resume_id');
      const resolvedMasterId = masterFromList?.resume_id || storedId;

      if (resolvedMasterId) {
        localStorage.setItem('master_resume_id', resolvedMasterId);
        setMasterResumeId(resolvedMasterId);
        checkResumeStatus(resolvedMasterId);
      } else {
        localStorage.removeItem('master_resume_id');
        setMasterResumeId(null);
      }

      const filtered = data.filter((r) => r.resume_id !== resolvedMasterId);
      setTailoredResumes(filtered);

      const tailoredWithParent = filtered.filter((r) => r.parent_id);
      const requestId = ++loadRequestIdRef.current;

      const jobSnippets: Record<string, string> = {};
      await Promise.all(
        tailoredWithParent.map(async (r) => {
          if (jobSnippetCacheRef.current[r.resume_id]) {
            jobSnippets[r.resume_id] = jobSnippetCacheRef.current[r.resume_id];
            return;
          }
          try {
            const jd = await fetchJobDescription(r.resume_id);
            const snippet = (jd?.content || '').slice(0, 80);
            jobSnippetCacheRef.current[r.resume_id] = snippet;
            jobSnippets[r.resume_id] = snippet;
          } catch {
            jobSnippetCacheRef.current[r.resume_id] = '';
            jobSnippets[r.resume_id] = '';
          }
        })
      );

      if (requestId === loadRequestIdRef.current) {
        setTailoredResumes((prev) =>
          prev.map((r) => ({ ...r, jobSnippet: jobSnippets[r.resume_id] || '' }))
        );
      }
    } catch (err) {
      console.error('Failed to load tailored resumes:', err);
    }
  }, [checkResumeStatus]);

  useEffect(() => {
    loadTailoredResumes();
  }, [loadTailoredResumes]);

  useEffect(() => {
    const handleFocus = () => {
      loadTailoredResumes();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadTailoredResumes, checkResumeStatus]);

  const handleUploadComplete = (resumeId: string) => {
    localStorage.setItem('master_resume_id', resumeId);
    setMasterResumeId(resumeId);
    checkResumeStatus(resumeId);
    incrementResumes();
    setHasMasterResume(true);
  };

  const handleRetryProcessing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!masterResumeId) return;
    setIsRetrying(true);
    try {
      const result = await retryProcessing(masterResumeId);
      if (result.processing_status === 'ready') {
        setProcessingStatus('ready');
      } else if (
        result.processing_status === 'processing' ||
        result.processing_status === 'pending'
      ) {
        setProcessingStatus(result.processing_status);
      } else {
        setProcessingStatus('failed');
      }
    } catch (err) {
      console.error('Retry processing failed:', err);
      setProcessingStatus('failed');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDeleteAndReupload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDeleteAndReupload = async () => {
    if (!masterResumeId) return;
    try {
      await deleteResume(masterResumeId);
      decrementResumes();
      setHasMasterResume(false);
      localStorage.removeItem('master_resume_id');
      setMasterResumeId(null);
      setProcessingStatus('loading');
      setIsUploadDialogOpen(true);
      await loadTailoredResumes();
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  const getStatusDisplay = () => {
    switch (processingStatus) {
      case 'loading':
        return {
          text: t('dashboard.status.checking'),
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          color: 'text-muted-foreground',
        };
      case 'processing':
        return {
          text: t('dashboard.status.processing'),
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          color: 'text-primary',
        };
      case 'ready':
        return { text: t('dashboard.status.ready'), icon: null, color: 'text-green-700' };
      case 'failed':
        return {
          text: t('dashboard.status.failed'),
          icon: <AlertCircle className="w-3 h-3" />,
          color: 'text-destructive',
        };
      default:
        return { text: t('dashboard.status.pending'), icon: null, color: 'text-muted-foreground' };
    }
  };

  const getMonogram = (title: string): string => {
    const words = title.split(/\s+/).filter((w) => /^[a-zA-Z]/.test(w));
    return words
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  };

  const cardPalette = [
    { bg: 'oklch(0.58 0.21 260)', fg: '#FFFFFF' },
    { bg: 'oklch(0.55 0.18 150)', fg: '#FFFFFF' },
    { bg: 'oklch(0.25 0.03 260)', fg: '#FFFFFF' },
    { bg: 'oklch(0.55 0.15 60)', fg: '#FFFFFF' },
    { bg: 'oklch(0.55 0.20 300)', fg: '#FFFFFF' },
    { bg: 'oklch(0.55 0.15 200)', fg: '#FFFFFF' },
    { bg: 'oklch(0.50 0.20 25)', fg: '#FFFFFF' },
    { bg: 'oklch(0.50 0.18 280)', fg: '#FFFFFF' },
  ];

  const hashTitle = (title: string): number => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = (hash << 5) - hash + title.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-5xl leading-[1] mb-2">{t('nav.dashboard')}</h1>
          <p className="text-muted-foreground text-lg">Manage and create your tailored resumes</p>
        </div>

        {/* Configuration Warning Banner */}
        {masterResumeId && !isLlmConfigured && !statusLoading && (
          <div className="rounded-2xl border border-warning/50 bg-amber-50 p-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-amber-800">
                  {t('dashboard.llmNotConfiguredTitle')}
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  {t('dashboard.llmNotConfiguredMessage')}
                </p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                {t('nav.settings')}
              </Button>
            </Link>
          </div>
        )}

        {/* Master Resume Section */}
        <div className="mb-8">
          {!masterResumeId ? (
            !isLlmConfigured && !statusLoading ? (
              <Link href="/settings">
                <Card className="rounded-2xl border-dashed border-warning/50 bg-amber-50 hover:border-warning cursor-pointer">
                  <div className="p-8 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-warning" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-amber-800 mb-2">
                        {t('dashboard.setupRequiredTitle')}
                      </CardTitle>
                      <CardDescription className="text-amber-700">
                        {t('dashboard.setupRequiredMessage')}
                      </CardDescription>
                    </div>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      {t('nav.goToSettings')}
                    </Button>
                  </div>
                </Card>
              </Link>
            ) : (
              <ResumeUploadDialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
                onUploadComplete={handleUploadComplete}
                trigger={
                  <Card className="rounded-2xl border-dashed border-border bg-card hover:border-primary cursor-pointer">
                    <div className="p-8 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {t('dashboard.initializeMasterResume')}
                        </CardTitle>
                        <CardDescription>
                          {t('dashboard.initializeSequence')}
                        </CardDescription>
                      </div>
                    </div>
                  </Card>
                }
              />
            )
          ) : (
            <Card
              className="rounded-2xl hover:shadow-[var(--shadow-glow)] cursor-pointer transition-all duration-300"
              onClick={() => router.push(`/resumes/${masterResumeId}`)}
            >
              <div className="p-8 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-[var(--shadow-glow)]">
                  <span className="font-display text-2xl text-primary-foreground">M</span>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    {t('dashboard.masterResume')}
                  </CardTitle>
                  <div className={`text-sm flex items-center gap-2 ${getStatusDisplay().color}`}>
                    {getStatusDisplay().icon}
                    {t('dashboard.statusLine', { status: getStatusDisplay().text })}
                  </div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {(processingStatus === 'failed' || processingStatus === 'processing') && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetryProcessing}
                        disabled={isRetrying}
                      >
                        {isRetrying ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        {isRetrying
                          ? t('dashboard.retryingProcessing')
                          : t('dashboard.retryProcessing')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteAndReupload}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        {t('dashboard.deleteAndReupload')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Tailored Resumes Grid */}
        {tailoredResumes.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-3xl mb-6">{t('dashboard.tailoredResumes')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tailoredResumes.map((resume) => {
                const title =
                  resume.title || resume.jobSnippet || resume.filename || t('dashboard.tailoredResume');
                const color = cardPalette[hashTitle(title) % cardPalette.length];
                return (
                  <Card
                    key={resume.resume_id}
                    className="rounded-2xl hover:shadow-[var(--shadow-glow)] cursor-pointer transition-all duration-300 hover:-translate-y-1"
                    onClick={() => router.push(`/resumes/${resume.resume_id}`)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: color.bg, color: color.fg }}
                        >
                          <span className="font-mono font-bold text-sm">{getMonogram(title)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground uppercase">
                          {resume.processing_status}
                        </span>
                      </div>
                      <CardTitle className="text-base mb-2 line-clamp-2">
                        {title}
                      </CardTitle>
                      <CardDescription>
                        {t('dashboard.edited', {
                          date: formatDate(resume.updated_at || resume.created_at),
                        })}
                      </CardDescription>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Create New Resume */}
        <div>
          <Card
            className={cn(
              'rounded-2xl border-dashed cursor-pointer transition-all duration-300',
              isTailorEnabled
                ? 'hover:border-primary hover:shadow-[var(--shadow-glow)]'
                : 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => isTailorEnabled && router.push('/tailor')}
          >
            <div className="p-8 flex items-center gap-6">
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center',
                isTailorEnabled ? 'bg-primary/10' : 'bg-muted'
              )}>
                <Sparkles className={cn('w-8 h-8', isTailorEnabled ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">
                  {t('dashboard.createResume')}
                </CardTitle>
                <CardDescription>
                  {isTailorEnabled
                    ? 'Tailor your resume for a specific job posting'
                    : 'Upload a master resume first to enable tailoring'}
                </CardDescription>
              </div>
              {isTailorEnabled && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              )}
            </div>
          </Card>
        </div>

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title={t('confirmations.deleteMasterResumeTitle')}
          description={t('confirmations.deleteMasterResumeDescription')}
          confirmLabel={t('dashboard.deleteAndReupload')}
          cancelLabel={t('confirmations.keepResumeCancelLabel')}
          onConfirm={confirmDeleteAndReupload}
          variant="danger"
        />
      </div>
    </div>
  );
}
