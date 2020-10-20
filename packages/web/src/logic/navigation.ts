import { useState, useCallback, useMemo } from 'react';
import { Navigation, PageLoader, PageLoadState } from '../types';
import {
  WebViewSourceHtml,
  WebViewSourceUri,
  WebViewSource
} from 'react-native-webview/lib/WebViewTypes';
import { printLog } from '../shared';

function getNextSyncState(
  st: Navigation,
  requestedState: Navigation['syncState']
) {
  return (st.syncState === 'init' && requestedState === 'loading') ||
    (st.syncState === 'loading' && requestedState === 'loaded') ||
    (st.syncState === 'loading' && requestedState === 'error') ||
    (st.syncState === 'loaded' && requestedState === 'init') ||
    (st.syncState === 'loaded' && requestedState === 'error') || // For chrome
    (st.syncState === 'error' && requestedState === 'init')
    ? requestedState
    : st.syncState;
}

function printUnsupportedOperation(method: string) {
  printLog(
    method,
    'Operation unsupported on Web. Add logic to conditionnaly invoke this method platform-wise.'
  );
}

export function usePageLoader(
  source: WebViewSource | undefined
): PageLoadState {
  const [navState, setState] = useState<Navigation>({
    instanceId: 0,
    syncState: 'init'
  });
  const uri = (source as WebViewSourceUri)?.uri;
  const html = (source as WebViewSourceHtml)?.html;
  const baseUrl = (source as WebViewSourceHtml)?.baseUrl;
  const setSyncState = useCallback(
    (requestedState: Navigation['syncState']) =>
      setState((st) => {
        const nextAllowedState = getNextSyncState(st, requestedState);
        return nextAllowedState !== st.syncState
          ? { ...st, syncState: nextAllowedState }
          : st;
      }),
    []
  );
  const flagHasError = useCallback(() => setSyncState('error'), [setSyncState]);
  const loader = useMemo<PageLoader>(
    () => ({
      reload() {
        setState((st) => ({
          ...st,
          instanceId: st.instanceId + 1,
          syncState: 'init'
        }));
      },
      goBack() {
        printUnsupportedOperation('goBack');
      },
      goForward() {
        printUnsupportedOperation('goForward');
      },
      stopLoading() {
        printUnsupportedOperation('stopLoading');
      }
    }),
    []
  );
  return useMemo(
    () => ({
      instanceId: navState.instanceId,
      uri,
      baseUrl,
      html,
      loader,
      syncState: navState.syncState,
      setSyncState,
      flagHasError
    }),
    [
      navState.instanceId,
      navState.syncState,
      uri,
      baseUrl,
      html,
      loader,
      setSyncState,
      flagHasError
    ]
  );
}
