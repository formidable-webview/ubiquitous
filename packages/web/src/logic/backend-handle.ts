import { DOMBackendHandle } from '@formidable-webview/ersatz-core';
import React, { RefObject } from 'react';
import { Navigator } from '../types';

function printLog(method: string, message: string) {
  console.warn(`WebBackend#${method}: ${message}`);
}

function printLimitedContextMsg(method: string) {
  printLog(
    method,
    'This iframe renders a cross origin resource, and thus the execution context is limited. JavaScript injection is not available in such context.'
  );
}

export function useBackendHandle(
  iframeRef: RefObject<HTMLIFrameElement>,
  navigator: Navigator
) {
  return React.useMemo<DOMBackendHandle<Document, Window>>(
    () => ({
      getDocument() {
        return iframeRef.current?.contentDocument as Document;
      },
      getWindow() {
        return iframeRef.current?.contentWindow as Window;
      },
      injectJavaScript(javaScript: string) {
        const document = this.getDocument();
        if (document) {
          if (javaScript) {
            const script = document.createElement('script');
            script.innerText = javaScript;
            document.body.appendChild(script);
          }
        } else {
          printLimitedContextMsg('injectJavaScript');
        }
      },
      reload() {
        navigator.reload();
      },
      requestFocus() {
        iframeRef.current?.focus();
      },
      goBack() {
        navigator.goBack();
      },
      goForward() {
        navigator.goForward();
      },
      stopLoading() {
        printLog('stopLoading', 'not Implemented.');
      }
    }),
    [iframeRef, navigator]
  );
}
