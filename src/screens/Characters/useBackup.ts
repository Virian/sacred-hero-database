import { useState } from 'react';
import { toast } from 'react-toastify';
import isNil from 'lodash/isNil';

import { Commands } from '../../enums';
import { useInvokeMutation } from '../../hooks';
import type { BackupCommandParams, BackupCommandResponse } from '../../types';
import { type ImportResult, mapResultImportCommandResponse } from '../../utils';

import type { ActiveCharacter } from './Characters.types';

export const useBackup = () => {
  // number of the card for which the backup is in progress
  const [backedUpCardNumber, setBackedUpCardNumber] = useState<
    number | undefined
  >();

  const { invoke: backup, isLoading } = useInvokeMutation<
    BackupCommandParams,
    BackupCommandResponse,
    ImportResult
  >({
    command: Commands.BACKUP,
    mapper: mapResultImportCommandResponse,
  });

  const handleBackup = async (
    _character: ActiveCharacter,
    slotNumber?: number,
  ) => {
    if (isNil(slotNumber)) {
      return;
    }

    try {
      setBackedUpCardNumber(slotNumber);
      const response = await backup({ slotNumber });
      if (response.status === 'success') {
        return toast.success('Character backed up successfully.');
      }
      if (response.status === 'skipped') {
        return toast.info('Character is already backed up.');
      }
      toast.error(`Character backup failed: ${response.message}`);
    } catch (error) {
      if (error instanceof Error) {
        return toast.error(`Character backup failed: ${error.message}`);
      }

      toast.error('Character backup failed.');
    } finally {
      setBackedUpCardNumber(undefined);
    }
  };

  return { backedUpCardNumber, isLoading, handleBackup };
};
