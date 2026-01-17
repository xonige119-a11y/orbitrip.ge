
import React, { ErrorInfo, ReactNode } from 'react';
import { Language } from '../types';

interface Props {
  children?: ReactNode;
  language?: Language;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  public readonly props: Readonly<Props>;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false
    };
  }

  public state: State;

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isEn = (this.props.language || Language.EN) === Language.EN;
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {isEn ? "Oops! Something went wrong." : "Ой! Что-то пошло не так."}
                </h1>
                <p className="text-gray-500 mb-6">
                    {isEn 
                     ? "We encountered an unexpected error. Please try refreshing the page." 
                     : "Произошла непредвиденная ошибка. Пожалуйста, попробуйте обновить страницу."}
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                    >
                        {isEn ? "Refresh Page" : "Обновить страницу"}
                    </button>
                    <details className="text-left text-xs text-gray-400 cursor-pointer">
                        <summary>Technical Details</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                            {this.state.error?.toString()}
                        </pre>
                    </details>
                </div>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
