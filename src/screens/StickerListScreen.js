import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import colors from "../assets/styles/colors";
import AsyncStorage from "@react-native-community/async-storage";
import Toast from "react-native-root-toast";
import SearchHeader from "react-native-search-header";
import NetInfo from "@react-native-community/netinfo";

const SAVED_ITEMS = "saved_item";

export class StickerListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      stickerList: [],
      stickerDatabaseList: [],
      dataSourceOfSticker: [],
      pageNo: 0,
      pageSize: 50,
      isLoadingItems: false,
      isNoMoreStickerToLoad: false,
      searchText: "",
      searchHeader: null,
      connection_state: "",
      isConnected: false,
    };
  }

  static navigationOptions = {
    //To hide the ActionBar/NavigationBar
    header: null,
  };

  componentDidMount() {
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this._handleConnectivityChange
    );
    NetInfo.isConnected.fetch().done((isConnected) => {
      if (isConnected == true) {
        this.setState({
          loading: true,
          connection_state: "Online",
          isConnected: true,
        });
        this._retrivedItemFromDatabase();
      } else {
        Toast.show("No Internet Connection..!!", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        });
      }
    });

    //When Screen Focused
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.setState({
          loading: true,
          dataSourceOfService: [],
        });
        this._retrivedItemFromDatabase();
      }
    );
  }

  //----------------------------------------------Checking networkConnection----------------------------------------
  _handleConnectivityChange = (isConnected) => {
    if (isConnected == true) {
      this.setState({ connection_state: "Online" });
    } else {
      this.setState({ connection_state: "Offline" });
      Toast.show("No Internet Connection..!!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }
  };

  componentWillUnmount() {
    //Remove Focus Subscription
    this.willFocusSubscription.remove();
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this._handleConnectivityChange
    );
  }

  _getStickersFromServer() {
    if (this.state.isConnected == true) {
      fetch(
        "https://api.giphy.com/v1/stickers/trending?api_key=rvGi16RLXHB1DzQo0chJ84oFnHHUm3bV" +
          "&limit=" +
          this.state.pageSize +
          "&offset=" +
          this.state.pageNo,
        {
          method: "GET",
          headers: {
            authorization: "1",
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => response.json())
        .then((responseJson) => {
          console.log("responseJson...." + responseJson);
          if (
            responseJson.meta.status === 200 &&
            responseJson.meta.msg === "OK"
          ) {
            console.log("image...." + responseJson.data[0].url);

            this.setState(
              (state) => ({
                loading: false,
                stickerList: [...state.stickerList, ...responseJson.data],
                isLoadingItems: false,
                isNoMoreStickerToLoad:
                  this.state.pageNo > 0 && responseJson.data.length != 50,
              }),
              () => {
                this._createArrayForList();
              }
            );
            if (this.state.pageNo > 0 && responseJson.data.length != 50) {
              this.setState({
                loading: false,
              });
            }
          } else {
            this.setState({
              loading: false,
            });
            Toast.show("Something went wrong...", {
              duration: Toast.durations.SHORT,
              position: Toast.positions.BOTTOM,
              shadow: true,
              animation: true,
              hideOnPress: true,
              delay: 0,
            });
          }
        })

        .catch(function (error) {
          Toast.show("Something went wrong...", {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
          });
        });
    } else {
      this.setState({ connection_state: "Offline" });
      Toast.show("No Internet Connection..!!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }
  }

  _retrivedItemFromDatabase = async () => {
    console.log("_retrivedItemFromDatabase", "inside");

    var list = await AsyncStorage.getItem(SAVED_ITEMS);
    console.log("_retrivedItemFromDatabase", "inside");
    console.log("_retrivedDbList", list);

    if (list !== null) {
      var parseItemArray = JSON.parse(list);
      console.log("parseItemArray", list);

      this.setState({
        stickerDatabaseList: parseItemArray,
      });
    }

    this._getStickersFromServer();
  };

  _createArrayForList = () => {
    var tempItemArray = [];
    this.state.stickerList.map((item) => {
      tempItemArray.push({
        id: item.id,
        url: item.images.original.url,
        title: item.title,
        rating: item.rating,
        images: item.images,
        userInfo: item.user,
        isFavorite: false,
      });
    });

    this.state.stickerDatabaseList.map((item) => {
      tempItemArray.map((list) => {
        console.log("stkid", list.id);
        console.log("itmid", item.id);
        if (item.id === list.id) {
          console.log("idi", item.id);

          list.isFavorite = true;
        }
      });
    });

    this.setState({
      dataSourceOfSticker: tempItemArray,
    });
  };

  _removeSavedItem = async (itemId) => {
    var retrivedSavedItem = await AsyncStorage.getItem(SAVED_ITEMS);
    var items = [];
    if (retrivedSavedItem != null) {
      let tempUpdateArr = [];
      tempUpdateArr = this.state.dataSourceOfSticker;
      tempUpdateArr.map((item) => {
        if (item.id === itemId) {
          item.isFavorite = false;
        }
      });
      this.setState({
        dataSourceOfSticker: tempUpdateArr,
      });
      items = JSON.parse(retrivedSavedItem);
      let newItems = items.filter((item) => item.id !== itemId);
      AsyncStorage.removeItem(SAVED_ITEMS);
      AsyncStorage.setItem(SAVED_ITEMS, JSON.stringify(newItems));
      var databaseItem = this.state.stickerDatabaseList.filter(
        (item) => item.id !== itemId
      );
      this.setState({
        stickerDatabaseList: databaseItem,
      });
    }
  };

  _addSavedItem = async (itemId) => {
    if (this.state.stickerDatabaseList.length < 5) {
      var tempUpdateArr = [];
      tempUpdateArr = this.state.dataSourceOfSticker;
      tempUpdateArr.map((item) => {
        if (item.id === itemId) {
          item.isFavorite = true;
        }
      });
      this.setState({
        dataSourceOfSticker: tempUpdateArr,
      });
      var newItem = {};
      newItem.id = itemId;

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

  _searchMatchingItemsCall = (text) => {
    if (this.state.isConnected == true) {
      fetch(
        "https://api.giphy.com/v1/stickers/search?api_key=rvGi16RLXHB1DzQo0chJ84oFnHHUm3bV" +
          "&q=" +
          text +
          "&limit=" +
          this.state.pageSize +
          "&offset=" +
          this.state.pageNo,
        {
          method: "GET",
          headers: {
            authorization: "1",
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => response.json())
        .then((responseJson) => {
          console.log("responseJson...." + responseJson);
          if (
            responseJson.meta.status === 200 &&
            responseJson.meta.msg === "OK"
          ) {
            this.setState(
              (state) => ({
                loading: false,
                stickerList: [...state.stickerList, ...responseJson.data],
                isLoadingItems: false,
                isNoMoreStickerToLoad:
                  this.state.pageNo > 0 && responseJson.data.length != 50,
              }),
              () => {
                this._createArrayForList();
              }
            );
            if (this.state.pageNo > 0 && responseJson.data.length != 50) {
              this.setState({
                loading: false,
              });
            }
          } else {
            this.setState({
              loading: false,
            });
            Toast.show("Something went wrong...", {
              duration: Toast.durations.SHORT,
              position: Toast.positions.BOTTOM,
              shadow: true,
              animation: true,
              hideOnPress: true,
              delay: 0,
            });
          }
        })

        .catch(function (error) {
          // Alert.alert('Warning!', 'Network error.');
        });
    } else {
      this.setState({ connection_state: "Offline" });
      Toast.show("No Internet Connection..!!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }
  };

  //--------------------------------------------Load More Items In FlatList-------------------------
  _loadMoreItem = () => {
    console.log("insideLoadMoreItem");
    console.log(
      "-----------------------------------------" +
        this.state.dataSourceOfSticker.length
    );

    if (
      this.state.isLoadingItems == false &&
      this.state.isNoMoreStickerToLoad == false
    ) {
      if (this.state.dataSourceOfSticker.length >= 50) {
        this.setState(
          {
            pageNo: this.state.pageNo + 50,
            isLoadingItems: true,
          },
          this._getStickersFromServer
        );
      }
    }
  };

  _renderItem = ({ item }) => {
    return (
      <TouchableHighlight
        style={{
          flexDirection: "column",
          height: 150,
          width: 160,
          marginTop: 5,
          marginBottom: 5,
          marginRight: 5,
          marginLeft: 5,
          borderRadius: 10,
          borderColor: "#fff",
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
        underlayColor={"#fff"}
      >
        <View>
          {item.isFavorite ? (
            <TouchableOpacity
              onPress={() => {
                this._removeSavedItem(item.id);
              }}
            >
              <Image
                source={require("../assets/images/img_fill_heart.png")}
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: "flex-end",
                  tintColor: "red",
                }}
              ></Image>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                this._addSavedItem(item.id);
              }}
            >
              <Image
                source={require("../assets/images/img_heart.png")}
                style={{ width: 20, height: 20, alignSelf: "flex-end" }}
              ></Image>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate("Details", {
                STICKER_ID: item.id,
                STICKER_URL: item.url,
                STICKER_TITLE: item.title,
                STICKER_RATING: item.rating,
                STICKER_IMAGES: item.images,
                STICKER_USERINFO: item.userInfo,
                iSFAVORITE: item.isFavorite,
                USER_URL: item.userInfo ? item.userInfo.avatar_url : "",
                DBSIZE: this.state.stickerDatabaseList.length,
              })
            }
          >
            <Image
              resizeMode="contain"
              source={{ uri: item.images.original.url }}
              style={{ width: 130, height: 120, marginTop: 2 }}
            ></Image>
          </TouchableOpacity>
        </View>
      </TouchableHighlight>
    );
  };

  //clear search Text
  _clearSearchText = () => {
    this.setState({ searchText: "" });
    this.setState(
      {
        dataSourceOfSticker: [],
        stickerList: [],
        isSearchingItem: false,
        loading: true,
      },

      this._getStickersFromServer
    );
  };

  // search text chaged
  _searchTextChanged = (text) => {
    this.setState({ searchText: text });
    if (text.nativeEvent.text === "") {
      this.setState(
        {
          dataSourceOfSticker: [],
          stickerList: [],
          loading: true,
        },
        this._getStickersFromServer
      );
    } else {
      this.setState(
        {
          dataSourceOfSticker: [],
          stickerList: [],

          loading: true,
        },
        this._searchMatchingItemsCall(text.nativeEvent.text)
      );
    }
  };

  _FlatListEmptyView = () => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {this.state.loading ? (
          <ActivityIndicator size="large" color="#3f51b" />
        ) : (
          <Text
            style={{ fontFamily: "montserrat", color: "gray", fontSize: 14 }}
          >
            Sticker not Available
          </Text>
        )}
      </View>
    );
  };

  //-------------------------------------------Footer View in FlatList---------------------------------------------
  _getListFooterComponent = () => {
    return this.state.isLoadingItems ? (
      <ActivityIndicator size="small" color="red" animating />
    ) : null;
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.label}> Stickers </Text>

          <TouchableWithoutFeedback
            onPress={() => {
              this.searchHeader.show();
            }}
            style={{ paddingRight: 16, flex: 30, marginTop: 8 }}
          >
            <Image
              source={require("../assets/images/ic_search.png")}
              style={{
                height: 23,
                width: 23,
                marginRight: 16,
                alignSelf: "center",
                tintColor: "black",
              }}
            />
          </TouchableWithoutFeedback>
        </View>
        <SearchHeader
          topOffset={0}
          headerHeight={56}
          dropShadowed={true}
          ref={(searchHeader) => {
            this.searchHeader = searchHeader;
          }}
          placeholder="Search..."
          placeholderColor="gray"
          iconColor="gray"
          iconImageComponents={[
            {
              name: `hide`,
              customStyle: {
                tintColor: "gray",
                width: 30,
                height: 30,
              },
            },
            {
              name: `close`,
              customStyle: {
                tintColor: "gray",
                marginRight: 16,
              },
            },
          ]}
          onClear={() => {
            this._clearSearchText();
          }}
          onEnteringSearch={(text) => {
            this._searchTextChanged(text);
          }}

          // onGetAutocompletions={async (text) => {
          // 	this._searchCustomer(text);
          // }}
        ></SearchHeader>

        {this.state.loading ? (
          <View
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <ActivityIndicator size="large" color="red" />
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <FlatList
              data={this.state.dataSourceOfSticker}
              style={{ paddingTop: 8, alignSelf: "center" }}
              showsVerticalScrollIndicator={false}
              horizontal={false}
              numColumns={2}
              renderItem={this._renderItem}
              ListEmptyComponent={this._FlatListEmptyView}
              onEndReachedThreshold={0.5}
              contentContainerStyle={{ flexGrow: 1 }}
              onEndReached={() => {
                this.state.isNoMoreStickerToLoad ? null : this._loadMoreItem();
              }}
              ListFooterComponent={this._getListFooterComponent}
              keyExtractor={(item, index) => index.toString()}
            ></FlatList>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  inner_container: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,

    paddingBottom: 10,
  },
  header: {
    width: "100%",
    height: 56,
    backgroundColor: colors.theme,
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#eee",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  label: {
    flex: 40,
    fontSize: 22,
    textAlign: `left`,
    marginVertical: 8,
    paddingVertical: 3,
    color: "black",
    backgroundColor: `transparent`,
    marginLeft: 16,
    fontWeight: "600",
  },
});
