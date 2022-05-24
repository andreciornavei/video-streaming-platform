import React, { useRef } from "react"
import { VideoCanvas, VideoContainer, VideoControls, VideoWrapper } from "./style"

//https://developer.chrome.com/blog/mse-sourcebuffer/
//https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer
//https://developer.mozilla.org/en-US/docs/Web/API/MediaSource/activeSourceBuffers
//https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/buffering_seeking_time_ranges

// READ THE LINK BELOW 
// https://www.tabnine.com/code/javascript/functions/builtins/SourceBuffer/appendBuffer

export const VideoPlayer = () => {

    const playerRef = useRef<any>()
    const bufferQueue: Uint8Array[] = []
    const [progress, setProgress] = React.useState<number>(0)
    const [videoSize, setVideoSize] = React.useState<number>(0)
    const [bufferedSize, setBufferedSize] = React.useState<number>(0)
    // const [streamFinished, setStreamFinished] = React.useState<boolean>(false)
    let streamFinished = false

    const progressBuffer = React.useMemo(() => {
        return Math.ceil((bufferedSize || 0) / (videoSize || 0) * 100)
    }, [videoSize, bufferedSize])

    // var duration = playerRef.current.duration
    // the metadata total duration of the video

    // var seekableTimeRanges = playerRef.current.seekable;
    // returns the timerange that was 
    // not download (skipped) from streaming

    // var played = playerRef.current.played
    // returns the timerange that was 
    // played/watched on the payer

    // var buffered = playerRef.current.buffered
    // returns the timerange that wast
    // downloaded from streaming

    const mediaSource = new MediaSource();

    // DETERMINE WHEN THE DOWNLOAD STREAM IS FINISHED
    mediaSource.addEventListener('sourceclose', function () {
        console.log("source closed...")
    })

    // DETERMINE WHEN THE DOWNLOAD STREM IS STARTED
    mediaSource.addEventListener('sourceopen', function () {
        // add a source buffer to media source
        // it is like to add a src attr to <video/> tag
        // but you can inject the buffer to it programatically
        // const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001F"');

        // ** ATTENTION **
        // BROWSER WILL THROW THE ERROR -> `This SourceBuffer has been removed from the parent media source.`
        // IF THE DOWNLOAD STREAM VIDEO CODEC IS DIFFERENT FROM VP8, SO 
        // MAKE SURE TO CODEC THE VIDEO TO VP8 ON UPLOAD BEFORE TO MAKE VIDEO
        // AVAILABLE TO DOWNLOAD STREAM.

        streamFinished = false
        setProgress(0)
        setVideoSize(0)
        setBufferedSize(0)

        // CODEC vp8 and video/webm IS THE ONLY SUPPORTED BY CHROME VIDEO PLAYER
        const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        sourceBuffer.mode = 'sequence';
        sourceBuffer.addEventListener('update', () => {
            // add a update listener for source buffer
            // it means that everytime a buffer is updated
            // will be checked if exists buffer on queue array
            // to be injected to source buffer.
            if (bufferQueue.length > 0 && sourceBuffer && !sourceBuffer.updating) {
                sourceBuffer.appendBuffer(bufferQueue.shift() as Uint8Array);
                // ONLY CAN AUTOMATIC PLAY IF USER
                // INTERACT WITH THE BROWSER FIRST
                // playerRef.current.play();
            }
        });
        sourceBuffer.addEventListener("updateend", () => {
            if (bufferQueue.length === 0 && !sourceBuffer.updating && streamFinished) {
                console.log("DONE DOWNLOAD")
                mediaSource.endOfStream()
            }
        })

        fetch('http://localhost:1337/streaming')
            .then(response => {
                if (!response.ok) return console.log("request problem")
                if (!response.body) return console.log("readableStream not supported")
                const contentLength = response.headers.get('content-length');
                if (!contentLength) return console.log("does not returns content-length")

                // set the video length to variable
                setVideoSize(Number.parseFloat(contentLength))

                const readableStream = response.body.getReader();

                const read = () => {
                    readableStream.read().then(({ done, value: chunk }) => {
                        if (done) {
                            // only should end stream 
                            // if the queue is totally consumed
                            // so instead to call mediaSource.endOfStream()
                            // turn a flage buffered end to true, to call this
                            // function on end of queue strem
                            // setStreamFinished(true)
                            streamFinished = true
                            return
                        }

                        // increment state buffer progress value
                        setBufferedSize((currentSize) => currentSize + chunk.length)

                        // only can appenBuffer if buffer is not updating
                        // to handle it, create a variable to queue buffers
                        // while sourceBuffer is updating
                        if (sourceBuffer.updating || bufferQueue.length > 0) {
                            bufferQueue.push(chunk);
                        } else {
                            sourceBuffer.appendBuffer(chunk);
                        }

                        // recursive read until is done
                        read()
                    })
                }
                // make the first read from stream
                read()

            })
    })

    // // THIS IS NOT NECESSARY ANYMORE BECAUSE THE BUFFER IS HANDLED
    // // BY THIS COMPONENT IMPLEMENTATION, NOT BY <video/> ELEMENT
    // // handle streaming download buffer
    // const handleDownloadBuffer = () => {
    //     const p = playerRef.current
    //     const duration = p.duration;
    //     if (duration > 0) {
    //         for (var i = 0; i < p.buffered.length; i++) {
    //             if (p.buffered.start(p.buffered.length - 1 - i) < p.currentTime) {
    //                 setProgressBuffer(Math.ceil((p.buffered.end(p.buffered.length - 1 - i) / duration) * 100))
    //                 break;
    //             }
    //         }
    //     }
    // }

    // handle player progress bar
    const handleUpdateProgress = () => {
        const duration = playerRef.current.duration;
        if (duration > 0)
            setProgress(Math.ceil(
                (playerRef.current.currentTime / duration) * 100
            ))
    }

    // React.useEffect(() => {
    //     if (!playerRef) return
    //     const player = playerRef.current
    //     player.src = window.URL.createObjectURL(mediaSource);
    //     const seekListener = player.addEventListener('seeked', () => console.log("seek"))
    //     // const progressListener = player.addEventListener('progress', handleDownloadBuffer)
    //     const timeUpdateListener = player.addEventListener('timeupdate', handleUpdateProgress)
    //     // remove player listener
    //     return () => {
    //         if (player.removeListener) {
    //             player.removeListener(seekListener)
    //             // player.removeListener(progressListener)
    //             player.removeListener(timeUpdateListener)
    //         }
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])




    // QUAL METODOLOGIA É A MELHOR?
    
    // 1) Utilizando MediaSource nós temos controle dos buffers
    // sobre o player, porém o MediaSource possui limitação de codecs
    // e é necessário implementar uma estratégia que melhora a qualidade
    // do streaming

    // 2) Utilizando a url do streaming direto no SRC, nós não temos controle
    // do buffer sobre o player, porém o player já aplica uma estratégia
    // de alocação dos buffers em fila, além de permitir outros codecs além do vp8
    // + ainda é possível realizar o listening do player e do buffer alocado, o que
    // apresenta o mesmo resultado do MediaSource.


    // Conclusão.: Por enquanto, por questões de limitação de conhecimento,
    // o mais indicado é utilizar o SRC que dispõe melhores resultados,
    // podendo controlar o listener de buffer e gerenciar o controle do player
    // via API como no MediaSource... sendo possível gerenciar a entrega do straming,
    // pause, bloqueio etc pelo server-side.

    return (
        <VideoWrapper>
            <VideoCanvas>
                <VideoContainer
                    ref={playerRef}
                    src="http://localhost:1337/streaming"
                    controls={true}
                    autoPlay={true}
                />
            </VideoCanvas>
            <VideoControls>
                <label>content-length={videoSize} | ({progress}%)progress... | ({progressBuffer}%)buffered...</label>
            </VideoControls>
        </VideoWrapper>
    )
}