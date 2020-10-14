import React from 'react';
import { useEffect, useState, ReactElement } from 'react';
import fetch from 'node-fetch';
import {
  WebViewSource,
  WebViewSourceUri
} from 'react-native-webview/lib/WebViewTypes';
import { View } from 'react-native';
import { webViewLifecycle } from '@formidable-webview/skeletton';
import { WebViewProps } from 'react-native-webview';

export type SourceLoaderPropsBase = Pick<
  WebViewProps,
  'source' | 'renderLoading' | 'renderError' | 'onHttpError'
>;

export interface SourceLoaderProps extends SourceLoaderPropsBase {
  children: (source: NormalSource) => ReactElement;
  cancelled: boolean;
}

export interface NormalSource {
  html: string;
  url: string;
}

function isSourceUri(source: WebViewSource): source is WebViewSourceUri {
  return !!(source as any).uri ?? false;
}

function isWebViewSource(source: unknown): source is WebViewSource {
  return source != null
    ? typeof source === 'object' &&
        (typeof (source as any).uri === 'string' ||
          typeof (source as any).html === 'string')
    : false;
}

export function SourceLoader({
  source,
  children,
  renderLoading,
  renderError,
  onHttpError,
  cancelled
}: SourceLoaderProps) {
  const [normalizedSource, setNormalizedSource] = useState<NormalSource | null>(
    null
  );
  const [errorReason, setErrorReason] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    if (!isWebViewSource(source)) {
      setNormalizedSource({ url: '', html: '' });
      return;
    }
    if (isSourceUri(source)) {
      const { uri, headers, method, body } = source;
      async function fetchSource() {
        const response = await fetch(uri, {
          body,
          method,
          headers: headers as any
        });
        if (response.ok) {
          return response.text() as Promise<string>;
        } else {
          const description = await response.text();
          webViewLifecycle.handleHttpError(
            onHttpError,
            description,
            response.status,
            uri
          );
          throw new Error(description);
        }
      }
      fetchSource()
        .then(
          (html) =>
            isSubscribed &&
            setNormalizedSource({ html: html as string, url: uri })
        )
        .catch((description) => isSubscribed && setErrorReason(description));
    } else {
      setNormalizedSource({ html: source.html, url: source.baseUrl ?? '' });
    }
    return () => {
      isSubscribed = false;
    };
  }, [source, cancelled, onHttpError]);
  const errorElement = errorReason ? (
    <View testID="ersatz-error">
      {typeof renderError === 'function' &&
        renderError(undefined, 0, errorReason)}
    </View>
  ) : null;
  const content = errorReason
    ? errorElement
    : normalizedSource
    ? children(normalizedSource)
    : typeof renderLoading === 'function'
    ? renderLoading()
    : null;
  return <View testID="ersatz-source-loader">{content}</View>;
}
