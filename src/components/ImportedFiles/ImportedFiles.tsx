import { CircleCheck, CircleX, RedoDot } from 'lucide-react';

import { CharacterPortrait } from '..';
import { CharacterClass } from '../../enums';

import styles from './ImportedFiles.module.scss';

const rowIconMap = {
  success: <CircleCheck className={styles.successIcon} />,
  skipped: <RedoDot className={styles.skippedIcon} />,
  error: <CircleX className={styles.failureIcon} />,
};

interface ImportedRow {
  status: 'success' | 'skipped' | 'error';
  characterClass?: CharacterClass;
  fileName: string;
  message?: string;
}

interface ImportedFilesProps {
  filesData: ImportedRow[];
}

export const ImportedFiles = ({ filesData }: ImportedFilesProps) => {
  const getImportStatusMessage = (importedRow: ImportedRow) => {
    if (importedRow.status === 'error') {
      return `Import failed${importedRow.message ? `. Error: ${importedRow.message}` : ''}`;
    }
    if (importedRow.status === 'skipped') {
      return 'This version is already in the database. Skipping.';
    }
    return 'Successfully imported';
  };

  if (!filesData.length) {
    return null;
  }

  return (
    <div className={styles.importedContainer}>
      <h4 className={styles.headerRow}>Imported files</h4>
      {filesData.map((importedRow, index) => (
        <div
          key={index}
          className={styles.importedRow}
        >
          <div className={styles.fileInformation}>
            {importedRow.characterClass && (
              <CharacterPortrait
                characterClass={importedRow.characterClass}
                size={36}
              />
            )}
            <div className={styles.importedTextInformationContainer}>
              <span className={styles.fileName}>{importedRow.fileName}</span>
              <span className={styles.importStatus}>
                {getImportStatusMessage(importedRow)}
              </span>
            </div>
          </div>
          {rowIconMap[importedRow.status]}
        </div>
      ))}
    </div>
  );
};
