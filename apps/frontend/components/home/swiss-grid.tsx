'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export const SwissGrid = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="font-display text-5xl md:text-7xl text-foreground tracking-tight leading-[0.95]">
            {t('nav.dashboard')}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md">
            {t('dashboard.selectModule')}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Resume Matcher"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="text-sm text-muted-foreground">Resume Matcher</span>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              {t('nav.settings')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
