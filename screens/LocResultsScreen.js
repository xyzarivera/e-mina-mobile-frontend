import React, {useState, useEffect} from 'react';
import {StyleSheet, useColorScheme, FlatList, Button} from 'react-native';
import {
  HStack,
  View,
  Pressable,
  Text,
  Image,
  NativeBaseProvider,
} from 'native-base';
import {locResultsByMedia} from '../data/data';

function LocResultsScreen({route, navigation}) {
  /*Get the params */
  const {name, mediaId, description} = route.params;
  const isDarkMode = useColorScheme() === 'dark';

  const [DATA, setDATA] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      const data = await locResultsByMedia(mediaId);
      setDATA(data);
    }
    fetchData();
  }, []);

  //List Item Component
  const Item = ({name, fullItem}) => (
    <NativeBaseProvider>
      <View style={styles.item} rounded="xl">
        <Pressable
          rounded="xl"
          onPress={() => navigation.navigate('Location', {fullItem})}>
          <HStack
            style={styles.container}
            space={5}
            justifyContent="space-between">
            <Image
              border={1}
              borderWidth={3}
              borderColor="white"
              height={100}
              borderRadius={100}
              source={{
                uri: fullItem.location_pic,
              }}
              alt="Media Image"
              size="md"
              ml="2.5"
            />
            <Text
              fontSize="2xl"
              lineHeight="sm"
              color="white"
              isTruncated
              maxW="200"
              w="80%"
              multiline={true}
              numberOfLines={3}>
              {name}
            </Text>
          </HStack>
        </Pressable>
      </View>
    </NativeBaseProvider>
  );

  // Process each item of the data array
  const renderItem = ({item}) => (
    //JSON.parse(item['Media id']).includes(mediaId) ? <Item name={item.Name} fullItem={item} /> : null
    <Item name={item.name} fullItem={item} />
  );

  const renderHeader = () => (
    <View style={styles.media} rounded="xl">
      <Text
        fontSize="3xl"
        isTruncated
        textAlign="left"
        multiline={true}
        numberOfLines={3}>
        <Text bold>{name}</Text>
      </Text>
      <Text
        fontSize="lg"
        textAlign="justify">
        {description}
      </Text>
    </View>
  );

  return (
    <View
      style={styles.container}
      style={{
        backgroundColor: isDarkMode ? '#000' : '#fff',
        flex: 1,
      }}>  
      <FlatList
        data={DATA}
        ListHeaderComponent={renderHeader} 
        renderItem={renderItem}>
      </FlatList>
    </View>
  );
}

export default LocResultsScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  media: {
    backgroundColor: '#e6e9ed',
    padding: 20,
    marginVertical: 2,
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: '#3b81f6',
    padding: 20,
    marginVertical: 2,
    marginHorizontal: 16,
  },
});
