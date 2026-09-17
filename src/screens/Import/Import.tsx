import { CircleCheck, CircleX, Download, Info } from 'lucide-react';

import { Button, CharacterPortrait } from '../../components';
import { CharacterClass } from '../../enums';

import styles from './Import.module.scss';

export const Import = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Import Character</h1>
      <div className={styles.dropArea}>
        <Download
          size={48}
          className={styles.importIcon}
        />
        <span className={styles.dragText}>Drag save files here</span>
        <span className={styles.dragAlternativeText}>or</span>
        <Button variant="secondary">Browse files...</Button>
      </div>
      <div className={styles.importedContainer}>
        <h4 className={styles.headerRow}>Imported files</h4>
        <div className={styles.importedRow}>
          <div className={styles.fileInformation}>
            <CharacterPortrait
              characterClass={CharacterClass.WOOD_ELF}
              size={36}
            />
            <div className={styles.importedTextInformationContainer}>
              <span className={styles.fileName}>Hero00.pax</span>
              <span className={styles.importStatus}>Successfully imported</span>
            </div>
          </div>
          <CircleCheck className={styles.successIcon} />
        </div>
        <div className={styles.importedRow}>
          <div className={styles.fileInformation}>
            <div className={styles.importedTextInformationContainer}>
              <span className={styles.fileName}>Hero01.pax</span>
              <span className={styles.importStatus}>Import failed</span>
            </div>
          </div>
          <CircleX className={styles.failureIcon} />
        </div>
      </div>
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
