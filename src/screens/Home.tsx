import { useState, useEffect, useCallback } from 'react'
import { FlatList } from 'react-native'
import { Group } from '@components/Group'
import { HomeHeader } from '@components/HomeHeader'
import { ExerciseCard } from '@components/ExerciseCard'
import { Heading, HStack, Text, useToast, VStack } from '@gluestack-ui/themed'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { HomeStackNavigationProp } from '@routes/app.routes'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { ToastMessage } from '@components/ToastMessage'
import { ExerciseDTO } from '@dtos/ExerciseDTO'
import { Loading } from '@components/Loading'

export function Home() {
  const [exercises, setExercises] = useState<ExerciseDTO[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [groupSelected, setGroupSelected] = useState('bíceps')
  const [isLoading, setIsLoading] = useState(true)

  const navigation = useNavigation<HomeStackNavigationProp>()
  const toast = useToast()

  function handleOpenExerciseDetails(exerciseId: string) {
    navigation.navigate('exercise', { exerciseId })
  }

  const fetchGroups = useCallback(async () => {
    try {
      const response = await api.get('/groups')
      setGroups(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError

      const description = isAppError
        ? error.message
        : 'Não foi possível carregar os grupos musculares'

      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <ToastMessage
            id={id}
            action="error"
            title="Erro ao buscar os grupos musculares"
            description={description}
            onClose={() => toast.close(id)}
          />
        ),
      })
    }
  }, [toast])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  useFocusEffect(
    useCallback(() => {
      const fecthExercisesByGroup = async () => {
        try {
          setIsLoading(true)
          const response = await api.get(`/exercises/bygroup/${groupSelected}`)
          setExercises(response.data)
        } catch (error) {
          const isAppError = error instanceof AppError
          const description = isAppError
            ? error.message
            : 'Não foi possível carregar os exercícios'

          toast.show({
            placement: 'top',
            render: ({ id }) => (
              <ToastMessage
                id={id}
                action="error"
                title="Erro ao buscar os exercícios"
                description={description}
                onClose={() => toast.close(id)}
              />
            ),
          })
        } finally {
          setIsLoading(false)
        }
      }

      fecthExercisesByGroup()
    }, [toast, groupSelected]),
  )

  return (
    <VStack flex={1}>
      <HomeHeader />
      <FlatList
        data={groups}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Group
            name={item}
            isActive={groupSelected.toLowerCase() === item.toLowerCase()}
            onPress={() => setGroupSelected(item)}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 32 }}
        style={{ marginVertical: 40, maxHeight: 44, minHeight: 44 }}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <VStack px="$8" flex={1}>
          <HStack justifyContent="space-between" mb="$5" alignItems="center">
            <Heading color="$gray200" fontSize="$md">
              Exercícios
            </Heading>
            <Text color="$gray200" fontSize="$sm" fontFamily="$body">
              {exercises.length}
            </Text>
          </HStack>

          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExerciseCard
                onPress={() => handleOpenExerciseDetails(item.id)}
                data={item}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </VStack>
      )}
    </VStack>
  )
}
