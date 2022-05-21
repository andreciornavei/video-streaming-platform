import { IncomingMessage, ServerResponse } from "http";

export const routes = (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { 'Content-Type': "text/json" })
    res.end(JSON.stringify({ message: "Success" }))
}