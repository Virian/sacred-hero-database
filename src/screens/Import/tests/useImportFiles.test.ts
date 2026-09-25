import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toast } from 'react-toastify';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { open } from '@tauri-apps/plugin-dialog';

import { useImportFiles } from '../useImportFiles';

const {
  getCurrentWebviewWindowMock,
  invokeMock,
  onDragDropEventMock,
  unlistenMock,
  openMock,
} = vi.hoisted(() => ({
  getCurrentWebviewWindowMock: vi.fn(),
  invokeMock: vi.fn(),
  onDragDropEventMock: vi.fn(),
  unlistenMock: vi.fn(),
  openMock: vi.fn(),
}));

vi.mock('../../../hooks', () => ({
  useInvokeMutation: () => ({ invoke: invokeMock }),
}));

vi.mock('@tauri-apps/api/webviewWindow', () => ({
  getCurrentWebviewWindow: getCurrentWebviewWindowMock,
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: openMock,
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

type DragDropEvent = {
  payload: {
    type: 'enter' | 'leave' | 'over' | 'drop';
    position: { x: number; y: number };
    paths: string[];
  };
};

describe('useImportFiles', () => {
  let dragDropHandler: (event: DragDropEvent) => Promise<void> | void;

  beforeEach(() => {
    getCurrentWebviewWindowMock.mockReturnValue({
      onDragDropEvent: onDragDropEventMock,
    });
    onDragDropEventMock.mockImplementation((handler) => {
      dragDropHandler = handler;
      return Promise.resolve(unlistenMock);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers and unregisters the drag-and-drop listener', async () => {
    // given
    const { unmount } = renderHook(() => useImportFiles());

    // when
    unmount();
    await act(async () => {});

    // then
    expect(getCurrentWebviewWindow).toHaveBeenCalledTimes(1);
    expect(unlistenMock).toHaveBeenCalledTimes(1);
  });

  it('updates dragging state for enter and leave events', async () => {
    // given
    const { result } = renderHook(() => useImportFiles());

    // when
    await act(async () => {
      await dragDropHandler({
        payload: { type: 'enter', position: { x: 0, y: 0 }, paths: [] },
      });
    });

    // then
    expect(result.current.isDragging).toBe(true);

    // when
    await act(async () => {
      await dragDropHandler({
        payload: { type: 'leave', position: { x: 0, y: 0 }, paths: [] },
      });
    });

    // then
    expect(result.current.isDragging).toBe(false);
    expect(result.current.isDragOver).toBe(false);
  });

  it('imports files selected with the browse dialog', async () => {
    // given
    openMock.mockResolvedValue(['Hero00.pax']);
    invokeMock.mockResolvedValue([
      {
        status: 'success',
        fileName: 'Hero00.pax',
        characterClass: 'Wood Elf',
      },
    ]);
    const { result } = renderHook(() => useImportFiles());

    // when
    await act(async () => {
      await result.current.handleBrowse();
    });

    // then
    expect(open).toHaveBeenCalledWith({
      multiple: true,
      directory: false,
      filters: [{ name: 'Save files', extensions: ['pax'] }],
    });
    expect(invokeMock).toHaveBeenCalledWith({ filePaths: ['Hero00.pax'] });
    expect(result.current.importResults).toEqual([
      {
        status: 'success',
        fileName: 'Hero00.pax',
        characterClass: 'Wood Elf',
      },
    ]);
    expect(toast.info).toHaveBeenCalledWith('Import process finished.');
  });

  it('reports when a dropped selection has no compatible save files', async () => {
    // given
    const { result } = renderHook(() => useImportFiles());
    result.current.dropAreaRef.current = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
      }),
    } as HTMLDivElement;

    // when
    await act(async () => {
      await dragDropHandler({
        payload: {
          type: 'drop',
          position: { x: 50, y: 50 },
          paths: ['notes.txt'],
        },
      });
    });

    // then
    expect(toast.error).toHaveBeenCalledWith(
      'No compatible save files found. Please select Sacred .pax files.',
    );
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('ignores valid save files dropped outside the drop area', async () => {
    // given
    const { result } = renderHook(() => useImportFiles());
    result.current.dropAreaRef.current = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
      }),
    } as HTMLDivElement;

    // when
    await act(async () => {
      await dragDropHandler({
        payload: {
          type: 'drop',
          position: { x: 150, y: 50 },
          paths: ['Hero00.pax'],
        },
      });
    });

    // then
    expect(invokeMock).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(result.current.isDragging).toBe(false);
    expect(result.current.isDragOver).toBe(false);
  });
});
