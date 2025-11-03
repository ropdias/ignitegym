import { HistoryCard } from '@components/HistoryCard'
import { ScreenHeader } from '@components/ScreenHeader'
import { ToastMessage } from '@components/ToastMessage'
import { HistoryByDayDTO } from '@dtos/HistoryByDayDTO'
import { Heading, Text, useToast, VStack } from '@gluestack-ui/themed'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { useCallback, useState } from 'react'
import { SectionList } from 'react-native'

export function History() {
  const [isLoading, setIsLoading] = useState(true)
  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([])

  const toast = useToast()

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        try {
          setIsLoading(true)
          const response = await api.get('/history')

          setExercises(response.data)
        } catch (error) {
          const isAppError = error instanceof AppError
          const description = isAppError
            ? error.message
            : 'Não foi possível carregar os detalhes do histórico'

          toast.show({
            placement: 'top',
            render: ({ id }) => (
              <ToastMessage
                id={id}
                action="error"
                title="Erro ao buscar o histórico"
                description={description}
                onClose={() => toast.close(id)}
              />
            ),
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchHistory()
    }, [toast]),
  )

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de Exercícios" />
      <SectionList
        sections={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryCard data={item} />}
        renderSectionHeader={({ section }) => (
          <Heading color="$gray200" fontSize="$md" mt="$10" mb="$3">
            {section.title}
          </Heading>
        )}
        style={{ paddingHorizontal: 32 }}
        contentContainerStyle={
          exercises.length === 0 && { flex: 1, justifyContent: 'center' }
        }
        ListEmptyComponent={() => (
          <Text color="$gray200" textAlign="center">
            Não há exercícios registrados ainda. {'\n'}
            Vamos fazer execícios hoje?
          </Text>
        )}
        showsVerticalScrollIndicator={false}
      />
    </VStack>
  )
}
