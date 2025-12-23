import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter
import random

router = APIRouter()
rooms={'R101101':[[], ""]}
clients={}
ids=[]
@router.websocket("/")
async def server(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")
    while True:
        try:
            datastr=await websocket.receive_text()
            data=json.loads(datastr)
            print(data)
            if (data['type']=='roomconnect'):
                if data['roomid'] not in rooms: rooms[data['roomid']]=[[], ""]
                id='C'+str(random.randint(100000, 999999))
                clients[id]=websocket
                rooms[data['roomid']][0].append(id)
                await websocket.send_text(json.dumps({'type': 'connected', 'id':id, 'code':rooms[data['roomid']][1]}))
            elif (data['type']=='updatecode'):
                code=data['code'].replace('\r', '')
                rooms[data['roomid']][1]=code
                updateReceivers=rooms[data['roomid']][0]
                for i in updateReceivers:
                    if clients[i]==websocket: continue
                    print(i,": ",clients[i])
                    await clients[i].send_text(json.dumps({'type':'updatecode', 'code':code}))
                # print(updateReceivers)
                # print(clients)
                # print(rooms)
            # print("Rooms: ", rooms)
            # print("Clients: ", clients)
        except WebSocketDisconnect:
            print("Client disconnected")
            break