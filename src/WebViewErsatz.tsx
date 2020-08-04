import React from 'react';
import { WebViewProps } from 'react-native-webview';
import { PureComponent, createRef } from 'react';

import { ScrollView } from 'react-native';
import { JSDOMBackend, JSDOMBackendHandle } from './JSDOMBackend';
import { SourceLoader, NormalSource } from './SourceLoader';

// startInLoadingState
// renderError
// javaScriptCanOpenWindowsAutomatically

export class WebViewErsatz extends PureComponent<WebViewProps> {
  static defaultProps: Partial<WebViewProps> = {
    javaScriptEnabled: true
  };
  private backend = createRef<JSDOMBackendHandle>();
  private scrollview = createRef<ScrollView>();

  private renderBackend = ({ html, url }: NormalSource) => {
    const {
      javaScriptEnabled,
      injectedJavaScript,
      injectedJavaScriptBeforeContentLoaded,
      userAgent,
      onMessage,
      onLoadStart,
      onLoad,
      onLoadEnd,
      onLoadProgress,
      onNavigationStateChange
    } = this.props;
    return (
      <JSDOMBackend
        javaScriptEnabled={javaScriptEnabled}
        injectedJavascript={injectedJavaScript}
        injectedJavaScriptBeforeContentLoaded={
          injectedJavaScriptBeforeContentLoaded
        }
        html={html}
        url={url}
        userAgent={userAgent}
        ref={this.backend}
        domHandlers={{
          onMessage,
          onLoadStart,
          onLoad,
          onLoadEnd,
          onLoadProgress,
          onNavigationStateChange
        }}
      />
    );
  };

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
    this.backend.current?.injectJavascript(script);
  }

  requestFocus() {
    console.warn('WebViewErsatz: requestFocus not Implemented');
  }

  getWindow<W extends {} = {}>(): W | undefined {
    return this.backend.current?.getWindow<W>();
  }

  getDocument<D extends {} = {}>(): D | undefined {
    return this.backend.current?.getDocument<D>();
  }

  render() {
    const {
      source,
      onHttpError,
      containerStyle,
      renderLoading,
      style,
      decelerationRate,
      contentInset,
      contentInsetAdjustmentBehavior
    } = this.props;
    const sourceLoader = source ? (
      <SourceLoader
        children={this.renderBackend}
        renderLoading={renderLoading}
        onHttpError={onHttpError}
        source={source}
        cancelled={false}
      />
    ) : null;
    return (
      <ScrollView
        ref={this.scrollview}
        contentInset={contentInset}
        contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
        decelerationRate={decelerationRate}
        contentContainerStyle={containerStyle}
        style={style}>
        {sourceLoader}
      </ScrollView>
    );
  }
}
