import { Button, Modal } from '..';

import styles from './ConfirmModal.module.scss';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  children: React.ReactNode;
  confirmButtonLabel?: string;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmButtonLabel = 'Confirm',
}: ConfirmModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
  >
    <div className={styles.container}>
      <div>{children}</div>
      <div className={styles.buttons}>
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button onClick={onConfirm}>{confirmButtonLabel}</Button>
      </div>
    </div>
  </Modal>
);
