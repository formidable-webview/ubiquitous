import 'react-native-gesture-handler';
import Constants from 'expo-constants';
import React from 'react';
import { Button, Dimensions, StyleSheet, View } from 'react-native';
import { VisualTest, VisualTestProps } from './src/VisualTest';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FlatList } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

function makeHTMPageOf(body: string) {
  return {
    html: `
  <!doctype html>
  <html lang="en" dir="ltr">
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <style>
  body {
    margin: 10px;
    background-color: yellow;
  }
  </style>
  <body>${body}</body>
  </html>
  `
  };
}

const width = Math.min(Dimensions.get('window').width, 880);
const examples: VisualTestProps[] = [
  {
    title: 'HTML in ScrollView',
    description:
      'The WebView should be comprised of a red box inside of a yellow box. It should have a height and width of 320. There should be a text node right after the WebView.',
    source: makeHTMPageOf(
      '<div style="height:300px;background-color:red;color: black;"></div>'
    ),
    webViewStyle: {
      height: 320,
      width: 320
    },
    scrollView: true
  },
  {
    title: 'HTML in View',
    description:
      'The WebView should be comprised of a red box inside of a yellow box. The red box should be a square with height and width of 300. The yellow box (the body) should span through all the remaining space before the bottom text node.',
    source: makeHTMPageOf(
      '<div style="height:300px;background-color:red;color: black;"></div>'
    ),
    webViewStyle: {
      height: 320,
      width: 320
    },
    scrollView: false
  },
  {
    title: 'HTML in View with no width',
    description:
      'The WebView should not be invisible, though occupying all the space available between the two text nodes.',
    source: makeHTMPageOf(
      '<div style="height:300px;background-color:red;color: black;"></div>'
    ),
    webViewStyle: {
      height: 320
    },
    scrollView: false
  },
  {
    title: 'HTML in View with width only',
    description:
      'The WebView should expand to all the space available between the two text nodes.',
    source: makeHTMPageOf(
      '<div style="height:300px;background-color:red;color: black;"></div>'
    ),
    webViewStyle: {
      width: 320
    },
    scrollView: false
  },
  {
    title: 'Embedded Youtube in ScrollView',
    description:
      'The WebView should be comprised of a Youtube video. It should have a width equal to the minimum between device width and 880px. There should be a text node right after the WebView.',
    source: {
      uri: 'https://www.youtube.com/embed/XBPjVzSoepo'
    },
    webViewStyle: {
      height: (width * 9) / 16,
      width
    },
    scrollView: true
  },
  {
    title: 'Embedded Youtube in View',
    description:
      'The WebView should be comprised of a Youtube video. The Youtube video height should occupy all the space available until the bottom text node, and the width should be the minimum between device width and 880px.',
    source: {
      uri: 'https://www.youtube.com/embed/XBPjVzSoepo'
    },
    webViewStyle: {
      height: (width * 9) / 16,
      width
    },
    scrollView: false
  }
];

function HomeScreen() {
  const navigation = useNavigation();
  return (
    <FlatList
      data={examples}
      keyExtractor={(e) => e.title}
      renderItem={({ item: e }) => (
        <View style={styles.button}>
          <Button
            title={e.title}
            onPress={() => navigation.navigate(e.title)}
          />
        </View>
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
}

export default function App() {
  return (
    <View style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          {examples.map((e) => (
            <Stack.Screen key={e.title} name={e.title}>
              {() => <VisualTest {...e} />}
            </Stack.Screen>
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    flexShrink: 0,
    marginTop: Constants.statusBarHeight
  },
  button: {
    margin: 5
  },
  listContainer: {
    alignItems: 'stretch',
    paddingTop: 5,
    maxWidth: 350,
    alignSelf: 'center'
  }
});
