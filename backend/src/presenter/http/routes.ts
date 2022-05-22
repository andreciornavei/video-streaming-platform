import { ServerResponse } from "http"
import { PassThrough } from "stream"
import { stat } from "fs/promises"
import Throttle from 'throttle'
import { join } from "path"
import fs from "fs"

import { RequestType } from "./types/request-type"

const routes = new Map<String, (req: RequestType, res: ServerResponse) => void>()

routes.set("GET /streaming", async (request, response) => {
    // load file path
    const path = join(__dirname, "./../../assets/videos/video001.webm")
    // get file metadata
    const fileMetadata = await stat(path)
    // read file as stream
    const stream = fs.createReadStream(path)
    // write to header with content-type
    response.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': fileMetadata.size,
        'Accept-Rages': 'bytes'
    })

    // ***** ATTENTION (VIDEO-CODEC) ******
    // FOR THIS APPLICATION, THE FRONTEND PLAYER
    // ONLY SUPPORTS 'WEBM' VIDEO FORMAT WITH 'VP8' CODEC
    // SO MAKE SURE TO DELIVER A VIDEO FILE FITTING THIS RULES


    // ***** THROTTLE EXPLANATION *****
    // Throttle implaments a max size streamed
    // per second for stream, it make the download
    // continuous and invariant
    // PS.: Should be carefull with the implementation
    // because if the BITRATE is lower the readstream bitrate
    // the data only will be streamed when the number of
    // BITRATES PER SECOND amounts the file Bitrate
    
    // IT IS IMPORTANT DO KNOWN THE VIDEO BITRATE
    // IT WILL HELP TO REDUCE THE VIDEO STREAMING
    // VELOCITY (make sense deliver stream bytes 
    // according user needs it, if delivery to much
    // fast, user can stop stream and data was send
    // unnecessary, if deliver is to much slow, user
    // will wait for video download and get bad experience)
    // + The ideal is to get the video bitrate and multiply
    // per a value that will download the bytes as the same
    // speed that user watch the stream. 

    // ***** IMPORTANT *****
    // Is a good approach, only to delive stream bytes
    // if users is playing the video, does not make sense
    // to delivery data if users is paused (it get cost form server transfer)
    // - So it is interesting to get a Socket connection with user
    // to receive player events like (stop, play, pause) to control
    // the streaming operations, also, if user lost socket connection
    // does not make sense to deliver bytes to a disconnected user

    const BITRATE_VIDEO_SIZE = 65536
    const BITRATE_SPEED_FACTOR = 8
    const BITRATE = BITRATE_VIDEO_SIZE * BITRATE_SPEED_FACTOR
    const limitMaxSizeStream = new Throttle(BITRATE)
    // pipe throttle to read stream
    stream.pipe(limitMaxSizeStream)

    // implement middleware for 
    // read streaming to calculate
    // the download percentage
    let streamedSize = 0
    const middlewareStream = new PassThrough()
    middlewareStream.on("data", (chunk: Uint8Array) => {
        streamedSize += chunk.length
        const progress = Math.ceil(streamedSize / fileMetadata.size * 100)
        console.log(`downloaded +${chunk.length} bytes (${progress}%)`)
    })

    // pipe middleware on stream
    stream.pipe(middlewareStream)

    // pipe read stream to response
    stream.pipe(response)
})

export { routes }