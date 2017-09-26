var express = require('express');
var router = express.Router();

/*
|-------------------
| webSockets
|-------------------
*/

router.ws('/live-session', function(ws, req){
  ws.on('message', function(msg){
    console.log('Got here');
    consold.log(msg);
    ws.send('This is the msg received: ' + msg);
  })
});

module.exports = router;