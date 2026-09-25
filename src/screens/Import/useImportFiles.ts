import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { open } from '@tauri-apps/plugin-dialog';

import { Commands } from '../../enums';
import { useInvokeMutation } from '../../hooks';
import type {
  ImportCharactersCommandParams,
  ImportCharactersCommandResponse,
} from '../../types';
import { type ImportResult, mapImportCommandResponse } from '../../utils';

import { isPointInRect } from './isPointInRect';

export const useImportFiles = () => {
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);

  // The Tauri listener is registered once, so the ref provides its current loading state
  // while the setter keeps that ref and the rendered React state synchronized.
  const isImportingRef = useRef(false);

  const setImporting = (value: boolean) => {
    isImportingRef.current = value;
    setIsImporting(value);
  };

  const { invoke: importCharacters } = useInvokeMutation<
    ImportCharactersCommandParams,
    ImportCharactersCommandResponse,
    ImportResult[]
  >({
    command: Commands.IMPORT_CHARACTERS,
    mapper: mapImportCommandResponse,
  });

  useEffect(() => {
    const webview = getCurrentWebviewWindow();

    let isUnmounted = false;
    let unlisten: (() => void) | undefined;

    webview
      .onDragDropEvent(async (event) => {
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
            );
            return;
          }

          try {
            setImporting(true);
            setImportResults([]);
            const data = await importCharacters({ filePaths: savesPaths });
            setImportResults(data);
            toast.info('Import process finished.');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            toast.error('Import process failed.');
          } finally {
            setImporting(false);
          }
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
    // Register the Tauri listener once; re-registering it when invoke changes could
    // create duplicate listeners while the existing listener already uses refs for live state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    try {
      setImporting(true);
      setImportResults([]);
      const data = await importCharacters({ filePaths });
      setImportResults(data);
      toast.info('Import process finished.');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Import process failed.');
    } finally {
      setImporting(false);
    }
  };

  return {
    dropAreaRef,
    isDragging,
    isDragOver,
    isImporting,
    importResults,
    handleBrowse,
  };
};
