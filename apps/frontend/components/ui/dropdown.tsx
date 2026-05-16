'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n';

export interface DropdownOption {
  id: string;
  label: string;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: DropdownProps) {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = React.useId();

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-foreground block">
          {label}
        </label>
      )}

      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          aria-label={label}
          className={cn(
            'w-full flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm',
            'transition-all duration-200',
            'hover:bg-accent hover:border-primary/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isOpen && 'border-primary ring-2 ring-primary/20'
          )}
        >
          <div className="flex-1 text-left min-w-0">
            {selectedOption ? (
              <div>
                <div className="font-medium text-foreground truncate">{selectedOption.label}</div>
                {selectedOption.description && (
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {selectedOption.description}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{t('common.selectOption')}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-200 ml-2 shrink-0 text-muted-foreground',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div
            id={menuId}
            role="menu"
            aria-label={label}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-border bg-card shadow-[var(--shadow-elevated)] overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto p-1">
              {options.map((option) => (
                <button
                  key={option.id}
                  role="menuitemradio"
                  aria-checked={option.id === value}
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    'w-full px-3 py-2.5 text-left rounded-lg transition-colors duration-150',
                    'flex items-center justify-between gap-2',
                    option.id === value
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-accent text-foreground'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-xs mt-0.5 text-muted-foreground truncate">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.id === value && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
