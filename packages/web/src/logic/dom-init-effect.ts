import { webViewLifecycle } from '@formidable-webview/skeletton';
import { useEffect } from 'react';
import {
  createOnShouldStartLoadWithRequest,
  isActiveElementAnchor
} from '../shared';
import { WebBackendState } from '../types';

export function useDOMInitEffect({
  backendHandle,
  domHandlers,
  eventBase,
  frameId,
  iframeRef,
  injectedJavaScriptBeforeContentLoaded,
  instanceId,
  loader,
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
        const activeElement = ifwindow?.document.activeElement;
        if (isActiveElementAnchor(activeElement)) {
          const targetUrl = activeElement.href;
          const {
            shouldOpenUrl,
            shouldStart
          } = webViewLifecycle.shouldStartLoadEvent(
            onShouldStartLoadWithRequest,
            targetUrl
          );
          if (!shouldStart && !shouldOpenUrl) {
            loader.reload();
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
      loader,
      originWhitelist,
      ownerOrigin,
      setSyncState
    ]
  );
}
