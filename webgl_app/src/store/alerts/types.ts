export interface AlertState {
    alertQueue: AlertType[]
    infoAlertState: InfoAlertState
}

export interface AlertType {
    header?: string,
    message: string,
    type: string  // yes_no / ok
    confirmCallback?: Function
    rejectCallback?: Function
}

export interface InfoAlertState {
    cancellationToken: boolean,
    currentMessage: InfoAlertType | null,
}

export interface InfoAlertType {
    message: string,
    type?: string,
    time?: number
}