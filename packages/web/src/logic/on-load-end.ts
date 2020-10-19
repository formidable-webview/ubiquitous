import { webViewLifecycle } from '@formidable-webview/skeletton';
import { useCallback } from 'react';
import { WebBackendState } from '../types';

function injectBaseElement(document: Document | null, baseUrl: string) {
  if (!document) {
    return;
  }
  const head =
    document.getElementsByTagName('head')[0] ||
    (() => {
      const hd = document.createElement('head');
      document.documentElement.appendChild(hd);
      return hd;
    })();
  const base =
    head.getElementsByTagName('base')[0] ||
    (() => {
      const bs = document.createElement('base');
      head.appendChild(bs);
      return bs;
    })();
  base.href = baseUrl;
}

export function useOnLoadEnd({
  injectedJavaScript,
  domHandlers,
  eventBase,
  baseUrl,
  backendHandle,
  setSyncState
}: WebBackendState) {
  return useCallback(
    function handleLoadEnd() {
      injectedJavaScript && backendHandle.injectJavaScript(injectedJavaScript);
      webViewLifecycle.handleLoadEnd(domHandlers, eventBase);
      if (baseUrl) {
        injectBaseElement(backendHandle.getDocument(), baseUrl);
      }
      setSyncState('loaded');
    },
    [
      backendHandle,
      baseUrl,
      domHandlers,
      eventBase,
      injectedJavaScript,
      setSyncState
    ]
  );
}
