import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { relaunch } from '@tauri-apps/plugin-process';

import { Button } from '../Button/Button';
import { ErrorState } from '../ErrorState/ErrorState';

import styles from './ErrorBoundary.module.scss';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  restartError: string | null;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
    restartError: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo);
  }

  handleRestart = async () => {
    try {
      await relaunch();
    } catch (error) {
      this.setState({ restartError: getErrorMessage(error) });
    }
  };

  render() {
    const { error, restartError } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <ErrorState
        title="Something went wrong"
        message="The application encountered an unexpected error. Restart the app to try again."
        errorMessage={restartError || getErrorMessage(error)}
      >
        <Button
          contentClassName={styles.buttonText}
          onClick={this.handleRestart}
        >
          <RefreshCw size={16} />
          Restart application
        </Button>
      </ErrorState>
    );
  }
}
