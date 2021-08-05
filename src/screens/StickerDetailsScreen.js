import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import colors from "../assets/styles/colors";
import AsyncStorage from "@react-native-community/async-storage";
const SAVED_ITEMS = "saved_item";
import Toast from "react-native-root-toast";

export class StickerDetailsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      isFavorite: this.props.navigation.state.params.iSFAVORITE,
      stickerId: this.props.navigation.state.params.STICKER_ID,
      stickerUrl: this.props.navigation.state.params.STICKER_URL,
      stickerTitle: this.props.navigation.state.params.STICKER_TITLE,
      stickerRating: this.props.navigation.state.params.STICKER_RATING,
      stickerUserInfo: this.props.navigation.state.params.STICKER_USERINFO,
      stickerSize:
        this.props.navigation.state.params.STICKER_IMAGES.original.size,
      stickerHeight:
        this.props.navigation.state.params.STICKER_IMAGES.downsized.height,
      stickerWidth:
        this.props.navigation.state.params.STICKER_IMAGES.downsized.width,
      savedItems: [],
      userProfileUrl: this.props.navigation.state.params.USER_URL,

      stickerFrames:
        this.props.navigation.state.params.STICKER_IMAGES.original.frames,
      dbSize: this.props.navigation.state.params.DBSIZE,
    };
  }

  //-------------------------------------------------Screen Header-------------------------------------------------
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Sticker",
      headerTitleStyle: {
        fontWeight: "600",
        fontSize: 22,
        color: "black",
      },
      headerStyle: {
        backgroundColor: "#fff",
      },
    };
  };

  componentDidMount = () => {};

  _addSavedItem = async () => {
    if (this.state.dbSize < 5) {
      this.setState({
        isFavorite: true,
      });
      var newItem = {};
      newItem.id = this.state.stickerId;
      var retrivedSavedItem = await AsyncStorage.getItem(SAVED_ITEMS);
      var items = [];
      if (retrivedSavedItem != null) {
        items = JSON.parse(retrivedSavedItem);
      }
      items = items.concat(newItem);
      AsyncStorage.setItem(SAVED_ITEMS, JSON.stringify(items));
    } else {
      Toast.show("You can only save 5 Stickers", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }
  };

  _removeSavedItem = async () => {
    this.setState({
      isFavorite: false,
    });
    var retrivedSavedItem = await AsyncStorage.getItem(SAVED_ITEMS);
    var items = [];
    if (retrivedSavedItem != null) {
      items = JSON.parse(retrivedSavedItem);
      let newItems = items.filter((item) => item.id !== this.state.stickerId);
      AsyncStorage.removeItem(SAVED_ITEMS);
      AsyncStorage.setItem(SAVED_ITEMS, JSON.stringify(newItems));
    }
  };

  render() {
    return (
      <View>
        {this.state.loading ? (
          <ActivityIndicator size="large" color="red" />
        ) : (
          <ScrollView>
            <View style={styles.main_container}>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#eee",
                    marginLeft: 16,
                    marginTop: 10,
                  }}
                >
                  {this.state.stickerTitle}
                </Text>
                <Image
                  resizeMode="contain"
                  source={{
                    uri: this.state.stickerUrl,
                  }}
                  style={{ width: "100%", height: 300, alignSelf: "center" }}
                ></Image>

                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 16,
                    marginLeft: 16,
                    justifyContent: "space-between",
                  }}
                >
                  {this.state.stickerUserInfo ? (
                    <View style={{ flexDirection: "row" }}>
                      <View style={{ width: 50, height: 50 }}>
                        {this.state.userProfileUrl === "" ? (
                          <Image
                            source={require("../assets/images/img_defult.png")}
                            style={{
                              width: "80%",
                              height: "80%",
                              tintColor: "#eee",
                            }}
                          ></Image>
                        ) : (
                          <Image
                            source={{
                              uri: this.state.userProfileUrl,
                            }}
                            style={{ width: "100%", height: "100%" }}
                          ></Image>
                        )}
                      </View>
                      <View
                        style={{
                          flexDirection: "column",
                          marginLeft: 10,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            color: "black",
                            fontWeight: "bold",
                          }}
                        >
                          {this.state.stickerUserInfo
                            ? this.state.stickerUserInfo.display_name
                            : ""}
                          ,
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                          <Text style={{ fontSize: 13, color: "#ccc" }}>
                            {this.state.stickerUserInfo
                              ? this.state.stickerUserInfo.username
                              : ""}
                          </Text>
                          {this.state.stickerUserInfo.is_verified ? (
                            <Image
                              source={require("../assets/images/img_verify.png")}
                              style={{
                                width: 15,
                                height: 15,
                                marginLeft: 8,
                                marginTop: 2,
                              }}
                            />
                          ) : null}
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View />
                  )}

                  {this.state.isFavorite ? (
                    <TouchableOpacity
                      onPress={this._removeSavedItem.bind(this)}
                    >
                      <Image
                        source={require("../assets/images/img_fill_heart.png")}
                        style={{
                          width: 30,
                          height: 30,
                          marginRight: 16,
                          tintColor: "red",
                        }}
                      ></Image>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={this._addSavedItem.bind(this)}>
                      <Image
                        source={require("../assets/images/img_heart.png")}
                        style={{
                          width: 30,
                          height: 30,
                          marginRight: 16,
                        }}
                      ></Image>
                    </TouchableOpacity>
                  )}
                </View>

                <Text
                  style={{
                    fontSize: 13,
                    color: "#696969",
                    marginTop: 15,
                    marginLeft: 16,
                  }}
                >
                  Description
                </Text>

                <View style={{ flexDirection: "row", marginLeft: 16 }}>
                  <Text style={{ fontSize: 13, marginTop: 10, color: "black" }}>
                    Size:{" "}
                  </Text>
                  <Text style={{ fontSize: 13, marginTop: 10, color: "black" }}>
                    {this.state.stickerSize}
                  </Text>
                </View>

                <View
                  style={{ flexDirection: "row", marginTop: 5, marginLeft: 16 }}
                >
                  <Text style={{ fontSize: 13, color: "black" }}>
                    Dimensions:{" "}
                  </Text>
                  <Text style={{ fontSize: 13, color: "black" }}>
                    {this.state.stickerHeight} x {this.state.stickerWidth}
                  </Text>
                </View>

                <View
                  style={{ flexDirection: "row", marginTop: 5, marginLeft: 16 }}
                >
                  <Text style={{ fontSize: 13, color: "black" }}>Frames: </Text>
                  <Text style={{ fontSize: 13, color: "black" }}>
                    {this.state.stickerFrames}
                  </Text>
                </View>

                <View
                  style={{ flexDirection: "row", marginTop: 5, marginLeft: 16 }}
                >
                  <Text style={{ fontSize: 13, color: "black" }}>Rating: </Text>
                  <Text style={{ fontSize: 13, color: "black" }}>
                    {this.state.stickerRating}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  main_container: {
    justifyContent: "flex-start",
  },
  image_View: {
    width: "100%",
    height: 200,
  },
  text_view: {
    padding: 10,
  },
});
