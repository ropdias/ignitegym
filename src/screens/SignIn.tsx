import {
  Center,
  Heading,
  Image,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { useNavigation } from '@react-navigation/native'
import { AuthNavigatorRoutesProps } from '@routes/auth.routes'

import BackgroundImg from '@assets/background.png'
import Logo from '@assets/logo.svg'
import { Input } from '@components/Input'
import { Button } from '@components/Button'

const signInSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').trim().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha').trim(),
})

type SignInFormData = z.infer<typeof signInSchema>

export function SignIn() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const navigation = useNavigation<AuthNavigatorRoutesProps>()

  function handleNewAccount() {
    navigation.navigate('signUp')
  }

  function handleSignIn({ email, password }: SignInFormData) {
    console.log({ email, password })
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1}>
        <Image
          w="$full"
          h={624}
          source={BackgroundImg}
          defaultSource={BackgroundImg}
          alt="Pessoas treinando"
          position="absolute"
        />

        <VStack flex={1} px="$10" pb="$16">
          <Center my="$24">
            <Logo />

            <Text color="$gray100" fontSize="$sm">
              Treine sua mente e seu corpo
            </Text>
          </Center>

          <Center gap="$2">
            <Heading color="$gray100">Acesse sua conta</Heading>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Senha"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Button title="Acessar" onPress={handleSubmit(handleSignIn)} />
          </Center>

          <Center flex={1} justifyContent="flex-end" marginTop="$4">
            <Text color="$gray100" fontSize="$sm" mb="$3" fontFamily="$body">
              Ainda não tem acesso?
            </Text>

            <Button
              title="Criar conta"
              variant="outline"
              onPress={handleNewAccount}
            />
          </Center>
        </VStack>
      </VStack>
    </ScrollView>
  )
}
