import { forwardRef } from 'react';
import type {
  DOMBackendFunctionComponent,
  DOMBackendHandle,
  DOMBackendProps
} from '@formidable-webview/ersatz-core';
import React from 'react';
import { SourceLoader } from './SourceLoader';
import { JSDOMDOMEngine } from './JSDOMEngine';

export const JSDOMBackend: DOMBackendFunctionComponent = forwardRef<
  DOMBackendHandle,
  DOMBackendProps
>(({ renderLoading, onHttpError, source, ...props }: DOMBackendProps, ref) => {
  const renderBackend = React.useCallback(
    (normalizedSource) => (
      <JSDOMDOMEngine ref={ref} {...normalizedSource} {...props} />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...Object.values(props)]
  );
  return (
    <SourceLoader
      children={renderBackend}
      renderLoading={renderLoading}
      onHttpError={onHttpError}
      source={source}
      cancelled={false}
    />
  );
});
