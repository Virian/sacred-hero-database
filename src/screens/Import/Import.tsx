import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { CircleCheck, CircleX, Download, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { open } from '@tauri-apps/plugin-dialog';

import { Button, CharacterPortrait, Spinner } from '../../components';
import { CharacterClass } from '../../enums';

import styles from './Import.module.scss';
import { isPointInRect } from './isPointInRect';

export const Import = () => {
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // The Tauri listener is registered once, so the ref provides its current loading state
  // while the setter keeps that ref and the rendered React state synchronized.
  const isImportingRef = useRef(false);

  const setImporting = (value: boolean) => {
    isImportingRef.current = value;
    setIsImporting(value);
  };

  useEffect(() => {
    const webview = getCurrentWebviewWindow();

    let isUnmounted = false;
    let unlisten: (() => void) | undefined;

    webview
      .onDragDropEvent((event) => {
        if (isImportingRef.current) {
          return;
        }

        if (event.payload.type === 'enter') {
          setIsDragging(true);
          setIsDragOver(false);
          return;
        }

        if (event.payload.type === 'leave') {
          setIsDragging(false);
          setIsDragOver(false);
          return;
        }

        const position = event.payload.position;
        const dropArea = dropAreaRef.current;

        if (!dropArea) {
          return;
        }

        const scale = window.devicePixelRatio;
        const x = position.x / scale;
        const y = position.y / scale;
        const bounds = dropArea.getBoundingClientRect();
        const isPositionOverDropArea = isPointInRect({ x, y }, bounds);

        if (event.payload.type === 'over') {
          setIsDragOver(isPositionOverDropArea);
          return;
        }

        if (event.payload.type === 'drop') {
          setIsDragOver(false);
          setIsDragging(false);

          if (!isPositionOverDropArea) {
            return;
          }

          const savesPaths = event.payload.paths.filter((filePath) =>
            filePath.endsWith('.pax'),
          );

          if (!savesPaths.length) {
            toast.error(
              'No compatible save files found. Please select Sacred .pax files.',
              {
                position: 'bottom-center',
                theme: 'dark',
              },
            );
            return;
          }

          setImporting(true);

          // TODO: invoke import and setImporting(false) when it finishes.
        }
      })
      .then((removeListener) => {
        if (isUnmounted) {
          removeListener();
          return;
        }

        unlisten = removeListener;
      });

    return () => {
      isUnmounted = true;
      unlisten?.();
    };
  }, []);

  const handleBrowse = async () => {
    if (isImportingRef.current) {
      return;
    }

    const filePaths = await open({
      multiple: true,
      directory: false,
      filters: [{ name: 'Save files', extensions: ['pax'] }],
    });

    if (!filePaths || !filePaths.length) {
      return;
    }

    setImporting(true);

    // TODO: invoke import and setImporting(false) when it finishes.
  };

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
