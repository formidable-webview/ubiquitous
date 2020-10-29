import * as React from 'react';
import { render } from '@testing-library/react-native';
import { IframWebView } from '../IframeWebView';

describe('IframeWebView component', () => {
  it('should render', async () => {
    const { UNSAFE_getByType } = render(<IframWebView />);
    const iframe = UNSAFE_getByType(IframWebView);
    expect(iframe).toBeTruthy();
  });
});
