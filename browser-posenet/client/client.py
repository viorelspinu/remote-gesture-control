from pynput.keyboard import Key, Controller
from lomond import WebSocket
from lomond.persist import persist
import time
import os

server_ip = os.environ['REMOTE_PRESENTATION_SERVER_IP']

websocket = WebSocket('http://' + server_ip + ': 8181/socket')
keyboard = Controller()

for event in persist(websocket):
    if event.name == "ready":
        print("ready")
    elif event.name == "text":
        text = event.text
        print(text)
        if ("__PRESS__BACK__" == text):
            keyboard.press(Key.left)
            time.sleep(0.1)
            keyboard.release(Key.left)
            time.sleep(0.1)
        if ("__PRESS__NEXT__" == text):
            keyboard.press(Key.right)
            time.sleep(0.1)
            keyboard.release(Key.right)
            time.sleep(0.1)
