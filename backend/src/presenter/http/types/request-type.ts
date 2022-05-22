import { IncomingMessage } from "http"

export type RequestType = IncomingMessage & {
    params?: Map<String, String>
}