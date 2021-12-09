import React, {useEffect, useState} from 'react';
import {
  Heading,
  Text,
  VStack,
  Box,
  Image,
  Center,
  NativeBaseProvider,
  AspectRatio,
  Stack,
  ScrollView,
  Button,
  FormControl,
  Modal,
  HStack,
  Input,
  FlatList,
  Pressable,
  ArrowBackIcon,
  ArrowForwardIcon,
} from 'native-base';
import {View, StyleSheet} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useAuth} from '../providers/AuthProvider';
import {
  getAsyncSavedLocations,
  updateAsyncSavedLocations,
} from '../data/asyncSavedLocations';
import {dynamicSavedLocationsApi, photosByLocation} from '../data/data';
import {cloneNode} from '@babel/types';

function Location({route, navigation}) {
  /*Get the params */
  const {fullItem} = route.params;
  const {location_pic, name, description} = fullItem;
  const locationId = fullItem._id;
  const coordsObj = eval('(' + fullItem['coordinates'] + ')');
  const {user} = useAuth();
  const [isLocationSaved, setIsLocationSaved] = useState(false);
  const [imageUri, setImageUri] = useState();
  const [dispImageUri, setDispImageUri] = useState();
  const [showModal, setShowModal] = useState(false);
  const [photoData, setPhotoData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [galleryRefresh, setGalleryRefresh] = useState(false);
  const [showSinglePhoto, setShowSinglePhoto] = useState(false);
  const [singlePhoto, setSinglePhoto] = useState();
  const [currentIndex, setCurrentIndex] = useState();
  const [photoDescription, setPhotoDescription] = useState();

  /** onClick function that saves location */
  const onSaveClick = () => {
    const fetchSaveData = async () => {
      const res = await dynamicSavedLocationsApi(user.id, fullItem, 'patch');
      console.log('save res', res);
      await updateAsyncSavedLocations(user.id);
      setIsLocationSaved(true);
    };
    setRefresh(!refresh);
    fetchSaveData();
  };

  /** onClick function that deletes location */
  const onDeleteClick = () => {
    const fetchDelData = async () => {
      const res = await dynamicSavedLocationsApi(user.id, fullItem, 'delete');
      console.log('delete res', res);
      await updateAsyncSavedLocations(user.id);
      setIsLocationSaved(false);
    };
    setRefresh(!refresh);
    fetchDelData();
  };

  /** load SavedLocations from AsyncStorage */
  useEffect(() => {
    async function fetchData() {
      try {
        const asyncSavedLocations = await getAsyncSavedLocations();
        const locationObject = asyncSavedLocations.find(
          location => location._id === fullItem._id,
        );
        if (locationObject !== undefined) {
          setIsLocationSaved(true);
        } else {
          setIsLocationSaved(false);
        }
      } catch (error) {
        throw error;
      }
    }
    fetchData();
  }, [refresh]);

  /** get user photos for this location */
  useEffect(() => {
    async function fetchData() {
      const data = await photosByLocation(locationId);
      setPhotoData(data);
    }
    fetchData();
  }, [galleryRefresh]);

  /** update photo url for singlePhoto modal */
  useEffect(() => {
    if (currentIndex !== undefined) {
      setSinglePhoto(photoData[`${currentIndex}`]['url']);
    }
  }, [currentIndex]);

  /** update photo url for singlePhoto modal */
  const handleClick = (event, url, item) => {
    setShowSinglePhoto(true);
    setSinglePhoto(url);
    let index = photoData.findIndex(x => x._id === item._id);
    setCurrentIndex(index);
    event.preventDefault();
  };

  const lastPhoto = (event, item) => {
    if (currentIndex === 0) {
      setCurrentIndex(photoData.length - 1);
      setSinglePhoto(photoData[`${currentIndex}`]['url']);
    } else {
      setCurrentIndex(currentIndex - 1);
    }
    event.preventDefault();
  };

  const nextPhoto = (event, item) => {
    if (currentIndex === photoData.length - 1) {
      setCurrentIndex(0);
      setSinglePhoto(photoData[0]['url']);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
    event.preventDefault();
  };

  //List Item Component
  const Item = ({url, item}) => (
    <Pressable
      onPress={event => handleClick(event, url, item)}
      maxWidth="25%"
      height="100">
      <Image
        source={{
          uri: url,
        }}
        alt="Alternate Text"
        maxHeight="100%"
        minWidth="100%"
        objectFit="contain"
        align="bottom"
        height="200"
      />
    </Pressable>
  );

  //Process each item of the data array for the list
  const renderItem = ({item}) => <Item url={item.url} item={item} />;

  // Header element for the scrolling Flatlist
  const _renderHeader = () => (
    <ScrollView>
      <VStack mb="4" space={4} alignItems="center">
        <AspectRatio w="100%" ratio={16 / 9}>
          {location_pic === '' || location_pic === null ? (
            <Center flex="1">
              <Text fontWeight="400">No Image yet</Text>
            </Center>
          ) : (
            <Image
              source={{
                uri: location_pic,
              }}
              alt="image"
            />
          )}
        </AspectRatio>
        <Box
          safeArea
          w="80"
          maxW="80"
          rounded="lg"
          overflow="hidden"
          borderColor="coolGray.200"
          borderWidth="1"
          p="2"
          _dark={{
            borderColor: 'coolGray.600',
            backgroundColor: 'gray.700',
          }}
          _web={{
            shadow: 2,
            borderWidth: 0,
          }}
          _light={{
            backgroundColor: 'gray.50',
          }}>
          <Stack p="4" space={3}>
            <Stack space={2}>
              <Heading size="md" ml="-1">
                {name}
              </Heading>
            </Stack>
            <Text fontWeight="400">
              {description === '' || description === null
                ? 'No description yet.'
                : description}
            </Text>
            <Box
              flex={1}
              justifyContent="flex-end"
              rounded="lg"
              overflow="hidden"
              alignItems="center"
              justifyContent="center">
              <AspectRatio w="100%" ratio={16 / 9}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={mapStyles.map}
                  region={{
                    latitude: parseFloat(coordsObj['latitude']),
                    longitude: parseFloat(coordsObj['longitude']),
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                  }}>
                  <Marker
                    key={0}
                    coordinate={{
                      latitude: parseFloat(coordsObj['latitude']),
                      longitude: parseFloat(coordsObj['longitude']),
                    }}
                    // title={marker.title}
                    // description={marker.description}
                  />
                </MapView>
              </AspectRatio>
            </Box>
            {isLocationSaved ? (
              <Button colorScheme="blue" size="md" onPress={onDeleteClick}>
                Remove Location
              </Button>
            ) : (
              <Button colorScheme="blue" size="md" onPress={onSaveClick}>
                Save Location
              </Button>
            )}
            <Button colorScheme="blue" onPress={() => setShowModal(true)}>
              Add Photo
            </Button>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
              <Modal.Content size="xs">
                <Modal.CloseButton />
                <Modal.Header>New Post</Modal.Header>
                <Modal.Body>
                  <HStack space={5} alignItems="center" justifyContent="center">
                    {dispImageUri ? (
                      <Image
                        border={1}
                        borderWidth={5}
                        borderColor="white"
                        source={{
                          uri: dispImageUri,
                        }}
                        alt="Alternate Text"
                        size="xl"
                      />
                    ) : (
                      <Image
                        border={1}
                        borderWidth={5}
                        borderColor="white"
                        source={{
                          uri: dispImageUri,
                        }}
                        alt="Alternate Text"
                        size="xl"
                      />
                    )}
                    <VStack space={5}>
                      <Button
                        colorScheme="blue"
                        size="md"
                        onPress={() => {
                          openCamera();
                        }}>
                        Take Photo
                      </Button>
                      <Button
                        colorScheme="blue"
                        size="md"
                        onPress={() => {
                          openLibrary();
                        }}>
                        Choose From Library
                      </Button>
                    </VStack>
                  </HStack>
                  <Input
                    // onSubmitEditing={text => setPhotoDescription(text)}
                    onChangeText={text => setPhotoDescription(text)}
                    value={photoDescription}
                    height="30%"
                    placeholder="Add a description..."
                    mt="2"
                    paddingLeft="3"
                    rounded="lg"
                    borderWidth="5"
                    style={{borderColor: '#3b81f6', fontSize: 15}}
                  />
                </Modal.Body>
                <Modal.Footer>
                  <Button.Group space={2}>
                    <Button
                      variant="ghost"
                      colorScheme="blueGray"
                      onPress={() => {
                        setShowModal(false);
                      }}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="blue"
                      onPress={() => {
                        setShowModal(false),
                          // setPhotoDescription(photoDescription),
                          console.log('photoDescription', photoDescription),
                          postImage(imageUri, photoDescription),
                          setTimeout(() => {
                            setGalleryRefresh(!galleryRefresh);
                          }, 1000);
                      }}>
                      Post
                    </Button>
                  </Button.Group>
                </Modal.Footer>
              </Modal.Content>
            </Modal>
          </Stack>
        </Box>
      </VStack>
    </ScrollView>
  );

  /** Image Picker via camera access */
  const openCamera = () => {
    const options = {
      storageOptions: {
        path: 'images',
        mediaType: 'photo',
        cameraType: 'back',
        allowsEditing: true,
        noData: true,
      },
      includeBase64: true,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const uri = response.assets[0].uri;
        setImageUri(response.assets[0].uri);
        setDispImageUri(response.assets[0].uri);
      }
    });
  };

  /** Image Picker via library access */
  const openLibrary = () => {
    const options = {
      storageOptions: {
        quality: 1,
        mediaType: 'photo',
        cameraType: 'back',
        allowsEditing: true,
        noData: true,
        maxWidth: 8000,
        maxHeight: 8000,
      },
    };

    launchImageLibrary(options, response => {
      // console.log('response: ', response);
      // console.log('response latitude: ', response.latitude);
      // console.log('response longitude: ', response.longitude);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const uri = response.assets[0].uri;
        setImageUri(response.assets[0].uri);
        setDispImageUri(response.assets[0].uri);
      }
    });
  };

  /** POST request sending imageUri to backend */
  const postImage = (imageUri, photoDescription) => {
    const url = `https://ccp2-capstone-backend-sa-yxiyypij7a-an.a.run.app/api/user/${user.id}/location/${locationId}/photo`;
    let formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'image.jpg',
      type: 'image/jpeg',
    });
    formData.append('description', photoDescription);
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    }).catch(error => {
      console.warn(error);
    });
  };

  const SinglePhoto = (item, photoData) => (
    <Modal isOpen={showSinglePhoto} onClose={() => setShowSinglePhoto(false)}>
      <Modal.Content size="lg">
        <Modal.CloseButton />
        <Modal.Header>
          <Heading size="sm" multiline={true}>
            {name} Image Gallery
          </Heading>
        </Modal.Header>
        <Modal.Body space={5} alignItems="center">
          <HStack space={5} alignItems="center" justifyContent="center">
            <ArrowBackIcon onPress={(event, item) => lastPhoto(event, item)} />
            <Image
              border={1}
              borderWidth={5}
              borderColor="white"
              source={{
                uri: singlePhoto,
              }}
              alt="Alternate Text"
              size="2xl"
            />
            <ArrowForwardIcon
              onPress={(event, item) => nextPhoto(event, item)}
            />
          </HStack>
          <Input
            placeholder="Add a caption..."
            mt="2"
            paddingLeft="3"
            rounded="lg"
            borderWidth="5"
            style={{borderColor: '#3b81f6', fontSize: 15}}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button
              variant="ghost"
              colorScheme="blueGray"
              onPress={() => {
                setShowSinglePhoto(false);
              }}>
              Back
            </Button>
            <Button
              colorScheme="blue"
              onPress={() => {
                setShowSinglePhoto(false);
                // postImage(imageUri),
                // setTimeout(() => {
                //   setGalleryRefresh(!galleryRefresh);
                // }, 1000);
              }}>
              Edit
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );

  return (
    <NativeBaseProvider>
      <Center flex={1}>
        <Box flex="1" safeAreaTop>
          <FlatList
            ListHeaderComponent={() => _renderHeader()}
            numColumns={4}
            key={4}
            data={photoData}
            renderItem={renderItem}
            style={{width: '100%'}}></FlatList>
          <SinglePhoto />
        </Box>
      </Center>
    </NativeBaseProvider>
  );
}

const mapStyles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
});

export default Location;
