/// <reference lib="dom" />
import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle
} from 'react-native';
import { unstable_createElement } from 'react-native-web';
import { webViewLifecycle } from '@formidable-webview/skeletton';
import type {
  DOMBackendFunctionComponent,
  DOMBackendHandle,
  DOMBackendProps
} from '@formidable-webview/ersatz-core';

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

export const WebBackend: DOMBackendFunctionComponent = forwardRef(
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
      source
    }: DOMBackendProps & ViewProps,
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const frameId = useRef(globalFrameId++).current;
    const handlersArray = Object.values(domHandlers);
    const { width, height, wrapperHeight } = normalizeDimensions(style);
    const ownerOrigin = document.location.origin;
    const uri = (source as any)?.uri;
    const html = (source as any)?.html;
    const eventBase = React.useMemo(
      () => ({
        url: uri ?? 'about:blank',
        title: ''
      }),
      [uri]
    );
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
          console.info(document, iframeRef.current?.contentDocument);
          const script = document.createElement('script');
          script.innerText = javaScript;
          document.body.appendChild(script);
        },
        reload() {
          this.getWindow().location.reload();
        },
        requestFocus() {
          this.getWindow().focus();
        },
        goBack() {
          // noop
        },
        goForward() {
          // noop
        },
        stopLoading() {
          // noop
        }
      }),
      []
    );
    const iframeProps: JSX.IntrinsicElements['iframe'] & {
      allowpaymentrequest: string;
    } = {
      width,
      height: '100%',
      ref: iframeRef,
      style: styles.iframe,
      src: uri,
      srcDoc: (source as any)?.html,
      allow: 'fullscreen',
      allowFullScreen: true,
      allowpaymentrequest: 'true',
      sandbox: `allow-same-origin ${
        javaScriptEnabled ? 'allow-scripts' : ''
      } allow-popups allow-forms`
    };
    useEffect(
      function initEffect() {
        console.info('ON LOAD START', uri);
        webViewLifecycle.handleLoadStart(domHandlers, eventBase);
        const ifwindow = backendHandle.getWindow() as Window & {
          ReactNativeWebView: any;
        };
        ifwindow.ReactNativeWebView = {
          postMessage(message: string) {
            ifwindow.parent.postMessage({ message, frameId }, ownerOrigin);
          }
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [...handlersArray]
    );
    useEffect(() => {
      function handleContentLoadEnd() {
        console.info('ON CONTENT LOAD END', eventBase);
        injectedJavaScriptBeforeContentLoaded &&
          backendHandle.injectJavaScript(injectedJavaScriptBeforeContentLoaded);
      }
      function handleLoadEnd() {
        console.info('ON LOAD END', eventBase);
        injectedJavaScript &&
          backendHandle.injectJavaScript(injectedJavaScript);
        webViewLifecycle.handleLoadEnd(domHandlers, eventBase);
      }
      const iframe = iframeRef.current;
      iframe?.addEventListener('load', handleLoadEnd);
      iframe?.addEventListener('DOMContentLoaded', handleContentLoadEnd);
      return () => {
        iframe?.removeEventListener('load', handleLoadEnd);
        iframe?.removeEventListener('DOMContentLoaded', handleContentLoadEnd);
      };
    }, [
      uri,
      html,
      injectedJavaScript,
      backendHandle,
      eventBase,
      frameId,
      injectedJavaScriptBeforeContentLoaded,
      domHandlers,
      ownerOrigin
    ]);
    useEffect(
      function messageEffect() {
        function handleMessage({ data, origin }: MessageEvent) {
          data &&
            data.frameId === frameId &&
            ownerOrigin === origin &&
            webViewLifecycle.handlePostMessage(
              domHandlers,
              {
                url: uri ?? 'about:blank',
                title: ''
              },
              data.message
            );
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [uri, html, ...handlersArray]
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
