import { webViewLifecycle } from '@formidable-webview/skeletton';
import { useEffect } from 'react';
import { getEventBase } from '../shared';
import { WebBackendState } from '../types';

export function useMessageEffect({
  domHandlers,
  frameId,
  instanceId,
  messagingEnabled,
  ownerOrigin,
  uri
}: WebBackendState) {
  useEffect(
    function messageEffect() {
      function handleMessage({ data, origin }: MessageEvent) {
        data &&
          data.frameId === frameId &&
          data.instanceId === instanceId &&
          ownerOrigin === origin &&
          webViewLifecycle.handlePostMessage(
            domHandlers,
            getEventBase(uri),
            data.message
          );
      }
      if (messagingEnabled) {
        window.addEventListener('message', handleMessage);
      }
      return () => {
        if (messagingEnabled) {
          window.removeEventListener('message', handleMessage);
        }
      };
    },
    [domHandlers, frameId, ownerOrigin, uri, instanceId, messagingEnabled]
  );
}
