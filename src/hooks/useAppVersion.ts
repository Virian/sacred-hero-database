import { useEffect, useState } from 'react';
import { getVersion } from '@tauri-apps/api/app';

export const useAppVersion = () => {
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    const getAppVersion = async () => {
      setAppVersion(await getVersion());
    };

    getAppVersion();
  }, []);

  return appVersion;
};
