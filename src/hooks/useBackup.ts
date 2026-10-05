import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import isNil from 'lodash/isNil';

import { CharactersCountContext } from '../context';
import { Commands } from '../enums';
import type { BackupCommandParams, BackupCommandResponse } from '../types';
import { type ImportResult, mapResultImportCommandResponse } from '../utils';

import { useInvokeMutation } from '.';

export const useBackup = () => {
  const { refetch: refetchCharactersCount } = useContext(
    CharactersCountContext,
  );

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

  // Returns true when backed up or already backed up; false when no slot is given or backup fails.
  const handleBackup = async (slotNumber?: number, showSuccessToast = true) => {
    if (isNil(slotNumber)) {
      return false;
    }

    try {
      setBackedUpCardNumber(slotNumber);
      const response = await backup({ slotNumber });
      if (response.status === 'success') {
        refetchCharactersCount();
        if (showSuccessToast) {
          toast.success('Character backed up successfully.');
        }
        return true;
      }
      if (response.status === 'skipped') {
        if (showSuccessToast) {
          toast.info('Character is already backed up.');
        }
        return true;
      }
      toast.error(`Character backup failed: ${response.message}`);
      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Character backup failed: ${errorMessage}`);
      return false;
    } finally {
      setBackedUpCardNumber(undefined);
    }
  };

  return { backedUpCardNumber, isLoading, handleBackup };
};
