import React, {
  createRef,
  forwardRef,
  PureComponent,
  Ref,
  useMemo
} from 'react';
import { WebViewProps } from 'react-native-webview';
import { ScrollView, StyleSheet } from 'react-native';
import {
  DOMBackendHandle,
  WindowShape,
  DocumentShape,
  DOMBackendComponent
} from '@formidable-webview/ersatz-core';
import assert from 'assert';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden'
  },
  webView: {
    flex: 0,
    height: '100%',
    width: 0,
    backgroundColor: '#ffffff'
  },
  webViewWrapper: {
    margin: 0,
    padding: 0,
    flex: 1
  }
});

export interface SkelettonProps extends WebViewProps {
  DOMBackend: DOMBackendComponent;
}

const BackendRenderer = forwardRef<DOMBackendHandle, SkelettonProps>(
  function BackendRenderer(props: SkelettonProps, ref: Ref<DOMBackendHandle>) {
    const {
      DOMBackend,
      onError,
      onHttpError,
      onLoad,
      onLoadEnd,
      onLoadProgress,
      onLoadStart,
      onMessage,
      onNavigationStateChange,
      onShouldStartLoadWithRequest,
      style,
      ...otherProps
    } = props;
    const webViewStyle = [styles.webView, style];
    const domHandlers = useMemo(
      () => ({
        onError,
        onLoad,
        onLoadEnd,
        onLoadProgress,
        onLoadStart,
        onMessage,
        onNavigationStateChange,
        onShouldStartLoadWithRequest
      }),
      [
        onError,
        onLoad,
        onLoadEnd,
        onLoadProgress,
        onLoadStart,
        onMessage,
        onNavigationStateChange,
        onShouldStartLoadWithRequest
      ]
    );
    return (
      <DOMBackend
        domHandlers={domHandlers}
        onHttpError={onHttpError}
        ref={ref}
        style={webViewStyle}
        {...otherProps}
      />
    );
  }
);
export class Skeletton<
    D extends DocumentShape = DocumentShape,
    W extends WindowShape = WindowShape
  >
  extends PureComponent<WebViewProps & { DOMBackend: DOMBackendComponent }>
  implements DOMBackendHandle {
  static defaultProps: Partial<WebViewProps> = {
    javaScriptEnabled: true
  };
  private backend = createRef<DOMBackendHandle<D, W>>();
  private scrollview = createRef<ScrollView>();

  private formatLog(method: string, text: string): string {
    return `${Skeletton.name}#${method}: ${text}`;
  }

  goBack() {
    this.backend.current?.goBack();
  }

  goForward() {
    this.backend.current?.goForward();
  }

  reload() {
    this.backend.current?.reload();
  }

  stopLoading() {
    this.backend.current?.stopLoading();
  }

  static extraNativeComponentConfig() {}

  injectJavaScript(script: string) {
    this.backend.current?.injectJavaScript(script);
  }

  requestFocus() {
    this.backend.current?.requestFocus();
  }

  getWindow() {
    const backend = this.backend.current;
    assert(
      backend !== null,
      this.formatLog(
        'getWindow',
        'The DOM backend is not loaded. Make sure you call this method after it has loaded. ' +
          'You sould use @formidable-webview/ersatz-testing for that purpose.'
      )
    );
    return backend!.getWindow();
  }

  getDocument() {
    const backend = this.backend.current;
    assert(
      backend !== null,
      this.formatLog(
        'getDocument',
        'The DOM backend is not loaded. Make sure you call this method after it has loaded. ' +
          'You sould use @formidable-webview/ersatz-testing for that purpose.'
      )
    );
    return backend!.getDocument() as D;
  }

  render() {
    const {
      containerStyle,
      contentInset,
      contentInsetAdjustmentBehavior,
      decelerationRate,
      directionalLockEnabled,
      overScrollMode,
      scrollEnabled,
      showsHorizontalScrollIndicator,
      showsVerticalScrollIndicator,
      onScroll
    } = this.props;
    const webViewContainerStyle = [styles.container, containerStyle];
    return (
      <ScrollView
        ref={this.scrollview}
        contentInset={contentInset}
        contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
        decelerationRate={decelerationRate}
        contentContainerStyle={styles.webViewWrapper}
        overScrollMode={overScrollMode as any}
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        directionalLockEnabled={directionalLockEnabled}
        onScroll={onScroll as any}
        testID="skeletton"
        style={webViewContainerStyle}>
        <BackendRenderer ref={this.backend} {...this.props} />
      </ScrollView>
    );
  }
}

Skeletton.defaultProps = {
  javaScriptEnabled: true
};
