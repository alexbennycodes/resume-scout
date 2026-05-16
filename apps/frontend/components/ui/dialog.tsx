'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

const useDialogContext = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
};

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const titleId = React.useId();
  return (
    <DialogContext.Provider value={{ open, onOpenChange, titleId }}>
      {children}
    </DialogContext.Provider>
  );
};

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ asChild, children }) => {
  const { onOpenChange } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    const childProps = (children as React.ReactElement<{ onClick?: () => void }>).props;
    const originalOnClick = childProps.onClick;
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => {
        originalOnClick?.();
        onOpenChange(true);
      },
    });
  }

  return <button onClick={() => onOpenChange(true)}>{children}</button>;
};

interface DialogCloseProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

const DialogClose: React.FC<DialogCloseProps> = ({ asChild, children, className }) => {
  const { onOpenChange } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    const childProps = (children as React.ReactElement<{ onClick?: () => void }>).props;
    const originalOnClick = childProps.onClick;
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => {
        originalOnClick?.();
        onOpenChange(false);
      },
    });
  }

  return (
    <button onClick={() => onOpenChange(false)} className={className}>
      {children}
    </button>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  const { open, onOpenChange, titleId } = useDialogContext();
  const { t } = useTranslations();

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            'relative w-full max-w-lg',
            'rounded-2xl border border-border bg-card',
            'shadow-[var(--shadow-elevated)]',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-lg p-2 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('common.close')}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ className, children, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-4', className)}
    {...props}
  >
    {children}
  </div>
);

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const DialogFooter: React.FC<DialogFooterProps> = ({ className, children, ...props }) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0', className)}
    {...props}
  >
    {children}
  </div>
);

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ className, children, ...props }) => {
  const { titleId } = useDialogContext();
  return (
    <h2
      id={titleId}
      className={cn('font-display text-xl font-normal leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h2>
  );
};

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props}>
    {children}
  </p>
);

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
