import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';

import { AppInitializer, AppLayout, ErrorBoundary } from './components';
import { Routes as RouteDefinitions } from './constants';
import {
  CharactersCountProvider,
  SettingsProvider,
  UpdateProvider,
} from './context';
import {
  Characters,
  CharactersDatabase,
  CharacterVersions,
  Import,
  Settings,
} from './screens';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <SettingsProvider>
          <CharactersCountProvider>
            <UpdateProvider>
              <AppInitializer />
              <Routes>
                <Route element={<AppLayout />}>
                  <Route
                    path={RouteDefinitions.CHARACTERS}
                    element={<Characters />}
                  />
                  <Route path={RouteDefinitions.CHARACTERS_DATBASE}>
                    <Route
                      index
                      element={<CharactersDatabase />}
                    />
                    <Route
                      path={RouteDefinitions.CHARACTER_VERSIONS}
                      element={<CharacterVersions />}
                    />
                  </Route>
                  <Route
                    path={RouteDefinitions.IMPORT}
                    element={<Import />}
                  />
                  <Route
                    path={RouteDefinitions.SETTINGS}
                    element={<Settings />}
                  />
                  <Route
                    path="*"
                    element={
                      <Navigate
                        to={RouteDefinitions.CHARACTERS}
                        replace
                      />
                    }
                  />
                </Route>
              </Routes>
              <ToastContainer
                theme="dark"
                position="bottom-center"
              />
            </UpdateProvider>
          </CharactersCountProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
