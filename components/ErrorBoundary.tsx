
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-navy-800 border border-white/10 rounded-lg p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-2xl font-serif text-white mb-2">System Application Error</h1>
            <p className="text-slate-400 mb-6 text-sm">
              An unexpected critical error occurred. Our engineering team has been notified.
            </p>
            {this.state.error && (
                <div className="bg-navy-950 p-4 rounded border border-white/5 mb-6 text-left overflow-auto max-h-32">
                    <code className="text-xs text-rose-300 font-mono">
                        {this.state.error.toString()}
                    </code>
                </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded flex items-center justify-center mx-auto gap-2 transition-colors"
            >
              <RefreshCw size={16} /> Reload Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
