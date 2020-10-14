import React from 'react';
import { useEffect, useState, ReactElement } from 'react';
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
  renderError?: (reason: string) => ReactElement;
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
      const retainedHeaders = new Headers(headers as any);
      async function fetchSource() {
        const response = await fetch(uri, {
          body,
          method,
          mode: 'no-cors',
          headers: retainedHeaders
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
  const content =
    errorReason && typeof renderError === 'function'
      ? renderError(errorReason)
      : normalizedSource
      ? children(normalizedSource)
      : typeof renderLoading === 'function'
      ? renderLoading()
      : null;
  return <View testID="web-source-loader">{content}</View>;
}
