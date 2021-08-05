import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, StatusBar } from "react-native";

import {
  createStackNavigator,
  createDrawerNavigator,
  createSwitchNavigator,
  createAppContainer,
} from "react-navigation";
import colors from "./src/assets/styles/colors";
import { StickerDetailsScreen } from "./src/screens/StickerDetailsScreen";
import { StickerListScreen } from "./src/screens/StickerListScreen";

const MyScreensNavigator = createStackNavigator(
  {
    List: StickerListScreen,
    Details: StickerDetailsScreen,
  },
  {
    headerMode: "screen",
  }
);

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      Screens: MyScreensNavigator,
    },
    {
      initialRouteName: "Screens",
    }
  )
);

export default class App extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar
          backgroundColor={colors.statusBar}
          barStyle="light-content"
        />
        <AppContainer />
      </View>
    );
  }
}
