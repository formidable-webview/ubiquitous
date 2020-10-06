import * as React from 'react';
import Ersatz from '@formidable-webview/ersatz';
import makeErsatzTesting from '@formidable-webview/ersatz-testing';
import { render } from '@testing-library/react-native';
import { WebViewProps } from 'react-native-webview';

const { waitForWindow } = makeErsatzTesting(Ersatz);

const MyComponent = ({ source }: Pick<WebViewProps, 'source'>) => (
  <Ersatz source={source} injectedJavaScript={'window.awesomeGlobal = 1;'} />
);

describe('MyComponent', () => {
  it('should make awesomeGlobal available to window with value “1”', async () => {
    const window = await waitForWindow(
      render(<MyComponent source={{ html: '<div></div>' }} />)
    );
    expect(window.awesomeGlobal).toEqual(1);
  });
});
