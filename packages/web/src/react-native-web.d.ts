declare module 'react-native-web' {
  import type { createElement } from 'react';
  export const unstable_createElement: typeof createElement;
}
