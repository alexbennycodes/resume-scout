'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  fetchFeatureConfig,
  updateFeatureConfig,
  fetchPromptConfig,
  updatePromptConfig,
  resetDatabase,
  fetchFeaturePrompts,
  updateFeaturePrompts,
  FeaturePromptsError,
  type PromptOption,
  type FeaturePromptsUpdate,
} from '@/lib/api/config';
import { API_URL } from '@/lib/api/client';
import { getVersionString } from '@/lib/config/version';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { useStatusCache } from '@/lib/context/status-cache';
import { useAuth } from '@/lib/context/auth-context';
import { UsageDisplay } from '@/components/settings/usage-display';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dropdown } from '@/components/ui/dropdown';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Database,
  Activity,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  FileText,
  Briefcase,
  Sparkles,
  Clock,
  Settings2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export default function SettingsPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const {
    status: systemStatus,
    isLoading: statusLoading,
    lastFetched,
    refreshStatus,
  } = useStatusCache();

  const { user } = useAuth();

  const [enableCoverLetter, setEnableCoverLetter] = useState(false);
  const [enableOutreach, setEnableOutreach] = useState(false);
  const [featureConfigLoading, setFeatureConfigLoading] = useState(false);
  const [promptConfigLoading, setPromptConfigLoading] = useState(false);
  const [promptOptions, setPromptOptions] = useState<PromptOption[]>([]);
  const [defaultPromptId, setDefaultPromptId] = useState('keywords');

  const [coverLetterPrompt, setCoverLetterPrompt] = useState('');
  const [outreachPrompt, setOutreachPrompt] = useState('');
  const [coverLetterDefault, setCoverLetterDefault] = useState('');
  const [outreachDefault, setOutreachDefault] = useState('');
  const [featurePromptSaving, setFeaturePromptSaving] = useState<string | null>(null);
  const [featurePromptError, setFeaturePromptError] = useState<{
    field: string;
    missing: string[];
  } | null>(null);

  const [showResetDatabaseDialog, setShowResetDatabaseDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessDialogMessage] = useState({ title: '', description: '' });
  const [isResetting, setIsResetting] = useState(false);

  const { t } = useTranslations();
  const fallbackPromptOptions = useMemo<PromptOption[]>(
    () => [
      {
        id: 'nudge',
        label: t('tailor.promptOptions.nudge.label'),
        description: t('tailor.promptOptions.nudge.description'),
      },
      {
        id: 'keywords',
        label: t('tailor.promptOptions.keywords.label'),
        description: t('tailor.promptOptions.keywords.description'),
      },
      {
        id: 'full',
        label: t('tailor.promptOptions.full.label'),
        description: t('tailor.promptOptions.full.description'),
      },
    ],
    [t]
  );
  const promptOptionOverrides = useMemo<Record<string, { label: string; description: string }>>(
    () => ({
      nudge: {
        label: t('tailor.promptOptions.nudge.label'),
        description: t('tailor.promptOptions.nudge.description'),
      },
      keywords: {
        label: t('tailor.promptOptions.keywords.label'),
        description: t('tailor.promptOptions.keywords.description'),
      },
      full: {
        label: t('tailor.promptOptions.full.label'),
        description: t('tailor.promptOptions.full.description'),
      },
    }),
    [t]
  );
  const localizedPromptOptions = useMemo(() => {
    const options = promptOptions.length ? promptOptions : fallbackPromptOptions;
    return options.map((option) => {
      const override = promptOptionOverrides[option.id];
      return override ? { ...option, ...override } : option;
    });
  }, [promptOptions, fallbackPromptOptions, promptOptionOverrides]);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const [featureConfig, promptConfig, featurePrompts] = await Promise.all([
          fetchFeatureConfig().catch(() => null),
          fetchPromptConfig().catch(() => null),
          fetchFeaturePrompts().catch(() => null),
        ]);

        if (cancelled) return;

        if (featureConfig) {
          setEnableCoverLetter(featureConfig.enable_cover_letter);
          setEnableOutreach(featureConfig.enable_outreach_message);
        }

        if (promptConfig) {
          setPromptOptions(promptConfig.prompt_options || []);
          setDefaultPromptId(promptConfig.default_prompt_id || 'keywords');
        }

        if (featurePrompts) {
          setCoverLetterPrompt(featurePrompts.cover_letter_prompt);
          setOutreachPrompt(featurePrompts.outreach_message_prompt);
          setCoverLetterDefault(featurePrompts.cover_letter_default);
          setOutreachDefault(featurePrompts.outreach_message_default);
        }

        setStatus('idle');
      } catch (err) {
        console.error('Failed to load settings', err);
        if (!cancelled) {
          setError(t('settings.errors.unableToConnectBackend'));
          setStatus('error');
        }
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleFeatureConfigChange = async (
    key: 'enable_cover_letter' | 'enable_outreach_message',
    value: boolean
  ) => {
    setFeatureConfigLoading(true);
    try {
      const updated = await updateFeatureConfig({ [key]: value });
      setEnableCoverLetter(updated.enable_cover_letter);
      setEnableOutreach(updated.enable_outreach_message);
    } catch (err) {
      console.error('Failed to update feature config', err);
      if (key === 'enable_cover_letter') {
        setEnableCoverLetter(!value);
      } else {
        setEnableOutreach(!value);
      }
    } finally {
      setFeatureConfigLoading(false);
    }
  };

  const handleFeaturePromptSave = async (
    field: 'cover_letter_prompt' | 'outreach_message_prompt',
    value: string
  ) => {
    setFeaturePromptSaving(field);
    setFeaturePromptError((prev) => (prev?.field === field ? null : prev));
    try {
      const update: FeaturePromptsUpdate = { [field]: value };
      const fresh = await updateFeaturePrompts(update);
      setCoverLetterPrompt(fresh.cover_letter_prompt);
      setOutreachPrompt(fresh.outreach_message_prompt);
    } catch (err) {
      if (err instanceof FeaturePromptsError) {
        setFeaturePromptError({ field: err.detail.field, missing: err.detail.missing });
      } else {
        setError((err as Error).message);
      }
    } finally {
      setFeaturePromptSaving(null);
    }
  };

  const handlePromptConfigChange = async (value: string) => {
    setPromptConfigLoading(true);
    setError(null);
    try {
      const updated = await updatePromptConfig({ default_prompt_id: value });
      setDefaultPromptId(updated.default_prompt_id);
      if (updated.prompt_options?.length) {
        setPromptOptions(updated.prompt_options);
      }
    } catch (err) {
      console.error('Failed to update prompt config', err);
      setError((err as Error).message || t('settings.errors.unableToSaveConfiguration'));
    } finally {
      setPromptConfigLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      await resetDatabase();

      localStorage.removeItem('master_resume_id');
      localStorage.removeItem('resume_builder_draft');
      localStorage.removeItem('resume_builder_settings');

      await refreshStatus();
      setError(null);
      setSuccessDialogMessage({
        title: t('common.success'),
        description: t('common.databaseReset'),
      });
      setShowSuccessDialog(true);
    } catch (err) {
      console.error('Failed to reset database', err);
      setError(t('settings.errors.failedToResetDatabase'));
    } finally {
      setIsResetting(false);
      setShowResetDatabaseDialog(false);
    }
  };

  const formatLastFetched = () => {
    if (!lastFetched) return t('settings.systemStatus.lastFetched.never');
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastFetched.getTime()) / 1000);
    if (diff < 60) return t('settings.systemStatus.lastFetched.justNow');
    if (diff < 3600)
      return t('settings.systemStatus.lastFetched.minutesAgo', { minutes: Math.floor(diff / 60) });
    return t('settings.systemStatus.lastFetched.hoursAgo', { hours: Math.floor(diff / 3600) });
  };

  return (
    <div className="flex flex-col items-center justify-start p-4 md:p-8 lg:p-12 min-h-screen">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              {t('settings.title')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('settings.subtitle')}
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          </Link>
        </div>

        {/* Usage Display */}
        {user && (
          <Card className="shadow-glow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-primary" />
                Your Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UsageDisplay />
            </CardContent>
          </Card>
        )}

        {/* System Status Panel */}
        <Card className="shadow-glow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">{t('settings.systemStatus.title')}</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                {lastFetched && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatLastFetched()}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshStatus}
                  disabled={statusLoading}
                  className="h-7 text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${statusLoading ? 'animate-spin' : ''}`} />
                  {t('settings.systemStatus.refresh')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !systemStatus ? (
              <div className="flex flex-col items-center justify-center p-8 gap-3 border border-dashed border-destructive/30 bg-destructive/5 rounded-xl">
                <p className="text-xs text-destructive uppercase tracking-wide">
                  {t('settings.systemStatus.unableToConnect')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('settings.systemStatus.expectedAt', { apiUrl: API_URL })}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshStatus}
                  className="gap-1 text-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t('common.retry')}
                </Button>
              </div>
            ) : (
              <div className="@container">
                <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-3">
                  <div className="rounded-xl border bg-card p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs uppercase text-muted-foreground tracking-wide">
                        {t('settings.statusCards.llm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-sm font-semibold">
                        {t('settings.statusValues.configured')}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-card p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs uppercase text-muted-foreground tracking-wide">
                        {t('settings.statusCards.database')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-sm font-semibold">
                        {t('settings.statusValues.connected')}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-card p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs uppercase text-muted-foreground tracking-wide">
                        {t('settings.statusCards.resumes')}
                      </span>
                    </div>
                    <span className="text-2xl font-bold">{systemStatus.database_stats.total_resumes}</span>
                  </div>

                  <div className="rounded-xl border bg-card p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs uppercase text-muted-foreground tracking-wide">
                        {t('settings.statusCards.jobs')}
                      </span>
                    </div>
                    <span className="text-2xl font-bold">{systemStatus.database_stats.total_jobs}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="rounded-xl border bg-card p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs uppercase text-muted-foreground tracking-wide">
                        {t('settings.statusCards.improvements')}
                      </span>
                    </div>
                    <span className="text-2xl font-bold">{systemStatus.database_stats.total_improvements}</span>
                  </div>
                  <div className="rounded-xl border bg-card p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs uppercase text-muted-foreground tracking-wide">
                        {t('settings.statusCards.masterResume')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {systemStatus.has_master_resume ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-success" />
                          <span className="text-sm font-semibold">
                            {t('settings.statusValues.configured')}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-warning" />
                          <span className="text-sm font-semibold">
                            {t('settings.statusValues.notSet')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Generation Section */}
        <Card className="shadow-glow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="w-4 h-4 text-primary" />
              {t('settings.contentGeneration.title')}
            </CardTitle>
            <CardDescription>{t('settings.contentGeneration.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ToggleSwitch
              checked={enableCoverLetter}
              onCheckedChange={(checked) => {
                setEnableCoverLetter(checked);
                handleFeatureConfigChange('enable_cover_letter', checked);
              }}
              label={t('settings.contentGeneration.coverLetter.label')}
              description={t('settings.contentGeneration.coverLetter.description')}
              disabled={featureConfigLoading}
            />
            {enableCoverLetter && (
              <div className="pl-4 space-y-3 border-l-2 border-primary/20">
                <Label htmlFor="coverLetterPrompt" className="text-sm">
                  {t('settings.contentGeneration.customPromptLabel')}
                </Label>
                <textarea
                  id="coverLetterPrompt"
                  rows={8}
                  value={coverLetterPrompt}
                  onChange={(e) => setCoverLetterPrompt(e.target.value)}
                  placeholder={coverLetterDefault}
                  className="w-full rounded-lg border bg-card p-3 text-xs break-words focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  {t('settings.contentGeneration.customPromptHelp')}
                </p>
                {featurePromptError?.field === 'cover_letter_prompt' && (
                  <p className="text-xs text-destructive break-words">
                    {t('settings.contentGeneration.customPromptErrorMissing', {
                      missing: featurePromptError.missing.join(', '),
                    })}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleFeaturePromptSave('cover_letter_prompt', coverLetterPrompt)
                    }
                    disabled={featurePromptSaving === 'cover_letter_prompt'}
                  >
                    {featurePromptSaving === 'cover_letter_prompt' ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : null}
                    {t('common.save')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeaturePromptSave('cover_letter_prompt', '')}
                    disabled={featurePromptSaving === 'cover_letter_prompt'}
                  >
                    {t('settings.contentGeneration.customPromptResetButton')}
                  </Button>
                </div>
              </div>
            )}

            <ToggleSwitch
              checked={enableOutreach}
              onCheckedChange={(checked) => {
                setEnableOutreach(checked);
                handleFeatureConfigChange('enable_outreach_message', checked);
              }}
              label={t('settings.contentGeneration.outreachMessage.label')}
              description={t('settings.contentGeneration.outreachMessage.description')}
              disabled={featureConfigLoading}
            />
            {enableOutreach && (
              <div className="pl-4 space-y-3 border-l-2 border-primary/20">
                <Label htmlFor="outreachPrompt" className="text-sm">
                  {t('settings.contentGeneration.customPromptLabel')}
                </Label>
                <textarea
                  id="outreachPrompt"
                  rows={8}
                  value={outreachPrompt}
                  onChange={(e) => setOutreachPrompt(e.target.value)}
                  placeholder={outreachDefault}
                  className="w-full rounded-lg border bg-card p-3 text-xs break-words focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  {t('settings.contentGeneration.customPromptHelp')}
                </p>
                {featurePromptError?.field === 'outreach_message_prompt' && (
                  <p className="text-xs text-destructive break-words">
                    {t('settings.contentGeneration.customPromptErrorMissing', {
                      missing: featurePromptError.missing.join(', '),
                    })}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleFeaturePromptSave('outreach_message_prompt', outreachPrompt)
                    }
                    disabled={featurePromptSaving === 'outreach_message_prompt'}
                  >
                    {featurePromptSaving === 'outreach_message_prompt' ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : null}
                    {t('common.save')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeaturePromptSave('outreach_message_prompt', '')}
                    disabled={featurePromptSaving === 'outreach_message_prompt'}
                  >
                    {t('settings.contentGeneration.customPromptResetButton')}
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Dropdown
                options={localizedPromptOptions}
                value={defaultPromptId}
                onChange={handlePromptConfigChange}
                label={t('settings.promptSettings.title')}
                description={t('settings.promptSettings.description')}
                disabled={promptConfigLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20 shadow-glow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="w-4 h-4" />
              {t('settings.dangerZone')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-3 max-w-sm">
              <div>
                <h3 className="font-semibold text-sm text-destructive mb-1">
                  {t('settings.resetDatabase')}
                </h3>
                <p className="text-xs text-muted-foreground">{t('settings.resetDatabaseDescription')}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => setShowResetDatabaseDialog(true)}
                disabled={isResetting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('settings.resetDatabase')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-between items-center py-4 px-2">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Resume Matcher"
              width={20}
              height={20}
              className="w-5 h-5 opacity-60"
            />
            <span className="text-xs text-muted-foreground">
              {getVersionString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {statusLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {t('settings.footer.status.checking')}
                </span>
              </>
            ) : systemStatus ? (
              <>
                <div
                  className={`w-2 h-2 rounded-full ${systemStatus.status === 'ready' ? 'bg-success' : 'bg-warning'} pulse-dot`}
                />
                <span
                  className={`text-xs font-medium ${systemStatus.status === 'ready' ? 'text-success' : 'text-warning'}`}
                >
                  {systemStatus.status === 'ready'
                    ? t('settings.footer.status.ready')
                    : t('settings.footer.status.setupRequired')}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                {t('settings.footer.status.offline')}
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showResetDatabaseDialog}
        onOpenChange={setShowResetDatabaseDialog}
        title={t('confirmations.resetDatabase')}
        description={t('confirmations.resetDatabaseDescription')}
        confirmLabel={t('common.reset')}
        variant="danger"
        onConfirm={handleResetDatabase}
      />

      <ConfirmDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title={successMessage.title}
        description={successMessage.description}
        confirmLabel={t('common.close')}
        showCancelButton={false}
        variant="success"
        onConfirm={() => setShowSuccessDialog(false)}
      />
    </div>
  );
}
