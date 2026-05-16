'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { RichTextToolbar } from './rich-text-toolbar';
import { LinkDialog } from './link-dialog';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  className,
  minHeight = '80px',
}) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isInternalUpdateRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      isInternalUpdateRef.current = true;
      const html = editor.getHTML();
      const cleanHtml = html.replace(/<p>/g, '').replace(/<\/p>/g, '').trim();
      onChange(cleanHtml);
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 0);
    },
    editorProps: {
      attributes: {
        class: cn(
          'outline-none prose prose-sm max-w-none',
          'prose-strong:font-bold prose-em:italic prose-a:text-primary prose-a:underline'
        ),
        style: `min-height: calc(${minHeight} - 24px)`,
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter') {
          event.stopPropagation();
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && !isInternalUpdateRef.current) {
      const currentContent = editor.getHTML().replace(/<p>/g, '').replace(/<\/p>/g, '').trim();

      if (value !== currentContent) {
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && editor?.isFocused) {
        e.preventDefault();
        setShowLinkDialog(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  const handleLinkClick = useCallback(() => {
    setShowLinkDialog(true);
  }, []);

  const handleLinkDialogClose = useCallback(() => {
    setShowLinkDialog(false);
    editor?.chain().focus().run();
  }, [editor]);

  if (!isMounted) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-1 p-1 border border-border bg-muted rounded-xl h-10" />
        <div
          className={cn(
            'w-full border border-border bg-background',
            'px-3 py-2 text-sm text-muted-foreground rounded-xl'
          )}
          style={{ minHeight }}
        >
          {placeholder}
        </div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <RichTextToolbar editor={editor} onLinkClick={handleLinkClick} />
      <div
        className={cn(
          'w-full rounded-xl border border-border bg-background',
          'px-3 py-2 text-sm text-foreground',
          'focus-within:ring-2 focus-within:ring-ring',
          '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[36px]',
          '[&_.ProseMirror_p]:m-0',
          '[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline'
        )}
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>
      {showLinkDialog && <LinkDialog editor={editor} onClose={handleLinkDialogClose} />}
    </div>
  );
};

export default RichTextEditor;
