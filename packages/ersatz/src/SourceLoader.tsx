import React from 'react';
import { useEffect, useState, ReactElement } from 'react';
import fetch from 'node-fetch';
import {
  WebViewSource,
  WebViewSourceUri,
  WebViewHttpErrorEvent
} from 'react-native-webview/lib/WebViewTypes';
import { View } from 'react-native';
import { webViewLifecycle } from '@formidable-webview/skeletton';

export interface SourceLoaderProps {
  source?: WebViewSource;
  children: (source: NormalSource) => ReactElement;
  renderLoading?: () => ReactElement;
  onHttpError?: (event: WebViewHttpErrorEvent) => void;
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
  onHttpError,
  cancelled
}: SourceLoaderProps) {
  const [normalizedSource, setNormalizedSource] = useState<NormalSource | null>(
    null
  );

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
        }
      }
      fetchSource().then(
        (html) =>
          isSubscribed &&
          setNormalizedSource({ html: html as string, url: uri })
      );
    } else {
      setNormalizedSource({ html: source.html, url: source.baseUrl ?? '' });
    }
    return () => {
      isSubscribed = false;
    };
  }, [source, cancelled, onHttpError]);
  const content = normalizedSource
    ? children(normalizedSource)
    : typeof renderLoading === 'function'
    ? renderLoading()
    : null;
  return <View testID="ersatz-source-loader">{content}</View>;
}
