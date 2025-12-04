import axios, { AxiosError, AxiosInstance } from 'axios'
import { AppError } from '@utils/AppError'
import {
  storageAuthTokenGet,
  storageAuthTokenSave,
} from '@storage/storageAuthToken'

type SignOut = () => void

type PromiseType = {
  onSuccess: (token: string) => void
  onFailure: (error: AxiosError) => void
}

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void
}

const api = axios.create({
  baseURL: 'http://192.168.15.174:3333',
  timeout: 10000, // 10 seconds
}) as APIInstanceProps

let failedQueued: PromiseType[] = []
let isRefreshing = false

api.registerInterceptTokenManager = (signOut) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => response,
    async (requestError) => {
      if (requestError.response?.status === 401) {
        if (
          requestError.response.data?.message === 'token.expired' ||
          requestError.response.data?.message === 'token.invalid'
        ) {
          const { refresh_token } = await storageAuthTokenGet()

          if (!refresh_token) {
            signOut()
            return Promise.reject(requestError)
          }

          const originalRequestConfig = requestError.config

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueued.push({
                onSuccess: (token: string) => {
                  originalRequestConfig.headers = {
                    Authorization: `Bearer ${token}`,
                  }
                  resolve(api(originalRequestConfig))
                },
                onFailure: (error: AxiosError) => {
                  reject(error)
                },
              })
            })
          }

          isRefreshing = true

          return new Promise(async (resolve, reject) => {
            try {
              const { data } = await api.post('/sessions/refresh-token', {
                refresh_token,
              })

              await storageAuthTokenSave({
                token: data.token,
                refresh_token: data.refresh_token,
              })

              if (originalRequestConfig.data) {
                originalRequestConfig.data = JSON.parse(
                  originalRequestConfig.data,
                )
              }

              originalRequestConfig.headers = {
                Authorization: `Bearer ${data.token}`,
              }
              api.defaults.headers.common['Authorization'] =
                `Bearer ${data.token}`

              failedQueued.forEach((request) => {
                request.onSuccess(data.token)
              })

              resolve(api(originalRequestConfig))
            } catch (error: any) {
              failedQueued.forEach((request) => {
                request.onFailure(error)
              })

              signOut()
              reject(error)
            } finally {
              isRefreshing = false
              failedQueued = []
            }
          })
        }

        signOut()
      }

      // For timeout errors
      if (requestError.code === 'ECONNABORTED') {
        return Promise.reject(
          new AppError('Request timeout. Check your connection.'),
        )
      }

      // For HTTP errors (4xx, 5xx)
      if (requestError.response) {
        return Promise.reject(
          new AppError(
            requestError.response.data?.message || 'Error processing request',
          ),
        )
      }

      // For network/connection errors
      if (requestError.request) {
        return Promise.reject(
          new AppError('Connection error. Check your internet.'),
        )
      }

      // For other types of errors
      return Promise.reject(requestError)
    },
  )

  return () => {
    api.interceptors.response.eject(interceptTokenManager)
  }
}

export { api }
