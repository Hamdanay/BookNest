import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('BookNest UI error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="elf-folio p-6 max-w-lg mx-auto mt-8">
          <h2 className="font-display text-lg font-semibold text-folio-ink">Terjadi kesalahan tampilan</h2>
          <p className="text-sm text-folio-muted mt-2">{this.state.error.message}</p>
          <button
            type="button"
            className="elf-btn mt-4"
            onClick={() => window.location.reload()}
          >
            Muat ulang halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
