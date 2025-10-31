import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack'
import { SignIn } from '@screens/SignIn'
import { SignUp } from '@screens/SignUp'

type AuthRoutesStack = {
  signIn: undefined
  signUp: undefined
}

export type AuthNavigatorRoutesProps =
  NativeStackNavigationProp<AuthRoutesStack>

const { Navigator, Screen } = createNativeStackNavigator<AuthRoutesStack>()

export function AuthRoutes() {
  return (
    <Navigator>
      <Screen name="signIn" component={SignIn} />

      <Screen name="signUp" component={SignUp} />
    </Navigator>
  )
}
