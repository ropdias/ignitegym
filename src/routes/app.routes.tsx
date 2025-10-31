import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs'
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack'

import { gluestackUIConfig } from '../../config/gluestack-ui.config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import HomeSvg from '@assets/home.svg'
import HistorySvg from '@assets/history.svg'
import ProfileSvg from '@assets/profile.svg'

import { Home } from '@screens/Home'
import { Exercise } from '@screens/Exercise'
import { History } from '@screens/History'
import { Profile } from '@screens/Profile'

type HomeStackRoutes = {
  homeList: undefined
  exercise: undefined
}

type AppRoutesTabs = {
  home: undefined
  history: undefined
  profile: undefined
}

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutesTabs>
export type HomeStackNavigationProp = NativeStackNavigationProp<HomeStackRoutes>

const { Navigator: TabNavigator, Screen: TabScreen } =
  createBottomTabNavigator<AppRoutesTabs>()
const { Navigator: StackNavigator, Screen: StackScreen } =
  createNativeStackNavigator<HomeStackRoutes>()

function HomeStack() {
  return (
    <StackNavigator screenOptions={{ headerShown: false }}>
      <StackScreen name="homeList" component={Home} />
      <StackScreen name="exercise" component={Exercise} />
    </StackNavigator>
  )
}

export function AppRoutes() {
  const { tokens } = gluestackUIConfig
  const iconSize = tokens.space['8']
  const insets = useSafeAreaInsets()

  return (
    <TabNavigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: tokens.colors.green500,
        tabBarInactiveTintColor: tokens.colors.gray200,
        tabBarStyle: {
          backgroundColor: tokens.colors.gray600,
          borderTopWidth: 0,
          height: 80 + insets.bottom, // compensates for the lower safe area on iOS
          paddingTop: 24,
          paddingBottom: 24 + insets.bottom,
        },
      }}
    >
      <TabScreen
        name="home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color }) => (
            <HomeSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <TabScreen
        name="history"
        component={History}
        options={{
          tabBarIcon: ({ color }) => (
            <HistorySvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <TabScreen
        name="profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <ProfileSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
    </TabNavigator>
  )
}
