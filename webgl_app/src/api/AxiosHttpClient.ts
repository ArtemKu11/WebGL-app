import Axios, { AxiosError, AxiosResponse } from 'axios'
import { InfoAlertType } from '@/store/alerts/types'
import { Alerts } from '@/store/alerts/helpers'
import { ServerError } from './serverTypes'

const createHttpClient = () => {
    const httpClient = Axios.create({
        // baseURL: 'http://192.168.10.167:8080'
        baseURL: 'http://localhost:5000'
    })

    httpClient.interceptors.response.use((response: AxiosResponse) => {
        // console.log('ОТВЕТ', response)
        return response
    },
    (error: AxiosError) => {
        console.log(error)
        if (error.response?.data) {
            const serverError = error.response.data as ServerError
            const alert: InfoAlertType = {
                message: serverError.message,
                time: 2000,
                type: 'red'
            }
            Alerts.showInfoAlert(alert)
            printLogs(serverError.logs)
        } else {
            const alert: InfoAlertType = {
                message: "Неизвестная ошибка",
                time: 2000,
                type: 'red'
            }
            if (error.code) {
                switch (error.code) {
                case 'ERR_NETWORK':
                    alert.message = 'Сервер недоступен. Проверьте правильность URL'
                    break

                default:
                    break
                }
                Alerts.showInfoAlert(alert)
            } else {
                Alerts.showInfoAlert(alert)
            }
        }
    })

    return httpClient
}

function printLogs(logs: string[]) {
    logs.forEach((item) => console.log(item))
}

export const httpClient = createHttpClient()
