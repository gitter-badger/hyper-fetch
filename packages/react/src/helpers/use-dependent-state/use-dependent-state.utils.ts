import {
  CacheValueType,
  NullableType,
  CommandInstance,
  ClientResponseType,
  ExtractResponse,
  ExtractError,
  ExtractFetchReturn,
  Dispatcher,
} from "@better-typed/hyper-fetch";

import { initialState, UseDependentStateType } from "helpers";

export const getDetailsState = (
  state?: UseDependentStateType<CommandInstance>,
  details?: Partial<CacheValueType<unknown, unknown>["details"]>,
): CacheValueType<unknown, unknown>["details"] => {
  return {
    retries: state?.retries || 0,
    timestamp: new Date(),
    isFailed: false,
    isCanceled: false,
    isOffline: false,
    ...details,
  };
};

export const isStaleCacheData = (cacheTime: NullableType<number>, cacheTimestamp: NullableType<Date | number>) => {
  if (!cacheTimestamp) return true;
  if (!cacheTime) return false;
  return +new Date() > +cacheTimestamp + cacheTime;
};

export const getValidCacheData = <T extends CommandInstance>(
  command: T,
  initialData: NullableType<ExtractFetchReturn<T>>,
  cacheData: NullableType<CacheValueType<ExtractResponse<T>, ExtractError<T>>>,
): CacheValueType<ExtractResponse<T>, ExtractError<T>> | null => {
  const isStale = isStaleCacheData(command.cacheTime, cacheData?.details.timestamp);

  if (!isStale && cacheData) {
    return cacheData;
  }

  if (initialData) {
    return {
      data: initialData,
      details: getDetailsState(),
      cacheTime: 1000,
    };
  }

  return null;
};

export const getTimestamp = (timestamp?: NullableType<number | Date>) => {
  return timestamp ? new Date(timestamp) : null;
};

export const responseToCacheValue = <T>(
  response: ClientResponseType<ExtractResponse<T>, ExtractError<T>> | null,
): NullableType<CacheValueType> => {
  if (!response) return null;
  return {
    data: response,
    details: getDetailsState(),
    cacheTime: 1000,
  };
};

export const getInitialState = <T extends CommandInstance>(
  initialData: ClientResponseType<ExtractResponse<T>, ExtractError<T>> | null,
  dispatcher: Dispatcher,
  command: T,
): UseDependentStateType<T> => {
  const { builder, cacheKey } = command;
  const { cache } = builder;

  const cacheData = cache.get<ExtractResponse<T>, ExtractError<T>>(cacheKey);
  const cacheState = getValidCacheData<T>(command, initialData, cacheData);

  const initialLoading = dispatcher.hasRunningRequests(command.queueKey);

  return {
    ...initialState,
    data: cacheState?.data?.[0] || initialState.data,
    error: cacheState?.data?.[1] || initialState.error,
    status: cacheState?.data?.[2] || initialState.status,
    retries: cacheState?.details.retries || initialState.retries,
    timestamp: getTimestamp(cacheState?.details.timestamp || initialState.timestamp),
    loading: initialLoading ?? initialState.loading,
  };
};
