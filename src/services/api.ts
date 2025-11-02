import axios from 'axios'
import { AppError } from '@utils/AppError'

const api = axios.create({
  baseURL: 'http://192.168.0.130:3333',
  timeout: 10000, // 10 seconds
})

api.interceptors.response.use(
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

export { api }
