import { IncomingMessage, ServerResponse  } from "http"

export const routeResolver = async (routes: Map<String, (req: IncomingMessage, res: ServerResponse) => void>, req: IncomingMessage, res: ServerResponse) => {
    const requestPaths: string[] = req.url.split("/").filter(path => path.length > 0)
    routeLoop: for (const route of Array.from(routes.keys())) {
        const [method, url] = route.split(" ")
        const paths: string[] = url.split("/").filter(path => path.length > 0)
        // continue to next loop if methods not matches
        if (method !== req.method)
            continue routeLoop
        // return selected method if it does not contains params and urls has exacly matches
        if (!paths.some(path => path.startsWith(":")) && url === req.url)
            return routes.get(route)(req, res)
        // if paths has the same length and non params matches
        // collect all params and call route function
        if (paths.length === requestPaths.length) {
            const params: Map<string, string> = new Map()
            for (let i = 0; i < paths.length; i++) {
                if (paths[i].startsWith(":")) params.set(String(paths[i]).slice(1), requestPaths[i])
                else if (paths[i] !== requestPaths[i]) continue routeLoop
            }
            return routes.get(route)({ ...Object.create(req), params: params }, res)
        }
    }
    res.writeHead(404, "Not Found", { "Content-Type": "text/json" })
    return res.end(JSON.stringify({ message: "Resource notfound" }))
}