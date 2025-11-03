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
import { useAuth } from '@hooks/useAuth'
import { Controller, useForm } from 'react-hook-form'

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').trim(),
  email: z.string().min(1, 'Informe o e-mail').trim().email('E-mail inválido'),
  oldPassword: z.string().min(1, 'Informe a senha antiga').trim(),
  newPassword: z.string().min(1, 'Informe a nova senha').trim(),
  newPasswordConfirm: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória')
    .trim(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function Profile() {
  const [userPhoto, setUserPhoto] = useState('https://github.com/ropdias.png')
  const toast = useToast()
  const { user } = useAuth()
  const { control } = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  })

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

        setUserPhoto(photoSelected.assets[0].uri)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt="$6" px="$10">
          <UserPhoto
            source={{ uri: userPhoto }}
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
            <Input placeholder="Senha antiga" bg="$gray600" secureTextEntry />
            <Input placeholder="Nova senha" bg="$gray600" secureTextEntry />
            <Input
              placeholder="Confirme a nova senha"
              bg="$gray600"
              secureTextEntry
            />

            <Button title="Atualizar" />
          </Center>
        </Center>
      </ScrollView>
    </VStack>
  )
}
