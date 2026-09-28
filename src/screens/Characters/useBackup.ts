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
        refetchCharactersCount();
        return toast.success('Character backed up successfully.');
      }
      if (response.status === 'skipped') {
        return toast.info('Character is already backed up.');
      }
      toast.error(`Character backup failed: ${response.message}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Character backup failed: ${errorMessage}`);
    } finally {
      setBackedUpCardNumber(undefined);
    }
  };

  return { backedUpCardNumber, isLoading, handleBackup };
};
