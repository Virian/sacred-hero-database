import { ToastContainer } from 'react-toastify';

import { SettingsProvider } from './context';
import { AppContent } from './AppContent';

function App() {
  return (
    <SettingsProvider>
      <AppContent />
      <ToastContainer />
    </SettingsProvider>
  );
}

export default App;
