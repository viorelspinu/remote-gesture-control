/browser-posenet/browser
    - the posenet neural network, running in browser
    - use ./stop_web_server.sh and start_web_server.sh to start a web server on 1234 serving the webpage with the neural network
    - the webpage connects over websocket on port 8181 to the websocket server (/browser-posenet/server) and sends events

/browser-posenet/server
    - the websocket server
    - receives events from all connected web browsers (neural networks) and broadcast them to all clients (/browser-net/client)
    - use stop_server.sh and start_server.sh to start the websocket server on port 8181

/browser-posenet/client
    - the client running on the machine which hosts the presents 
    - generates keypress on the OS level which moves the slides forward / backward
    - use start.sh to start it