from __future__ import print_function
from flask import Flask, render_template
from flask_sockets import Sockets
import redis


app = Flask(__name__)
sockets = Sockets(app)

IDLE_STATE = 0
NEXT_SLIDE_STATE = 2
AFTER_NEXT_STATE = 3
BACK_SLIDE_STATE = 4
AFTER_BACK_STATE = 5
MAX_COUNTER = 5
MAX_IDLE_COUNTER = 2


@sockets.route('/socket')
def chat_socket(ws):
    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    r.set("state", IDLE_STATE)
    resetCounters(r)
    while not ws.closed:
        message = ws.receive()
        if message is None:
            continue

        if (message.startswith("__EVENT__")):
            message = message.replace("__EVENT__", "")
            processEvent(message, r)
            processState(r)
            socketSend(ws, message)


def socketSend(ws, message):
    clients = ws.handler.server.clients.values()
    for client in clients:
        client.ws.send(message)


def processEvent(message, r):
    if ("LEFT" == message):
        left_counter = int(r.get('left_counter'))
        left_counter = left_counter + 1
        r.set('left_counter', left_counter)

    if ("RIGHT" == message):
        right_counter = int(r.get('right_counter'))
        right_counter = right_counter + 1
        r.set('right_counter', right_counter)

    if ("IDLE" == message):
        idle_counter = int(r.get('idle_counter'))
        idle_counter = idle_counter + 1
        r.set('idle_counter', idle_counter)


def processState(r):

    left_counter = int(r.get("left_counter"))
    right_counter = int(r.get("right_counter"))
    idle_counter = int(r.get("idle_counter"))
    state = int(r.get("state"))

    print(state)
    print(right_counter)
    print(left_counter)
    print("----")

    if (IDLE_STATE == state):
        if (left_counter > MAX_COUNTER):
            r.set("state", BACK_SLIDE_STATE)
            print("BACK !")
            resetCounters(r)
        if (right_counter > MAX_COUNTER):
            r.set("state", NEXT_SLIDE_STATE)
            print("NEXT !")
            resetCounters(r)
    elif (NEXT_SLIDE_STATE == state):
        r.set("state", AFTER_NEXT_STATE)
        resetCounters(r)
    elif (BACK_SLIDE_STATE == state):
        r.set("state", AFTER_BACK_STATE)
        resetCounters(r)
    elif (AFTER_NEXT_STATE == state):
        if (idle_counter > MAX_IDLE_COUNTER):
            r.set("state", IDLE_STATE)
            resetCounters(r)
    elif (AFTER_BACK_STATE == state):
        if (idle_counter > MAX_IDLE_COUNTER):
            r.set("state", IDLE_STATE)
            resetCounters(r)


def resetCounters(r):
    r.set("left_counter", 0)
    r.set("right_counter", 0)
    r.set("idle_counter", 0)


@app.route('/configuration')
def index():
    return render_template('configuration.html')


if __name__ == '__main__':
    print("""
This can not be run directly because the Flask development server does not
support web sockets. Instead, use gunicorn:

gunicorn -b 127.0.0.1:8080 -k flask_sockets.worker main:app

""")
