import { InfoAlertType } from "./types"

export class AlertsProcessor {
    // eslint-disable-next-line
    dispatch: Function | null = null

    showInfoAlert(alert: InfoAlertType) {
        if (!this.dispatch) return
        this.dispatch('alerts/showInfoAlert', alert, { root: true })
    }
}

export const Alerts = new AlertsProcessor()
