import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs'

import { gluestackUIConfig } from '../../config/gluestack-ui.config'

import HomeSvg from '@assets/home.svg'
import HistorySvg from '@assets/history.svg'
import ProfileSvg from '@assets/profile.svg'

import { Home } from '@screens/Home'
import { Exercise } from '@screens/Exercise'
import { History } from '@screens/History'
import { Profile } from '@screens/Profile'

type AppRoutesTabs = {
  home: undefined
  exercise: undefined
  profile: undefined
  history: undefined
}

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutesTabs>

const { Navigator, Screen } = createBottomTabNavigator<AppRoutesTabs>()

export function AppRoutes() {
  const { tokens } = gluestackUIConfig
  const iconSize = tokens.space['6']

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: tokens.colors.green500,
        tabBarInactiveTintColor: tokens.colors.gray200,
      }}
    >
      <Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <HomeSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="history"
        component={History}
        options={{
          tabBarIcon: ({ color }) => (
            <HistorySvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <ProfileSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen name="exercise" component={Exercise} />
    </Navigator>
  )
}
