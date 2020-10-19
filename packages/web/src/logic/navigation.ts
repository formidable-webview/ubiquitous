import { useState, useCallback, useMemo } from 'react';
import { Navigation, Navigator, NavigationState } from '../types';
import {
  WebViewSourceHtml,
  WebViewSourceUri,
  WebViewSource
} from 'react-native-webview/lib/WebViewTypes';

function canGoBack(state: Navigation) {
  return state.current > 0;
}

function canGoForward(state: Navigation) {
  return state.current < state.history.length - 1;
}

function getNextSyncState(
  st: Navigation,
  requestedSyncSt: Navigation['syncState']
) {
  return (st.syncState === 'init' && requestedSyncSt === 'loading') ||
    (st.syncState === 'loading' && requestedSyncSt === 'loaded') ||
    (st.syncState === 'loading' && requestedSyncSt === 'error') ||
    (st.syncState === 'loaded' && requestedSyncSt === 'init') ||
    (st.syncState === 'loaded' && requestedSyncSt === 'error') || // For chrome
    (st.syncState === 'error' && requestedSyncSt === 'init')
    ? requestedSyncSt
    : st.syncState;
}

export function useNavigation(
  source: WebViewSource | undefined
): NavigationState {
  const [navState, setState] = useState<Navigation>({
    current: 0,
    history: [source || { html: '' }],
    instanceId: 0,
    syncState: 'init'
  });
  const uri = (source as WebViewSourceUri)?.uri;
  const html = (source as WebViewSourceHtml)?.html;
  const baseUrl = (source as WebViewSourceHtml)?.baseUrl;
  const selectedSource = navState.history[navState.current];
  const histUri = (selectedSource as WebViewSourceUri)?.uri;
  const histBaseUrl = (selectedSource as WebViewSourceHtml)?.baseUrl;
  const histHtml = (selectedSource as WebViewSourceHtml)?.html;
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
  const navigator = useMemo<Navigator>(
    () => ({
      reset() {
        setState((st) => ({
          ...st,
          instanceId: st.instanceId + 1,
          current: 0,
          history: [{ uri, html, baseUrl }],
          syncState: 'init'
        }));
      },
      reload() {
        setState((st) => ({
          ...st,
          instanceId: st.instanceId + 1,
          syncState: 'init'
        }));
      },
      navigate(next: WebViewSource) {
        setState((st) => ({
          ...st,
          current: st.current + 1,
          history: [...st.history, next],
          syncState: 'init'
        }));
      },
      goBack() {
        setState((st) => {
          if (canGoBack(st)) {
            return {
              ...st,
              current: st.current - 1,
              syncState: 'init'
            };
          }
          return st;
        });
      },
      goForward() {
        setState((st) => {
          if (canGoForward(st)) {
            return {
              ...st,
              current: st.current + 1,
              syncState: 'init'
            };
          }
          return st;
        });
      }
    }),
    [uri, html, baseUrl]
  );
  // useEffect(() => {
  //   navigator.reset();
  // }, [navigator]);
  return useMemo(
    () => ({
      instanceId: navState.instanceId,
      uri: histUri,
      baseUrl: histBaseUrl,
      html: histHtml,
      navigator,
      syncState: navState.syncState,
      setSyncState,
      flagHasError,
      canGoBack: canGoBack.bind(null, navState),
      canGoForward: canGoForward.bind(null, navState)
    }),
    [
      navState,
      setSyncState,
      flagHasError,
      histBaseUrl,
      histHtml,
      histUri,
      navigator
    ]
  );
}
