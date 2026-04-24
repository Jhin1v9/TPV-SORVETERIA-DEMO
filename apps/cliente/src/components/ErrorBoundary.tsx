import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 text-center">
              <p className="text-red-500 font-bold text-lg mb-2">Algo deu errado</p>
              <p className="text-gray-500 text-sm mb-4">
                Não foi possível carregar este produto. Tente novamente.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white rounded-xl font-bold"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
