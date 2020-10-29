import React, { forwardRef, Ref } from 'react';
import { WebViewProps } from 'react-native-webview';
import { DOMBackendHandle } from '@formidable-webview/ersatz-core';
import Skeletton from '@formidable-webview/skeletton';
import { IframeBackend } from './IframeBackend';
import { IframeWebViewProps } from './types';

export const IframWebView = forwardRef<
  DOMBackendHandle,
  WebViewProps & IframeWebViewProps
>(function IframWebView(props, ref) {
  return (
    <Skeletton
      ref={ref as Ref<Skeletton>}
      {...props}
      DOMBackend={IframeBackend}
    />
  );
});
