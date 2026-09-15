import { SettingsProvider } from './context';
import { AppContent } from './AppContent';

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
