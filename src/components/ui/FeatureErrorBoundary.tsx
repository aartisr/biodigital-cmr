import React, { ErrorInfo, ReactNode } from 'react';

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
}

/** Keeps an optional workspace feature from taking down the clinical shell. */
export class FeatureErrorBoundary extends React.Component<FeatureErrorBoundaryProps, FeatureErrorBoundaryState> {
  state: FeatureErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): FeatureErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Unable to render ${this.props.featureName}`, error, errorInfo);
  }

  retry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4" role="alert">
          <h2 className="text-sm font-semibold text-amber-100">{this.props.featureName} is unavailable</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">The rest of the workspace is still available. Retry this optional feature or return to another workspace.</p>
          <button type="button" onClick={this.retry} className="mt-3 rounded-lg border border-amber-500/40 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-500/10">Retry feature</button>
        </section>
      );
    }

    return this.props.children;
  }
}
