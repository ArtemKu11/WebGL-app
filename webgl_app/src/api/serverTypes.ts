export interface DataModel {
    changeDate: string,
    comment: string,
    downloadLink: string,
    id: number,
    name: string,
    size: number,
    type: string,
    uploadDate: string
}

export interface ClientDataModel {
    changeDate: string,
    comment: string,
    downloadLink: string,
    id: number,
    name: string,
    size: string,
    type: string,
    uploadDate: string
}

export interface ServerError {
    message: string,
    logs: string[]
}
