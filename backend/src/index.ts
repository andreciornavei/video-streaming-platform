import cluster from "cluster"
import { bootstrap } from "./presenter/http/server"

const handleFork = () => {
    const worker = cluster.fork()
    worker.on("exit", (code) => {
        if (code !== 0) handleFork()
    })
}

cluster.isPrimary ? handleFork() : bootstrap()

