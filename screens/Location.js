import React from 'react';
import {View, Button, StyleSheet, useColorScheme} from 'react-native';
import {
  Heading,
  Text,
  VStack,
  ZStack,
  Box,
  Image,
  Center,
  NativeBaseProvider,
  useColorModeValue,
} from 'native-base';
// import MapView from 'react-native-maps';

function Location({route, navigation}) {
  /*Get the params */
  const {fullItem, cameFrom} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  console.log(fullItem);
  console.log(cameFrom);
  return (
    //   <View
    //   style={{
    //     backgroundColor: isDarkMode ? '#000' : '#fff',
    //   }}>
    //     <Text>Detailed Location Info</Text>
    //     <Text>{fullItem.name}</Text>
    //     <Text>{fullItem._id}</Text>
    //     <Text>{fullItem.plus_code}</Text>
    //     <Button title="Go back" onPress={() => navigation.goBack()} />
    // </View>
    <NativeBaseProvider>
      <Center flex={1} px="3">
        <View
          style={{
            backgroundColor: isDarkMode ? '#000' : '#fff',
            flex: 1,
            padding: 20,
          }}>
          <Heading textAlign="center">{fullItem.name}</Heading>
          <Center flex={1} px="3">
            <Image
              size={150}
              resizeMode={'contain'}
              borderRadius={100}
              source={{
                uri: fullItem.location_pic,
              }}
              alt="Alternate Text"
            />
          </Center>
          <View style={{flex: 4}}>
            <Box
              width={72}
              bg={useColorModeValue('gray.50', 'gray.700')}
              shadow={1}>
              <VStack
                space={1}
                alignItems="center"
                justifyItems="center"
                mt={3}>
                {/* <Heading textAlign="center">{fullItem.name}</Heading> */}
                {/* <Text>{fullItem.description}</Text> */}
                <Text fontSize="lg">Details:</Text>
                <Text textAlign="center">{fullItem.coordinates}</Text>
                <Text textAlign="center" padding="3">
                  {fullItem.description}
                </Text>
                <Text>{fullItem['Plus Code']}</Text>
                <Button title="Go back" onPress={() => navigation.goBack()} />
              </VStack>
            </Box>
          </View>
          {/* <MapView
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          /> */}
        </View>
      </Center>
    </NativeBaseProvider>
  );
}

export default Location;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     //marginTop: StatusBar.currentHeight || 0,
//   },
//   item: {
//     backgroundColor: '#f9c2ff',
//     padding: 20,
//     marginVertical: 8,
//     marginHorizontal: 16,
//   },
//   name: {
//     fontSize: 32,
//   },
// });
