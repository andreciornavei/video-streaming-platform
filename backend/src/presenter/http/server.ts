import http from "http"
import { routeResolver } from "./resolver"
import { routes } from "./routes"

export const bootstrap = () => {
    // define port to listen for
    const PORT = process.env.PORT || 1337
    // create http server and listen for requests
    const server = http.createServer(async (req, res) => await routeResolver(routes, req, res))
    server.listen(PORT, () => console.log(`listening on port ${PORT} for process ${process.pid}`))
    // handle error events
    // to restart server
    const killServer = () => server.close()
    process.on("SIGINT", killServer)
    process.on("SIGTERM", killServer)
}

