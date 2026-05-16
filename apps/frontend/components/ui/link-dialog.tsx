'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { X } from 'lucide-react';

interface LinkDialogProps {
  editor: Editor;
  onClose: () => void;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({ editor, onClose }) => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, '');

    const existingLink = editor.getAttributes('link');
    if (existingLink.href) {
      setUrl(existingLink.href);
    }

    setText(selectedText);
  }, [editor]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!url) {
        onClose();
        return;
      }

      let finalUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
        finalUrl = `https://${url}`;
      }

      if (text && editor.state.selection.from !== editor.state.selection.to) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: finalUrl, target: '_blank', rel: 'noopener noreferrer' })
          .run();
      } else if (text) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: text,
            marks: [
              {
                type: 'link',
                attrs: { href: finalUrl, target: '_blank', rel: 'noopener noreferrer' },
              },
            ],
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .setLink({ href: finalUrl, target: '_blank', rel: 'noopener noreferrer' })
          .run();
      }

      onClose();
    },
    [url, text, editor, onClose]
  );

  const handleRemoveLink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
    onClose();
  }, [editor, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const hasExistingLink = editor.isActive('link');

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)] p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="font-display text-xl mb-4">
            {hasExistingLink ? 'Edit Link' : 'Add Link'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-text">Display Text</Label>
              <Input
                id="link-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Link text"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              {hasExistingLink && (
                <Button type="button" variant="destructive" size="sm" onClick={handleRemoveLink}>
                  Remove Link
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="default" size="sm">
                {hasExistingLink ? 'Update' : 'Add'} Link
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
