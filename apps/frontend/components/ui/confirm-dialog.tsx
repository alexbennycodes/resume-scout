'use client';

import * as React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  errorMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  variant?: 'danger' | 'warning' | 'success' | 'default';
  closeOnConfirm?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  errorMessage,
  confirmLabel,
  cancelLabel,
  confirmDisabled = false,
  variant = 'default',
  closeOnConfirm = true,
  onConfirm,
  onCancel,
  showCancelButton = true,
}) => {
  const { t } = useTranslations();
  const finalConfirmLabel = confirmLabel ?? t('common.confirm');
  const finalCancelLabel = cancelLabel ?? t('common.cancel');

  const handleConfirm = () => {
    if (confirmDisabled) return;
    onConfirm();
    if (closeOnConfirm) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-destructive" />,
      iconBg: 'bg-destructive/10',
      buttonVariant: 'destructive' as const,
    },
    warning: {
      icon: <AlertCircle className="w-6 h-6 text-orange-500" />,
      iconBg: 'bg-orange-500/10',
      buttonVariant: 'warning' as const,
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-green-700" />,
      iconBg: 'bg-green-700/10',
      buttonVariant: 'success' as const,
    },
    default: {
      icon: <HelpCircle className="w-6 h-6 text-primary" />,
      iconBg: 'bg-primary/10',
      buttonVariant: 'default' as const,
    },
  };

  const { icon, iconBg, buttonVariant } = variantStyles[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
              {icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {errorMessage && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}
        <DialogFooter className="gap-2">
          {showCancelButton && (
            <Button variant="outline" onClick={handleCancel}>
              {finalCancelLabel}
            </Button>
          )}
          <Button
            variant={buttonVariant}
            onClick={handleConfirm}
            disabled={confirmDisabled}
          >
            {finalConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
