/// <reference lib="dom" />
import React, {
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle
} from 'react';
import { unstable_createElement } from 'react-native-web';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type {
  DOMBackendHandle,
  DOMBackendProps
} from '@formidable-webview/ersatz-core';
import { webViewLifecycle } from '@formidable-webview/skeletton';

let globalFrameId = 0;

function normalizeDimensions(style: StyleProp<ViewStyle>) {
  const { width, height } = StyleSheet.flatten([
    { width: 0, height: 0 },
    style
  ]);
  return {
    width,
    height: width ? height : 0,
    wrapperHeight: `max(100%, ${
      typeof height === 'number' ? `${height}px` : height
    })`
  };
}

function printLog(method: string, message: string) {
  console.warn(`WebAsyncBackend#${method}: ${message}`);
}

export const AsyncEngine = forwardRef<
  DOMBackendHandle,
  JSDOMBackendEngineProps
>(
  (
    {
      // renderLoading,
      onLayout,
      domHandlers,
      // onHttpError,
      javaScriptEnabled,
      injectedJavaScript,
      injectedJavaScriptBeforeContentLoaded,
      // userAgent,
      style,
      html,
      url
    },
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const frameId = useRef(globalFrameId++).current;
    const handlersArray = Object.values(domHandlers);
    const { width, height, wrapperHeight } = normalizeDimensions(style);
    const ownerOrigin = document.location.origin;
    const eventBase = React.useMemo(
      () => ({
        url,
        title: ''
      }),
      [url]
    );
    console.info('HTML', html);
    const backendHandle = React.useMemo<DOMBackendHandle>(
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
            const script = document.createElement('script');
            script.innerText = javaScript;
            document.body.appendChild(script);
          }
        },
        reload() {
          this.getWindow().location.reload();
        },
        requestFocus() {
          this.getWindow().focus();
        },
        goBack() {
          printLog('goBack', 'not Implemented.');
        },
        goForward() {
          printLog('goForward', 'not Implemented.');
        },
        stopLoading() {
          printLog('stopLoading', 'not Implemented.');
        }
      }),
      []
    );
    const fullHtml = useMemo(
      () =>
        makeHtml({
          html,
          frameId,
          injectedJavaScript,
          injectedJavaScriptBeforeContentLoaded
        }),
      [frameId, html, injectedJavaScript, injectedJavaScriptBeforeContentLoaded]
    );
    const iframeProps: JSX.IntrinsicElements['iframe'] & {
      allowpaymentrequest: string;
    } = {
      width,
      height: '100%',
      ref: iframeRef,
      style: styles.iframe,
      srcDoc: fullHtml,
      allow: 'fullscreen',
      allowFullScreen: true,
      allowpaymentrequest: 'true',
      sandbox: `allow-same-origin ${
        javaScriptEnabled ? 'allow-scripts' : ''
      } allow-popups allow-forms`
    };
    useEffect(
      function initEffect() {
        console.info('ON LOAD START', url);
        webViewLifecycle.handleLoadStart(domHandlers, eventBase);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [...handlersArray]
    );
    useEffect(
      function messageEffect() {
        function handleMessage({ data, origin }: MessageEvent) {
          data &&
            data.frameId === frameId &&
            ownerOrigin === origin &&
            webViewLifecycle.handlePostMessage(
              domHandlers,
              {
                url,
                title: ''
              },
              data.message
            );
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [html, url, ...handlersArray]
    );
    useImperativeHandle(ref, () => backendHandle, [backendHandle]);
    const iframe = unstable_createElement('iframe', iframeProps);
    return (
      <View
        onLayout={onLayout}
        style={[
          { width, height: wrapperHeight, minHeight: height },
          styles.container
        ]}>
        {iframe}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  iframe: {
    flexGrow: 1,
    borderWidth: 0,
    flexBasis: 'auto'
  },
  container: {
    display: 'flex',
    flexBasis: 'auto',
    flex: 1
  }
});

const makeHtml = ({
  html,
  frameId,
  injectedJavaScript = '',
  injectedJavaScriptBeforeContentLoaded = ''
}: {
  html: string;
  frameId: number;
  injectedJavaScript?: string;
  injectedJavaScriptBeforeContentLoaded?: string;
}) => {
  const script = `
  <script>
  window.ReactNativeWebView = {
    postMessage(message) {
      window.parent.postMessage({ message: message, type: 'wv-message', frameId: ${frameId} }, '@formidable-webview/webshell');
    }
  };
  window.addEventListener('DOMContentLoaded', () => {
    window.parent.postMessage({ type: 'dom-event', name: 'DOMContentLoaded' });
  });
  window.addEventListener('load', () => {
    window.parent.postMessage({ type: 'dom-event', name: 'load' });
    const script = document.createElement('script');
    script.innerText = ${JSON.stringify(injectedJavaScript)};
    document.body.appendChild(script);
  });
  const script = document.createElement('script');
  script.innerText = ${JSON.stringify(injectedJavaScriptBeforeContentLoaded)};
  document.body.appendChild(script);
  </script>
  `;
  return html.replace('<body>', `<body>${script}`);
};
type JSDOMBackendEngineProps = Omit<DOMBackendProps, 'source'> & {
  html: string;
  url: string;
};
