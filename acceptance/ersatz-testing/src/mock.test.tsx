jest.mock('react-native-webview');
import * as React from 'react';
import { waitForWindow } from '@formidable-webview/ersatz-testing';
import { render } from '@testing-library/react-native';
import { default as WebView, WebViewProps } from 'react-native-webview';

const MyComponent = ({ source }: Pick<WebViewProps, 'source'>) => (
  <WebView source={source} injectedJavaScript={'window.awesomeGlobal = 1;'} />
);

describe('MyComponent', () => {
  it('should make awesomeGlobal available to window with value “1”', async () => {
    const window = await waitForWindow(
      render(<MyComponent source={{ html: '<div></div>' }} />)
    );
    expect(window.awesomeGlobal).toEqual(1);
  });
});
