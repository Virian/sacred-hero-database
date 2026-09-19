import { ToastContainer } from 'react-toastify';

import { ErrorBoundary } from './components';
import { SettingsProvider } from './context';
import { AppContent } from './AppContent';

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AppContent />
        <ToastContainer />
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
