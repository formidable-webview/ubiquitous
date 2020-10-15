import React, { PropsWithChildren, useState } from 'react';
import { useMemo } from 'react';
import {
  StyleProp,
  ViewStyle,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import WebView, { WebViewProps } from 'react-native-webview';
// import WebView from 'react-native-web-webview';
import { WebViewSource } from 'react-native-webview/lib/WebViewTypes';

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flexGrow: 1,
    flexShrink: 0
  },
  testBox: {
    padding: 10,
    backgroundColor: 'black',
    width: '100%',
    alignItems: 'center'
  },
  testBoxTitle: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center'
  },
  testBoxText: {
    color: 'white',
    maxWidth: 750
  },
  testBoxDiagnostic: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    padding: 10
  },
  testBoxDiagnosticGood: {
    backgroundColor: 'green'
  },
  testBoxDiagnosticBad: {
    backgroundColor: 'red'
  }
});

export interface VisualTestProps {
  webViewStyle: StyleProp<ViewStyle>;
  source: WebViewSource;
  scrollView: boolean;
  description: string;
  title: string;
  containerStyle?: StyleProp<ViewStyle>;
  extraProps?: WebViewProps;
}

const script = `
window.ReactNativeWebView.postMessage("Hello world!");
`;

export const VisualTest = ({
  webViewStyle,
  containerStyle,
  source,
  scrollView,
  description,
  title,
  extraProps
}: VisualTestProps) => {
  const [hasMessage, setHasMessage] = useState(false);
  const Wrapper = useMemo(
    () =>
      scrollView
        ? ({ children }: PropsWithChildren<{}>) => (
            <ScrollView
              style={styles.container}
              contentContainerStyle={[styles.content]}
              children={children}
            />
          )
        : ({ children }: PropsWithChildren<{}>) => (
            <View
              style={[styles.container, styles.content]}
              children={children}
            />
          ),
    [scrollView]
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9c9c9c' }}>
      <Wrapper>
        <View
          style={[
            styles.testBoxDiagnostic,
            hasMessage
              ? styles.testBoxDiagnosticGood
              : styles.testBoxDiagnosticBad
          ]}>
          <Text style={styles.testBoxText}>
            Received message? {hasMessage ? 'Yes!' : 'No!'}
          </Text>
        </View>
        <View style={styles.testBox}>
          <Text style={styles.testBoxTitle}>Visual Test: {title}</Text>
          <Text style={styles.testBoxText}>{description}</Text>
        </View>
        <Text>Text before WebView!</Text>
        <WebView
          style={webViewStyle}
          containerStyle={containerStyle}
          source={source}
          originWhitelist={[]}
          onNavigationStateChange={(state) =>
            console.info('Navigation State Change', state)
          }
          injectedJavaScript={script}
          onMessage={({ nativeEvent: { data } }) =>
            setHasMessage(data === 'Hello world!')
          }
          {...extraProps}
        />
        <Text>Text after WebView!</Text>
      </Wrapper>
    </SafeAreaView>
  );
};
