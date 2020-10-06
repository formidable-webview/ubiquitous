import { WebViewNativeEvent } from 'react-native-webview/lib/WebViewTypes';
import { NativeSyntheticEvent } from 'react-native';

type EventExtended<E extends WebViewNativeEvent> = Omit<
  E,
  keyof WebViewNativeEvent
>;

const dummyFalse = () => false;
const dummyVoid = () => {};

export function createNativeEvent<E extends WebViewNativeEvent>({
  ...other
}: EventExtended<E> & Partial<WebViewNativeEvent>): NativeSyntheticEvent<E> {
  return {
    bubbles: false,
    cancelable: false,
    currentTarget: 0,
    defaultPrevented: false,
    eventPhase: 0,
    isDefaultPrevented: dummyFalse,
    isPropagationStopped: dummyFalse,
    isTrusted: true,
    persist: dummyVoid,
    preventDefault: dummyVoid,
    stopPropagation: dummyVoid,
    target: 0,
    timeStamp: 0,
    type: '',
    nativeEvent: {
      canGoBack: false,
      canGoForward: false,
      loading: false,
      lockIdentifier: 1,
      title: '',
      url: '',
      ...other
    } as E
  };
}
