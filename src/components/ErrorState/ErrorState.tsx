import type { ReactNode } from 'react';

import styles from './ErrorState.module.scss';

interface ErrorStateProps {
  title: string;
  message: ReactNode;
  errorMessage?: string;
  children?: ReactNode;
}

export const ErrorState = ({
  title,
  message,
  errorMessage,
  children,
}: ErrorStateProps) => (
  <div className={styles.errorState}>
    <h1 className={styles.errorTitle}>{title}</h1>
    <p className={styles.errorMessage}>{message}</p>
    {errorMessage && (
      <details className={styles.errorDetails}>
        <summary className={styles.errorSummary}>Show error details</summary>
        <pre className={styles.errorCodeBlock}>
          <code className={styles.errorCode}>{errorMessage}</code>
        </pre>
      </details>
    )}
    {children}
  </div>
);
