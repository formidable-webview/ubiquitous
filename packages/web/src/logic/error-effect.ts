import { useEffect } from 'react';
import { WebBackendState } from '../types';

export function useErrorEffect({
  renderError,
  flagHasError,
  uri
}: WebBackendState) {
  useEffect(
    function mockError() {
      let isCancelled = false;
      if (renderError && uri) {
        const headers = new Headers({
          Accept: '*/*'
        });
        fetch(uri, {
          method: 'HEAD',
          headers: headers,
          mode: 'no-cors'
        }).catch(() => {
          if (!isCancelled) {
            flagHasError();
          }
        });
      }
      return () => {
        isCancelled = true;
      };
    },
    [renderError, flagHasError, uri]
  );
}
