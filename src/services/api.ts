import axios, { AxiosInstance } from 'axios'
import { AppError } from '@utils/AppError'

type SignOut = () => void

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void
}

const api = axios.create({
  baseURL: 'http://192.168.15.174:3333',
  timeout: 10000, // 10 seconds
}) as APIInstanceProps

api.registerInterceptTokenManager = (signOut) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => response,
    (error) => {
      // For timeout errors
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new AppError('Timeout. Verifique sua conexão.'))
      }

      // For HTTP errors (4xx, 5xx)
      if (error.response) {
        return Promise.reject(
          new AppError(
            error.response.data?.message || 'Erro ao processar requisição',
          ),
        )
      }

      // For network/connection errors
      if (error.request) {
        return Promise.reject(
          new AppError('Erro de conexão. Verifique sua internet.'),
        )
      }

      // For other types of errors
      return Promise.reject(error)
    },
  )

  return () => {
    api.interceptors.response.eject(interceptTokenManager)
  }
}

export { api }
