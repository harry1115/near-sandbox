'use client';
import {
  type DependencyList,
  type EffectCallback,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import { debounce, type DebounceSettings } from 'lodash-es';

type DebounceOptions = number | ({ wait: number } & Partial<DebounceSettings>);
type RequestOptions<T> = {
  refreshDeps?: React.DependencyList;
  before?: () => boolean | undefined;
  manual?: boolean;
  onSuccess?: (res: T) => void;
  onError?: (err: Error) => void;
  debounceOptions?: DebounceOptions;
  retryCount?: number;
  retryInterval?: number;
  pollingInterval?: number;
};

export function useRequest<T>(request: () => Promise<T>, options?: RequestOptions<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const {
    refreshDeps = [],
    before,
    manual,
    onSuccess,
    onError,
    debounceOptions,
    retryCount = 0,
    retryInterval = 0,
    pollingInterval,
  } = options || {};

  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  const clearPolling = useCallback(() => {
    if (pollingTimer.current) {
      clearTimeout(pollingTimer.current);
      pollingTimer.current = null;
    }
  }, []);

  const run = useCallback(async () => {
    let attempts = 0;

    const executeRequest = async () => {
      try {
        setLoading(true);
        const res = await request();
        setData(res);
        onSuccess?.(res);
        return true;
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error(String(err)));
        onError?.(err instanceof Error ? err : new Error(String(err)));
        return false;
      } finally {
        setLoading(false);
      }
    };

    const attemptRequest = async () => {
      const success = await executeRequest();
      if (!success && attempts < retryCount) {
        attempts += 1;
        setTimeout(attemptRequest, retryInterval);
      }
    };

    if (before && !before()) return;
    attemptRequest();

    if (pollingInterval) {
      pollingTimer.current = setTimeout(run, pollingInterval);
    }
  }, [request, onSuccess, onError, retryCount, retryInterval, before, pollingInterval]);

  useDebouncedEffect(
    () => {
      if (manual) return;
      if (before && !before()) return;
      run();
      return () => clearPolling();
    },
    [...refreshDeps, clearPolling],
    debounceOptions,
  );

  return {
    run,
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
    clearPolling,
  };
}

export function useDebouncedEffect(
  effect: EffectCallback,
  deps: React.DependencyList,
  debounceOptions?: DebounceOptions,
) {
  useEffect(() => {
    const options =
      typeof debounceOptions === 'number' ? { wait: debounceOptions } : debounceOptions;
    const debouncedEffect = debounce(
      () => {
        const cleanupFn = effect();
        if (cleanupFn) {
          debouncedEffect.flush = cleanupFn as any;
        }
      },
      options?.wait,
      options,
    );

    debouncedEffect();

    return () => {
      debouncedEffect.cancel();
      if (debouncedEffect.flush) {
        debouncedEffect.flush();
      }
    };
  }, [...deps]);
}

export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial?: T,
) {
  const [val, setVal] = useState<T | undefined>(initial);
  useDebouncedEffect(
    () => {
      let cancel = false;
      const promise = factory();
      if (promise === undefined || promise === null) return;
      promise.then((val) => {
        if (!cancel) {
          setVal(val);
        }
      });
      return () => {
        cancel = true;
      };
    },
    deps,
    300,
  );
  return val;
}
