import { ErrorState } from '../ErrorState/ErrorState';

interface SettingsErrorProps {
  errorMessage: string;
}

export const SettingsError = ({ errorMessage }: SettingsErrorProps) => (
  <ErrorState
    title="Unable to load settings"
    message={
      <>
        The application could not read its settings file. Make sure a file named{' '}
        <strong>settings.json</strong> exists in the same directory as the
        application executable.
      </>
    }
    errorMessage={errorMessage}
  />
);
