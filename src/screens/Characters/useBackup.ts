import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import isNil from 'lodash/isNil';

import { CharactersCountContext } from '../../context';
import { Commands } from '../../enums';
import { useInvokeMutation } from '../../hooks';
import type { BackupCommandParams, BackupCommandResponse } from '../../types';
import { type ImportResult, mapResultImportCommandResponse } from '../../utils';

import type { ActiveCharacter } from './Characters.types';

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
  const handleBackup = async (
    _character: ActiveCharacter,
    slotNumber?: number,
  ) => {
    if (isNil(slotNumber)) {
      return false;
    }

    try {
      setBackedUpCardNumber(slotNumber);
      const response = await backup({ slotNumber });
      if (response.status === 'success') {
        refetchCharactersCount();
        toast.success('Character backed up successfully.');
        return true;
      }
      if (response.status === 'skipped') {
        toast.info('Character is already backed up.');
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
