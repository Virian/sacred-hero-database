import clsx from 'clsx';
import { Download, Info } from 'lucide-react';

import { Button, ImportedFiles, Spinner } from '../../components';

import styles from './Import.module.scss';
import { useImportFiles } from './useImportFiles';

export const Import = () => {
  const {
    dropAreaRef,
    isDragging,
    isDragOver,
    isImporting,
    importResults,
    handleBrowse,
  } = useImportFiles();

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Import Character</h1>
      <div
        ref={dropAreaRef}
        aria-busy={isImporting}
        className={clsx(styles.dropArea, {
          [styles.dragging]: isDragging && !isDragOver,
          [styles.dragOver]: isDragOver,
        })}
      >
        {isImporting && (
          <div className={styles.loadingOverlay}>
            <Spinner label="Importing characters" />
            <span>Importing characters...</span>
          </div>
        )}
        <Download
          size={48}
          className={styles.importIcon}
        />
        <span className={styles.dragText}>Drag save files here</span>
        <span className={styles.dragAlternativeText}>or</span>
        <Button
          variant="secondary"
          onClick={handleBrowse}
        >
          Browse files...
        </Button>
      </div>
      <ImportedFiles filesData={importResults} />
      <div className={styles.information}>
        <Info size={18} />
        <span className={styles.informationText}>
          The application automatically groups imported character versions by
          name and class.
        </span>
      </div>
    </div>
  );
};
