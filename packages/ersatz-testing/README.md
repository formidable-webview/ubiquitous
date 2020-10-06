[![npm](https://img.shields.io/npm/v/@formidable-webview/ersatz-testing)](https://www.npmjs.com/package/@formidable-webview/ersatz-testing)
[![CI](https://github.com/formidable-webview/ersatz/workflows/ersatz-testing/badge.svg?branch=master)](https://github.com/formidable-webview/ersatz/actions?query=branch%3Amaster+workflow%3Aersatz-testing)

# @formidable-webview/ersatz-testing

:rocket: Test React Native `WebViews` with
[`@testing-library/react-native`](https://www.npmjs.com/package/@testing-library/react-native),
[`jest`](https://www.npmjs.com/package/jest) and
[`@formidable-webview/ersatz`](https://www.npmjs.com/package/@formidable-webview/ersatz) (written in Typescript :blue_heart:)

## Installation

Assuming you already have [`jest`](https://github.com/facebook/jest#readme) and
[`react-test-renderer`](https://www.npmjs.com/package/react-test-renderer)
installed:

```sh
npm install -D @testing-library/react-native \
               @formidable-webview/ersatz \
               @formidable-webview/ersatz-testing
```

## Basic Usage

`Ersatz` is the component mimicking `WebView` behaviors. In the snippet bellow,
`MyComponent` explicitly depends on `Ersatz`. Of course, this does not reflect
real use cases which will be laid out later, but it is relevant for the purpose
of learning.

```ts
// ../../acceptance/ersatz-testing/src/basic.test.tsx

import * as React from 'react';
import Ersatz from '@formidable-webview/ersatz';
import { waitForWindow } from '@formidable-webview/ersatz-testing';
import { render } from '@testing-library/react-native';
import { WebViewProps } from 'react-native-webview';

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

```

## Usage With Jest Mocks

Now, lets dive into a more realistic situation where `MyComponent` depends on
`WebView` directly. The two steps to get it work:

1. Create `config/__mocks__/react-native-webview.js` file.
2. Add `jest.mock('react-native-webview');` at the top of my test file.

More information on [jest manual mocks here](https://jestjs.io/docs/en/manual-mocks).
The resulting files:

```ts
// ../../acceptance/ersatz-testing/config/__mocks__/react-native-webview.js

import Ersatz from '@formidable-webview/ersatz';
export default Ersatz;

```

```ts
// ../../acceptance/ersatz-testing/src/mock.test.tsx

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

```

And *voila*!
