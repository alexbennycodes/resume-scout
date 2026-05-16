'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={cn('flex gap-1 p-1 bg-muted rounded-xl', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive && [
                'bg-card text-foreground shadow-sm',
              ],
              !isActive &&
                !isDisabled && [
                  'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                ],
              isDisabled && [
                'text-muted-foreground/50 cursor-not-allowed',
              ]
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export { Tabs as RetroTabs };
