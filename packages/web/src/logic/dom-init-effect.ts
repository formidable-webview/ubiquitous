import { webViewLifecycle } from '@formidable-webview/skeletton';
import { useEffect } from 'react';
import { createOnShouldStartLoadWithRequest } from '../shared';
import { WebBackendState } from '../types';

export function useDOMInitEffect({
  backendHandle,
  domHandlers,
  eventBase,
  frameId,
  iframeRef,
  injectedJavaScriptBeforeContentLoaded,
  instanceId,
  navigator,
  originWhitelist,
  ownerOrigin,
  setSyncState
}: WebBackendState) {
  useEffect(
    function initEffect() {
      setSyncState('loading');
      webViewLifecycle.handleLoadStart(domHandlers, eventBase);
      const onShouldStartLoadWithRequest = createOnShouldStartLoadWithRequest(
        originWhitelist as string[],
        iframeRef,
        domHandlers.onShouldStartLoadWithRequest
      );
      function handleBeforeUnload() {
        if (
          ifwindow?.document.activeElement &&
          ifwindow?.document.activeElement.hasAttribute('href')
        ) {
          // @ts-ignore
          const targetUrl = ifwindow.document.activeElement?.href as string;
          if (targetUrl) {
            const {
              shouldOpenUrl,
              shouldStart
            } = webViewLifecycle.shouldStartLoadEvent(
              onShouldStartLoadWithRequest,
              targetUrl
            );
            if (!shouldStart && !shouldOpenUrl) {
              navigator.reset();
            }
          }
        }
      }
      const ifwindow = backendHandle.getWindow() as Window & {
        ReactNativeWebView: any;
      };
      if (ifwindow) {
        ifwindow.ReactNativeWebView = {
          postMessage(message: string) {
            ifwindow.parent.postMessage(
              { message, frameId, instanceId },
              ownerOrigin
            );
          }
        };
      }
      ifwindow?.addEventListener('beforeunload', handleBeforeUnload);
      if (injectedJavaScriptBeforeContentLoaded) {
        backendHandle.injectJavaScript(injectedJavaScriptBeforeContentLoaded);
      }
      return () => {
        try {
          ifwindow?.removeEventListener('beforeunload', handleBeforeUnload);
        } catch (e) {}
      };
    },
    [
      backendHandle,
      domHandlers,
      domHandlers.onShouldStartLoadWithRequest,
      eventBase,
      frameId,
      iframeRef,
      injectedJavaScriptBeforeContentLoaded,
      instanceId,
      navigator,
      originWhitelist,
      ownerOrigin,
      setSyncState
    ]
  );
}
