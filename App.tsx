import { StatusBar, View } from 'react-native'
import {
  useFonts,
  Roboto_700Bold,
  Roboto_400Regular,
} from '@expo-google-fonts/roboto'
import { Center, GluestackUIProvider, Text } from '@gluestack-ui/themed'
import { config } from '@gluestack-ui/config'

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_700Bold, Roboto_400Regular })

  return (
    <GluestackUIProvider config={config}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      {fontsLoaded ? (
        <Center flex={1} bg="$info600">
          <Text>Home</Text>
        </Center>
      ) : (
        <View />
      )}
    </GluestackUIProvider>
  )
}
