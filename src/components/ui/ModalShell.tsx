import React, { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidthClassName?: string;
  labelledBy?: string;
}

/** Shared accessible, viewport-safe modal frame for independent features. */
export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidthClassName = 'max-w-3xl',
  labelledBy = 'modal-title',
}) => {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const getFocusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? []).filter((element) => !element.hasAttribute('hidden'));
    const focusInitialControl = () => (getFocusable()[0] ?? dialogRef.current)?.focus();
    const frame = requestAnimationFrame(focusInitialControl);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-2 backdrop-blur-sm sm:p-4">
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} className={`modal-scroll-safe flex w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl ${maxWidthClassName}`}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 p-4 sm:p-5">
          <div><h2 id={labelledBy} className="font-semibold text-white">{title}</h2>{description && <p className="mt-1 text-xs text-slate-400">{description}</p>}</div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label={`Close ${title}`}><X className="h-5 w-5" /></button>
        </header>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </section>
    </div>
  );
};
