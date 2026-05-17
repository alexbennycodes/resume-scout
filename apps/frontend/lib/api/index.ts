/**
 * API Module Exports
 *
 * Centralized exports for all API-related functionality.
 */

// Client utilities
export {
  API_URL,
  API_BASE,
  apiFetch,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  getUploadUrl,
} from './client';

// Resume operations
export {
  uploadJobDescriptions,
  improveResume,
  previewImproveResume,
  confirmImproveResume,
  fetchResume,
  fetchResumeList,
  updateResume,
  downloadResumePdf,
  deleteResume,
  type ResumeListItem,
} from './resume';

// Config operations
export {
  fetchSystemStatus,
  fetchPromptConfig,
  updatePromptConfig,
  type DatabaseStats,
  type SystemStatus,
  type PromptOption,
  type PromptConfig,
  type PromptConfigUpdate,
} from './config';

// Payment operations
export {
  createCheckout,
  createPortal,
  getSubscriptionStatus,
  PRICE_IDS,
  getSuccessUrl,
  getCancelUrl,
  type SubscriptionTier,
  type SubscriptionStatus,
  type CheckoutResponse,
  type PortalResponse,
  type SubscriptionStatusResponse,
} from './payments';

// Usage operations
export {
  getUsageSummary,
  getMonthlyUsage,
  checkActionLimit,
  type UsageSummary,
} from './usage';
