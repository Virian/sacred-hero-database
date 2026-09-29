import { useState, type ChangeEvent } from 'react';

import { Checkbox, ConfirmModal } from '../../../components';

import styles from './ConfirmRemoveModal.module.scss';

interface ConfirmRemoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shouldBackup: boolean) => void;
  isLoading?: boolean;
  characterName: string;
  slotNumber: number;
}

export const ConfirmRemoveModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  characterName,
  slotNumber,
}: ConfirmRemoveModalProps) => {
  const [shouldBackup, setShouldBackup] = useState(true);

  const handleClose = () => {
    setShouldBackup(true);
    onClose();
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShouldBackup(event.target.checked);
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={() => onConfirm(shouldBackup)}
      title="Remove from slot"
      isLoading={isLoading}
    >
      <div className={styles.content}>
        <span>
          You are about to remove {characterName} from slot {slotNumber}. Are
          you sure?
        </span>
        <span>
          If you do not back up this character first, its save file will be
          permanently deleted.
        </span>
        <Checkbox
          className={styles.checkbox}
          label="Backup character before removing"
          checked={shouldBackup}
          onChange={handleCheckboxChange}
        />
      </div>
    </ConfirmModal>
  );
};
