import { useState } from 'react';
import { toast } from 'react-toastify';

import { Commands } from '../enums';
import type { AssignToSlotCommandParams } from '../types';

import { useBackup, useInvokeMutation } from '.';

export const useAssignToSlot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleBackup } = useBackup();

  const { invoke: assignToSlot } = useInvokeMutation<AssignToSlotCommandParams>(
    {
      command: Commands.ASSIGN_TO_SLOT,
    },
  );

  const handleAssignToSlot = async ({
    slotNumber,
    characterVersionId,
    shouldBackup = true,
    onSuccess,
  }: {
    slotNumber: number;
    characterVersionId: string;
    shouldBackup?: boolean;
    onSuccess?: () => void;
  }) => {
    try {
      setIsLoading(true);
      if (shouldBackup) {
        const isBackupSuccess = await handleBackup(slotNumber, false);

        if (!isBackupSuccess) {
          // error toast is already shown by `handleBackup`
          return;
        }
      }

      await assignToSlot({ slotNumber, characterVersionId });
      toast.success(`Character assigned to slot ${slotNumber} successfully.`);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Assigning to slot ${slotNumber} failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleAssignToSlot, isLoading };
};
