import { useCallback, useState } from 'react';
import { invoke as tauriInvoke, type InvokeArgs } from '@tauri-apps/api/core';

import type { Commands } from '../enums';

interface UseInvokeMutationParams<TResponseData, TMappedData = TResponseData> {
  command: Commands;
  mapper?: (data: TResponseData) => TMappedData;
}

export const useInvokeMutation = <
  TArgs extends object | undefined = undefined,
  TResponseData = unknown,
  TMappedData = TResponseData,
>({
  command,
  mapper,
}: UseInvokeMutationParams<TResponseData, TMappedData>) => {
  const [isLoading, setIsLoading] = useState(false);

  const invoke = useCallback(
    async (args: TArgs) => {
      setIsLoading(true);
      try {
        const response = await tauriInvoke<TResponseData>(
          command,
          args as InvokeArgs | undefined,
        );
        return mapper ? mapper(response) : (response as TMappedData);
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [command, mapper],
  );

  return { invoke, isLoading };
};
