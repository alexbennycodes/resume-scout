import { apiFetch } from './client';

export interface DatabaseStats {
  total_resumes: number;
  total_jobs: number;
  total_improvements: number;
  has_master_resume: boolean;
}

export interface SystemStatus {
  status: 'ready' | 'setup_required';
  has_master_resume: boolean;
  database_stats: DatabaseStats;
}

// Fetch system status
export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await apiFetch('/status');

  if (!res.ok) {
    throw new Error(`Failed to fetch system status (status ${res.status}).`);
  }

  return res.json();
}

// Feature configuration types
export interface FeatureConfig {
  enable_cover_letter: boolean;
  enable_outreach_message: boolean;
}

export interface FeatureConfigUpdate {
  enable_cover_letter?: boolean;
  enable_outreach_message?: boolean;
}

// Fetch feature configuration
export async function fetchFeatureConfig(): Promise<FeatureConfig> {
  const res = await apiFetch('/config/features');

  if (!res.ok) {
    throw new Error(`Failed to load feature config (status ${res.status}).`);
  }

  return res.json();
}

// Update feature configuration
export async function updateFeatureConfig(config: FeatureConfigUpdate): Promise<FeatureConfig> {
  const res = await apiFetch('/config/features', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to update feature config (status ${res.status}).`);
  }

  return res.json();
}

// Language configuration types
export type SupportedLanguage = 'en' | 'es' | 'zh' | 'ja' | 'pt';

export interface LanguageConfig {
  ui_language: SupportedLanguage;
  content_language: SupportedLanguage;
  supported_languages: SupportedLanguage[];
}

export interface LanguageConfigUpdate {
  ui_language?: SupportedLanguage;
  content_language?: SupportedLanguage;
}

// Fetch language configuration
export async function fetchLanguageConfig(): Promise<LanguageConfig> {
  const res = await apiFetch('/config/language');

  if (!res.ok) {
    throw new Error(`Failed to load language config (status ${res.status}).`);
  }

  return res.json();
}

// Update language configuration
export async function updateLanguageConfig(update: LanguageConfigUpdate): Promise<LanguageConfig> {
  const res = await apiFetch('/config/language', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to update language config (status ${res.status}).`);
  }

  return res.json();
}

export interface PromptOption {
  id: string;
  label: string;
  description: string;
}

export interface PromptConfig {
  default_prompt_id: string;
  prompt_options: PromptOption[];
}

export interface PromptConfigUpdate {
  default_prompt_id?: string;
}

// Fetch prompt configuration
export async function fetchPromptConfig(): Promise<PromptConfig> {
  const res = await apiFetch('/config/prompts');

  if (!res.ok) {
    throw new Error(`Failed to load prompt config (status ${res.status}).`);
  }

  return res.json();
}

// Update prompt configuration
export async function updatePromptConfig(update: PromptConfigUpdate): Promise<PromptConfig> {
  const res = await apiFetch('/config/prompts', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to update prompt config (status ${res.status}).`);
  }

  return res.json();
}

// Custom feature prompts (cover letter, cold outreach)
export interface FeaturePrompts {
  cover_letter_prompt: string;
  outreach_message_prompt: string;
  cover_letter_default: string;
  outreach_message_default: string;
}

export interface FeaturePromptsUpdate {
  cover_letter_prompt?: string;
  outreach_message_prompt?: string;
}

export interface FeaturePromptsValidationError {
  code: 'missing_placeholders';
  field: 'cover_letter_prompt' | 'outreach_message_prompt';
  missing: string[];
}

export class FeaturePromptsError extends Error {
  detail: FeaturePromptsValidationError;

  constructor(detail: FeaturePromptsValidationError) {
    super(`Invalid ${detail.field}: missing ${detail.missing.join(', ')}`);
    this.name = 'FeaturePromptsError';
    this.detail = detail;
  }
}

export async function fetchFeaturePrompts(): Promise<FeaturePrompts> {
  const res = await apiFetch('/config/feature-prompts');
  if (!res.ok) {
    throw new Error(`Failed to load feature prompts (status ${res.status}).`);
  }
  return res.json();
}

export async function updateFeaturePrompts(update: FeaturePromptsUpdate): Promise<FeaturePrompts> {
  const res = await apiFetch('/config/feature-prompts', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      detail?: FeaturePromptsValidationError | string;
    };
    if (
      res.status === 422 &&
      typeof errBody.detail === 'object' &&
      errBody.detail?.code === 'missing_placeholders'
    ) {
      throw new FeaturePromptsError(errBody.detail);
    }
    let message: string;
    if (typeof errBody.detail === 'string') {
      message = errBody.detail;
    } else if (errBody.detail) {
      message = JSON.stringify(errBody.detail);
    } else {
      message = `Failed to update feature prompts (status ${res.status}).`;
    }
    throw new Error(message);
  }

  return (await res.json()) as FeaturePrompts;
}

// Reset database
export async function resetDatabase(): Promise<void> {
  const res = await apiFetch('/config/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: 'RESET_ALL_DATA' }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to reset database (status ${res.status}).`);
  }
}
