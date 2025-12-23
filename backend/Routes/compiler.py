import json
import queue
from jupyter_client.manager import start_new_kernel
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter
import asyncio


router = APIRouter()
@router.websocket("/")
async def server(websocket: WebSocket):
    msgID=0
    await websocket.accept()
    print("Client connected")
    manager, client = start_new_kernel()
    try:
        while True:
            try:
                datastr=await websocket.receive_text()
                data=json.loads(datastr)
                print(data)
                if data['type']=='compile':
                    code=data['code']
                    code=code.replace('\r', '')
                    print(code)
                    msgID+=1
                    messageID='M'+str(msgID)
                    user_input=''
                    client.execute("%reset -f")
                    msg_id = client.execute(code, allow_stdin=True)
                    while True:
                        try:
                            try:
                                stdin_msg = client.get_stdin_msg(timeout=0.1)
                                if stdin_msg['msg_type'] == 'input_request':
                                    while True:
                                        try:
                                            io_msg = client.get_iopub_msg(timeout=0)

                                            if io_msg['parent_header'].get('msg_id') == msg_id:
                                                content = io_msg['content']
                                                if io_msg['msg_type'] == 'stream':
                                                    await websocket.send_text(json.dumps({
                                                        'type': 'output',
                                                        'output': content['text'].replace('\n', '\r\n ')
                                                    }))
                                        except queue.Empty:
                                            break
                                    prompt = stdin_msg['content']['prompt']
                                    print(f"Kernel is asking: '{prompt}'")

                                    await websocket.send_text(json.dumps({'msgid':messageID,'type':'input_request', 'prompt':prompt}))
                                    input_data = await websocket.receive_text()
                                    input_data=json.loads(input_data)
                                    if input_data['msgid'] == messageID:
                                        user_input = input_data['input']
                                    print(user_input)
                                    client.input(user_input)
                            except queue.Empty:
                                pass

                            # Check for output
                            msg = client.get_iopub_msg(timeout=0.1)

                            if msg['parent_header'].get('msg_id') != msg_id:
                                continue

                            msg_type = msg['msg_type']
                            content = msg['content']

                            if msg_type == 'stream':
                                print(f"[{content['name'].upper()}] {content['text']}", end='')
                                output=content['text'].replace('\n', '\r\n ') + "\r\n \033[92m ...Program finished with exit code 0 \033[0m"
                                await websocket.send_text(json.dumps({'type':'output', 'output':output}))

                            elif msg_type == 'error':
                                error='\n'.join(content['traceback']).replace('\n', '\r\n ') + "\n \033[91m ...Program finished with exit code 1 \033[0m"
                                print('\n'.join(content['traceback']))
                                await websocket.send_text(json.dumps({'type': 'error', 'error': error}))

                            elif msg_type == 'status' and content['execution_state'] == 'idle':
                                print("\n--- Execution Finished ---")
                                break

                        except queue.Empty:
                            await asyncio.sleep(0.01)
                            continue
                        except KeyboardInterrupt:
                            print("Interrupted.")
                            break
            except WebSocketDisconnect:
                print("Client disconnected")
                break
    finally:
        manager.shutdown_kernel()