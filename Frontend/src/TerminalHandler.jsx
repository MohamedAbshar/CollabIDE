import React, { forwardRef, useImperativeHandle,useRef, useEffect } from 'react'
import {Terminal} from "@xterm/xterm";
import '@xterm/xterm/css/xterm.css'
import { FitAddon } from "@xterm/addon-fit"

const TerminalHandler = forwardRef((props, ref) => {

    const container=useRef(null)
    const terminalref=useRef(null)

    useEffect(()=>{
        terminalref.current = new Terminal({
            cursorBlink: true,
        })
        const fit=new FitAddon()
        terminalref.current.loadAddon(fit)
        terminalref.current.open(container.current)
        fit.fit()
        // terminalref.current.onData((event)=>{
        //     // console.log(event)
        //     if (event === "\r") {
        //         terminalref.current.write("\r\n")
        //     } else {
        //         terminalref.current.write(event)
        //     }
        // })

        const onResize = () => fit.fit()
        window.addEventListener("resize", onResize)

        return () => {
            window.removeEventListener("resize", onResize)
            terminalref.current.dispose()
        }
    }, [])

    useImperativeHandle(ref, () => ({
      write: (data) => {
          terminalref.current?.write(data)
      },
      read: () => {
          return new Promise((resolve) => {
              let buffer=""
              const onDataListener=terminalref.current?.onData((event)=> {
                  console.log(event)
                  if (event === "\r") {
                      terminalref.current.write("\r\n")
                      resolve(buffer)
                      onDataListener.dispose()
                  } else {
                      terminalref.current.write(event)
                      buffer=buffer+event
                  }
              })
          })
      },
      clear: () => {
          // terminalref.current?.clear()
          terminalref.current?.write('\x1b[2J\x1b[3J\x1b[H');
      }

    }));

    return (
        <div ref={container}
        style={{width:"100%", height:"100%", textAlign:"left"}}>
        </div>
    )
})

export default TerminalHandler