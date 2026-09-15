import styles from './SettingsError.module.scss';

interface SettingsErrorProps {
  errorMessage: string;
}

export const SettingsError = ({ errorMessage }: SettingsErrorProps) => (
  <div className={styles.errorState}>
    <h1 className={styles.errorTitle}>Unable to load settings</h1>
    <p className={styles.errorMessage}>
      The application could not read its settings file. Make sure a file named{' '}
      <strong className={styles.errorFileName}>settings.json</strong> exists in
      the same directory as the application executable.
    </p>
    <details className={styles.errorDetails}>
      <summary className={styles.errorSummary}>Show error details</summary>
      <pre className={styles.errorCodeBlock}>
        <code className={styles.errorCode}>{errorMessage}</code>
      </pre>
    </details>
  </div>
);
