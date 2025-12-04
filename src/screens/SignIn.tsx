import { useState } from 'react'
import {
  Center,
  Heading,
  Image,
  ScrollView,
  Text,
  useToast,
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
import { useAuth } from '@hooks/useAuth'

import { AppError } from '@utils/AppError'
import { ToastMessage } from '@components/ToastMessage'

const signInSchema = z.object({
  email: z.string().min(1, 'Enter your e-mail').trim().email('Invalid e-mail'),
  password: z.string().min(1, 'Enter your password').trim(),
})

type SignInFormData = z.infer<typeof signInSchema>

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const toast = useToast()

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

  async function handleSignIn({ email, password }: SignInFormData) {
    try {
      setIsLoading(true)
      await signIn(email, password)
    } catch (error) {
      setIsLoading(false)
      const isAppError = error instanceof AppError

      const description = isAppError
        ? error.message
        : "Couldn't sign in. Try again later."

      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <ToastMessage
            id={id}
            action="error"
            title="Error signing in"
            description={description}
            onClose={() => toast.close(id)}
          />
        ),
      })
    }
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
          alt="People working out"
          position="absolute"
        />

        <VStack flex={1} px="$10" pb="$16">
          <Center my="$24">
            <Logo />

            <Text color="$gray100" fontSize="$sm">
              Train your mind and body
            </Text>
          </Center>

          <Center gap="$2">
            <Heading color="$gray100">Access your account</Heading>

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
                  placeholder="Password"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Button
              title="Sign in"
              onPress={handleSubmit(handleSignIn)}
              isLoading={isLoading}
            />
          </Center>

          <Center flex={1} justifyContent="flex-end" marginTop="$4">
            <Text color="$gray100" fontSize="$sm" mb="$3" fontFamily="$body">
              Don&apos;t have access yet?
            </Text>

            <Button
              title="Create account"
              variant="outline"
              onPress={handleNewAccount}
            />
          </Center>
        </VStack>
      </VStack>
    </ScrollView>
  )
}
