import { DOMBackendHandle } from '@formidable-webview/ersatz-core';
import React, { RefObject } from 'react';
import { printLimitedContextMsg } from '../shared';
import { PageLoader } from '../types';

export function useBackendHandle(
  iframeRef: RefObject<HTMLIFrameElement>,
  loader: PageLoader
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
        loader.reload();
      },
      requestFocus() {
        iframeRef.current?.focus();
      },
      goBack() {
        loader.goBack();
      },
      goForward() {
        loader.goForward();
      },
      stopLoading() {
        loader.stopLoading();
      }
    }),
    [iframeRef, loader]
  );
}
