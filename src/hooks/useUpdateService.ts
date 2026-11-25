import { useContext } from 'react';

import { UpdateContext } from '../context/update/UpdateContext';

export const useUpdateService = () => {
  const updateService = useContext(UpdateContext);

  if (!updateService) {
    throw new Error('useUpdateService must be used within an UpdateProvider.');
  }

  return updateService;
};
