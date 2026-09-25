import { useCallback, useEffect, useMemo, useState } from 'react';
import { invoke as tauriInvoke, type InvokeArgs } from '@tauri-apps/api/core';

import type { Commands } from '../enums';

interface UseInvokeQueryParams<
  TResponseData,
  TMappedData = TResponseData,
  TArgs extends InvokeArgs | undefined = undefined,
> {
  command: Commands;
  args?: TArgs;
  shouldAutoInvoke?: boolean;
  mapper?: (data: TResponseData) => TMappedData;
}

export const useInvokeQuery = <
  TResponseData,
  TMappedData = TResponseData,
  TArgs extends InvokeArgs | undefined = undefined,
>({
  command,
  args,
  shouldAutoInvoke = true,
  mapper,
}: UseInvokeQueryParams<TResponseData, TMappedData, TArgs>) => {
  const [data, setData] = useState<TResponseData | undefined>(undefined);
  const [error, setError] = useState<unknown>(undefined);
  const [hasFetched, setHasFetched] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const isLoading = isFetching && !hasFetched;

  const refetch = useCallback(async () => {
    setIsFetching(true);
    setError(undefined);
    try {
      const response = await tauriInvoke<TResponseData>(command, args);
      setData(response);
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setHasFetched(true);
      setIsFetching(false);
    }
  }, [command, args]);

  const mappedData = useMemo(
    () => (data && mapper ? mapper(data) : (data as TMappedData | undefined)),
    [data, mapper],
  );

  useEffect(() => {
    const initData = async () => {
      refetch();
    };

    if (shouldAutoInvoke) {
      initData();
    }
  }, [refetch, shouldAutoInvoke]);

  return {
    data: mappedData,
    error,
    hasFetched,
    refetch,
    isLoading,
    isFetching,
  };
};
