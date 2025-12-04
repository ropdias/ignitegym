import { useState } from 'react'
import {
  Center,
  Heading,
  Image,
  ScrollView,
  Text,
  VStack,
  useToast,
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
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { ToastMessage } from '@components/ToastMessage'
import { useAuth } from '@hooks/useAuth'

const signUpSchema = z
  .object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z
      .string()
      .min(1, 'Enter your e-mail')
      .trim()
      .email('Invalid e-mail'),
    password: z.string().min(1, 'Enter your password').trim(),
    password_confirm: z
      .string()
      .min(1, 'Password confirmation is required')
      .trim(),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ['password_confirm'],
    message: 'Passwords do not match',
  })

type SignUpFormData = z.infer<typeof signUpSchema>

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const toast = useToast()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirm: '',
    },
  })

  const navigation = useNavigation<AuthNavigatorRoutesProps>()

  function handleGoBack() {
    navigation.goBack()
  }

  async function handleSignUp({ name, email, password }: SignUpFormData) {
    try {
      setIsLoading(true)
      await api.post('/users', { name, email, password })
      await signIn(email, password)
    } catch (error) {
      setIsLoading(false)
      const isAppError = error instanceof AppError

      const description = isAppError
        ? error.message
        : "Couldn't create account. Try again later"

      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <ToastMessage
            id={id}
            action="error"
            title="Error creating account"
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

          <Center flex={1} gap="$2">
            <Heading color="$gray100">Create your account</Heading>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Name"
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.name?.message}
                />
              )}
            />

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
            <Controller
              control={control}
              name="password_confirm"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Confirm password"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                  onSubmitEditing={handleSubmit(handleSignUp)}
                  returnKeyType="send"
                  errorMessage={errors.password_confirm?.message}
                />
              )}
            />

            <Button
              title="Create and sign in"
              onPress={handleSubmit(handleSignUp)}
              isLoading={isLoading}
            />
          </Center>

          <Button
            title="Back to sign in"
            variant="outline"
            mt="$12"
            onPress={handleGoBack}
          />
        </VStack>
      </VStack>
    </ScrollView>
  )
}
