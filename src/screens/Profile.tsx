import { Button } from '@components/Button'
import { Input } from '@components/Input'
import { ScreenHeader } from '@components/ScreenHeader'
import { UserPhoto } from '@components/UserPhoto'
import { Center, Heading, Text, VStack, useToast } from '@gluestack-ui/themed'
import { ScrollView, TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { File } from 'expo-file-system'
import { ToastMessage } from '@components/ToastMessage'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@hooks/useAuth'
import { Controller, useForm } from 'react-hook-form'
import { AppError } from '@utils/AppError'
import { api } from '@services/api'
import * as Crypto from 'expo-crypto'
import defaulUserPhotoImg from '@assets/userPhotoDefault.png'

const profileSchema = z
  .object({
    name: z.string().trim().min(1, 'Nome é obrigatório'),
    email: z
      .string()
      .trim()
      .min(1, 'Informe o e-mail')
      .email('E-mail inválido'),
    old_password: z
      .string()
      .trim()
      .transform((val) => (val === '' ? null : val))
      .nullable(),
    password: z
      .union([z.string().trim(), z.null()])
      .transform((val) => (val === '' ? null : val)),
    confirm_password: z
      .string()
      .trim()
      .transform((val) => (val === '' ? null : val))
      .nullable(),
  })
  .superRefine((data, ctx) => {
    const { old_password, password, confirm_password } = data

    if (old_password || password || confirm_password) {
      if (!old_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['old_password'],
          message: 'Informe a senha antiga.',
        })
      }

      if (!password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'Informe a nova senha.',
        })
      }

      if (!confirm_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirm_password'],
          message: 'Informe a confirmação da senha.',
        })
      }

      if (password && password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'A senha deve ter pelo menos 6 caracteres.',
        })
      }

      if (password && confirm_password && password !== confirm_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirm_password'],
          message: 'A confirmação de senha não confere.',
        })
      }
    }
  })

type ProfileFormData = z.infer<typeof profileSchema>

export function Profile() {
  const [isUpdating, setIsUpdating] = useState(false)
  const toast = useToast()
  const { user, updateUserProfile } = useAuth()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      old_password: '',
      password: '',
      confirm_password: '',
    },
  })

  async function handleProfileUpdate(data: ProfileFormData) {
    try {
      setIsUpdating(true)

      const userUpdated = user
      userUpdated.name = data.name

      await api.put('/users', data)

      await updateUserProfile(userUpdated)

      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <ToastMessage
            id={id}
            action="success"
            title="Sucesso!"
            description="Perfil atualizado"
            onClose={() => toast.close(id)}
          />
        ),
      })
    } catch (error) {
      const isAppError = error instanceof AppError
      const description = isAppError
        ? error.message
        : 'Não foi possível atualizar os dados. Tente novamente mais tarde.'

      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <ToastMessage
            id={id}
            action="error"
            title="Erro ao atualizar o perfil"
            description={description}
            onClose={() => toast.close(id)}
          />
        ),
      })
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleUserPhotoSelect() {
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      })

      if (photoSelected.canceled) {
        return
      }

      const photoUri = photoSelected.assets[0].uri

      if (photoUri) {
        const file = new File(photoUri)
        if (!file.exists) return

        if (file.size / 1024 / 1024 > 5) {
          return toast.show({
            placement: 'top',
            render: ({ id }) => (
              <ToastMessage
                id={id}
                action="error"
                title="Imagem muito grande!"
                description="Escolha uma imagem de até 5MB."
                onClose={() => toast.close(id)}
              />
            ),
          })
        }

        const fileExtension = photoSelected.assets[0].uri.split('.').pop()

        const photoFile = {
          name: `${Crypto.randomUUID()}.${fileExtension}`,
          uri: photoSelected.assets[0].uri,
          type: photoSelected.assets[0].mimeType || `image/${fileExtension}`,
        } as any

        const userPhotoUploadForm = new FormData()

        userPhotoUploadForm.append('avatar', photoFile)

        const avatarUpdtedResponse = await api.patch(
          '/users/avatar',
          userPhotoUploadForm,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        )

        const userUpdated = user

        userUpdated.avatar = avatarUpdtedResponse.data.avatar

        await updateUserProfile(userUpdated)

        toast.show({
          placement: 'top',
          render: ({ id }) => (
            <ToastMessage
              id={id}
              action="success"
              title="Sucesso!"
              description="Foto atualizada"
              onClose={() => toast.close(id)}
            />
          ),
        })
      }
    } catch (error) {
      const isAppError = error instanceof AppError
      const description = isAppError
        ? error.message
        : 'Não foi possível atualizar a imagem do perfil. Tente novamente mais tarde.'

      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <ToastMessage
            id={id}
            action="error"
            title="Erro ao atualizar a imagem do perfil"
            description={description}
            onClose={() => toast.close(id)}
          />
        ),
      })
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt="$6" px="$10">
          <UserPhoto
            source={
              user.avatar
                ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                : defaulUserPhotoImg
            }
            size="xl"
            alt="Imagem do usuário"
          />
          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text
              fontFamily="$heading"
              color="$green500"
              fontSize="$md"
              mt="$2"
              mb="$8"
            >
              Alterar Foto
            </Text>
          </TouchableOpacity>

          <Center w="$full" gap="$4">
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder="Nome"
                  bg="$gray600"
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange } }) => (
                <Input
                  bg="$gray600"
                  isReadOnly
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.email?.message}
                />
              )}
            />
          </Center>
          <Heading
            alignSelf="flex-start"
            fontFamily="$heading"
            color="$gray200"
            fontSize="$md"
            mt="$12"
            mb="$2"
          >
            Alterar senha
          </Heading>

          <Center w="$full" gap="$4">
            <Controller
              control={control}
              name="old_password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Senha antiga"
                  bg="$gray600"
                  secureTextEntry
                  onChangeText={onChange}
                  errorMessage={errors.old_password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Nova senha"
                  bg="$gray600"
                  secureTextEntry
                  onChangeText={onChange}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirm_password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Confirme a nova senha"
                  bg="$gray600"
                  secureTextEntry
                  onChangeText={onChange}
                  errorMessage={errors.confirm_password?.message}
                />
              )}
            />

            <Button
              title="Atualizar"
              onPress={handleSubmit(handleProfileUpdate)}
              isLoading={isUpdating}
            />
          </Center>
        </Center>
      </ScrollView>
    </VStack>
  )
}
