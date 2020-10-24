import React, { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle
} from 'react-native';
import { unstable_createElement } from 'react-native-web';
import type {
  DOMBackendFunctionComponent,
  DOMBackendProps
} from '@formidable-webview/ersatz-core';
import {
  defaultRenderError,
  defaultRenderLoading,
  getEventBase
} from './shared';
import { IframeWebViewProps, WebBackendState } from './types';
import { usePageLoader } from './logic/navigation';
import { useBackendHandle } from './logic/backend-handle';
import { useOnLoadEnd } from './logic/on-load-end';
import { useErrorEffect } from './logic/error-effect';
import { useMessageEffect } from './logic/message-effect';
import { useDOMInitEffect } from './logic/dom-init-effect';
import { useOriginWhitelistEffect } from './logic/origin-whitelist-effect';
import { useIframeProps, defaultWebPolicies } from './logic/iframe-props';

let globalFrameId = 0;

function useNormalizedDimensions(style: StyleProp<ViewStyle>) {
  const { width, height } = useMemo(
    () => StyleSheet.flatten([{ width: 0, height: 0 }, style]),
    [style]
  );
  return {
    width,
    height: width ? height : 0,
    wrapperHeight: `max(100%, ${
      typeof height === 'number' ? `${height}px` : height
    })`
  };
}

export const WebBackend: DOMBackendFunctionComponent<IframeWebViewProps> = forwardRef(
  (props: DOMBackendProps<IframeWebViewProps> & ViewProps, ref) => {
    const { renderLoading, renderError, onLayout, style, source } = props;
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const frameId = useRef(globalFrameId++).current;
    const navState = usePageLoader(source);
    const { uri, syncState, loader } = navState;
    const { width, height, wrapperHeight } = useNormalizedDimensions(style);
    const ownerOrigin = document.location.origin;
    const eventBase = React.useMemo(() => getEventBase(uri), [uri]);
    const backendHandle = useBackendHandle(iframeRef, loader);
    const backendState: WebBackendState = {
      ...props,
      ...navState,
      iframeRef,
      frameId,
      eventBase,
      backendHandle,
      ownerOrigin
    };
    const handleOnLoadEnd = useOnLoadEnd(backendState);
    useDOMInitEffect(backendState);
    useOriginWhitelistEffect(backendState);
    useErrorEffect(backendState);
    useMessageEffect(backendState);
    useImperativeHandle(ref, () => backendHandle, [backendHandle]);
    return (
      <View
        onLayout={onLayout}
        style={[
          { width, height: wrapperHeight, minHeight: height },
          styles.container
        ]}>
        {unstable_createElement(
          'iframe',
          useIframeProps({
            ...backendState,
            onLoad: handleOnLoadEnd,
            width,
            style: styles.iframe
          })
        )}
        {syncState === 'error'
          ? renderError!(undefined, 0, 'The iframe failed to load.')
          : null}
        {syncState === 'loading' ? renderLoading!() : null}
      </View>
    );
  }
);

const defaultProps: Partial<DOMBackendProps<IframeWebViewProps>> = {
  fullscreenEnabled: true,
  geolocationEnabled: false,
  lazyLoadingEnabled: false,
  mediaPlaybackRequiresUserAction: true,
  messagingEnabled: true,
  originWhitelist: [],
  paymentEnabled: true,
  renderError: defaultRenderError,
  renderLoading: defaultRenderLoading,
  sandbox: 'allow-same-origin allow-modals allow-popups allow-forms',
  sandboxEnabled: true,
  webPolicies: defaultWebPolicies
};

WebBackend.defaultProps = defaultProps;

const styles = StyleSheet.create({
  iframe: {
    flexGrow: 1,
    borderWidth: 0,
    flexBasis: 'auto'
  },
  container: {
    display: 'flex',
    flexBasis: 'auto',
    position: 'relative',
    flex: 1
  }
});
