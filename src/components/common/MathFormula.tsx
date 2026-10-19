/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MathFormula Component
 * Renders LaTeX equations using KaTeX with robust error handling and fallbacks.
 */

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  tex: string;
  displayMode?: boolean;
  /**
   * Formula foreground is explicit because the application shell is dark while
   * several workspaces render light surfaces inside it.  Light-surface ink is
   * the safe default; opt into the surrounding or inverse palette deliberately.
   */
  tone?: 'ink' | 'inherit' | 'inverse';
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  tex,
  displayMode = false,
  tone = 'ink',
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return null;
    }
  }, [tex, displayMode]);

  if (!html) {
    return (
      <code className={`math-formula math-formula--${tone} font-mono text-xs bg-slate-100 px-1 py-0.5 rounded ${className}`}>
        {tex}
      </code>
    );
  }

  return (
    <span
      className={`math-formula math-formula--${tone} ${displayMode ? 'block my-2 overflow-x-auto max-w-full text-center' : 'inline-block'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
