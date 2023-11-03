import {
  View,
  Text,
  StatusBar,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import React from 'react'
import {debounce} from 'lodash'
import LottieView from 'lottie-react-native'

import Icon from 'react-native-vector-icons/Ionicons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5'
import axios from 'axios'
import {weatherImages} from './constants/index'
import {getData, storeData} from './utils/asyncStorage'
import {Dimensions} from 'react-native'

const App = () => {
  const [toggleSearch, setToggleSearch] = React.useState(false)
  const [locations, setLocations] = React.useState([])
  const [weather, setWeather] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  const {width} = Dimensions.get('window')

  const getWeather = async city => {
    setLoading(true)
    try {
      const res = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=API_KEY_HERE&q=${city}&days=7&aqi=no&alerts=no`,
      )
      setWeather(res.data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setError(true)
    }
  }

  React.useEffect(() => {
    ;(async () => {
      const city = await getData('city')
      if (city) {
        getWeather(city)
      } else {
        getWeather('Mumbai')
      }
    })()
  }, [])

  const handleSearch = async text => {
    if (text && text.length > 2) {
      try {
        const res = await axios.get(
          `https://api.weatherapi.com/v1/search.json?key=API_KEY_HERE&q=${text}`,
        )
        setLocations(res.data)
      } catch (error) {
        setError(true)
      }
    }
  }

  const handleLocation = location => {
    getWeather(location.name)
    storeData('city', location.name)
    setToggleSearch(false)
    setLocations([])
  }
  const debounceSearch = React.useCallback(debounce(handleSearch, 1000), [])

  return (
    <View className='flex-1 relative z-20'>
      <StatusBar barStyle='light-content' />
      <Image
        blurRadius={70}
        className='absolute  w-full h-full'
        source={require('./assets/bg.png')}
      />

      {error ? (
        <View className='flex-1 justify-center items-center'>
          <LottieView
            style={{width: width, height: 200}}
            source={require('./assets/error.json')}
            autoPlay
            loop
            speed={2}
          />
          <Text className='text-white text-2xl'>Something went wrong</Text>
        </View>
      ) : loading ? (
        <View className='absolute top-0 left-0 w-full h-full items-center justify-center'>
          <LottieView
            style={{width: width, height: 200}}
            source={require('./assets/loading.json')}
            autoPlay
            loop
            speed={2}
          />
          <Text className='text-gray-300 text-3xl mt-4'>Loading...</Text>
        </View>
      ) : (
        <SafeAreaView className='flex-1'>
          {/* SearchSection */}

          <View style={{height: '10%'}} className='mx-4 relative z-50'>
            <View
              className='flex-row items-center justify-end my-4 rounded-full'
              style={{
                backgroundColor: `${
                  toggleSearch ? 'rgba(255,255,255,0.2)' : 'transparent'
                }`,
              }}>
              {toggleSearch ? (
                <TextInput
                  placeholder='Search'
                  className='pl-6 h-12 pb-3 flex-1 text-white text-lg'
                  placeholderTextColor='white'
                  onChangeText={debounceSearch}
                />
              ) : null}

              <TouchableOpacity
                onPress={() => setToggleSearch(!toggleSearch)}
                className=' w-12 h-12 items-center justify-center rounded-full'
                style={{backgroundColor: 'rgba(255,255,255,0.5)'}}>
                <Icon name='search' size={25} color='#fff' />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && toggleSearch ? (
              <View className='absolute top-20 w-full bg-white rounded-lg '>
                {locations.map((location, index) => {
                  let border =
                    index + 1 == locations.length
                      ? null
                      : 'border-gray-300 border-b'

                  return (
                    <TouchableOpacity
                      onPress={() => {}}
                      key={index}
                      className={
                        'flex-row items-center border-0 py-4 px-2 ' + border
                      }>
                      <Icon name='location' size={25} color='#000' />
                      <Text
                        className='text-lg text-black ml-3 '
                        onPress={() => handleLocation(location)}>
                        {location.name}, {location.region}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ) : null}
          </View>
          <View className='flex-1 justify-around items-center'>
            <Text className='text-2xl text-white font-bold'>
              {weather?.location?.name},
              <Text className='text-2xl text-gray-300 font-normal'>
                {' '}
                {weather?.location?.region}
              </Text>
            </Text>
            <View className=' justify-center'>
              <Image
                source={
                  weatherImages[weather?.current?.condition?.text || 'other']
                }
                className='w-40 h-40'
                resizeMode='center'
              />
            </View>
            <View className='space-y-2'>
              <Text className='text-center text-white text-6xl font-bold ml-3'>
                {weather?.current?.temp_c}
                &deg;
              </Text>
              <Text className='text-center text-white text-3xl font-normal ml-3'>
                {weather?.current?.condition?.text}
              </Text>
            </View>
          </View>

          <View className='flex-row justify-around items-center py-6'>
            <View className='flex-row items-center justify-center'>
              <FontAwesomeIcon name='wind' size={25} color='#fff' />
              <Text className='text-white text-lg ml-2'>
                {weather?.current?.wind_kph} km/h
              </Text>
            </View>

            <View className='flex-row items-center justify-center'>
              <FontAwesomeIcon name='tint' size={25} color='#fff' />
              <Text className='text-white text-lg ml-2'>
                {weather?.current?.humidity}%
              </Text>
            </View>
            <View className='flex-row items-center justify-center'>
              <Icon name='sunny' size={25} color='#fff' />
              <Text className='text-white text-lg ml-2'>
                {weather?.forecast?.forecastday[1]?.astro?.sunrise}
              </Text>
            </View>
          </View>

          <View className='mb-10 space-y-5'>
            <View className='flex-row items-center mx-5 space-x-2'>
              <Icon name='cloud' size={25} color='#fff' />
              <Text className='text-white text-lg ml-2'>Daily forecast</Text>
            </View>

            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              className='flex-row'>
              {weather?.forecast?.forecastday?.map((item, index) => {
                const date = new Date(item.date)
                const day = date.getDay()
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

                return (
                  <View
                    key={index}
                    className='flex-row items-center  bg-white rounded-lg p-2 mx-4 '>
                    <Text className='text-black text-lg'>{days[day]}</Text>
                    <Image
                      source={
                        weatherImages[item?.day?.condition?.text || 'other']
                      }
                      className='w-10 h-10'
                      resizeMode='center'
                    />
                    <Text className='text-black text-lg'>
                      {item.day?.avgtemp_c}
                      &deg;
                    </Text>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  )
}

export default App
