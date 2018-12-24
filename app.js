/**
 * @title  BitSlots
 * @author Joshua Caputo
 * @dev    This file starts the server.
 */

const ACCOUNTS = {
  server: '',
  server_secret: ''
}
var _require = require('casinocoin-libjs-address-codec'),
isValidAddress = _require.isValidAddress;
var txids = [];

const express = require('express');
var app = express();
var serv = require('http').Server(app);
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

const CasinocoinAPI = require('casinocoin-libjs').CasinocoinAPI;
const api = new CasinocoinAPI({
  server: 'wss://ws01.casinocoin.org:4443',
});
const isValidSecret = (CasinocoinAPI['_PRIVATE'].ledgerUtils.common.isValidSecret);
console.log(isValidSecret(ACCOUNTS.server_secret))
api.on('error', (errorCode, errorMessage) => {
  console.log(errorCode + ': ' + errorMessage);
});
api.on('connected', () => {
  console.log('Connected to CasinoCoin')
});
api.on('disconnected', (code) => {
  // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
  // will be 1000 if this was normal closure
  console.log('disconnected, code:', code);
});

api.connect().then(() => {
  init_game_server();
});


const init_game_server = () => {
  var io = require('socket.io')(serv);
  io.on('connection', function(socket){
      console.log('a user connected');
      socket.on('place_wager', (rx) => {
        console.log('a user is wagering:' + rx);
        generate_tx(socket, rx)
      })
      socket.on('submit_signature', (rx) => {
        console.log('a user is signing:' + rx);
        return api.submit(rx)
  .then(result => {
    console.log(result)
  }).catch(error => {
    console.log(error)
  });
      })
      socket.on('submit_secret', (data) => {
        console.log('a user is secreting:' + data);
        if (!isValidSecret(data[1])) return;
        var signed = ( api.sign(data[0], data[1]));
        console.log(signed)
        return api.submit(signed.signedTransaction)
          .then(result => {
            if (result.resultCode == 'tesSUCCESS'){
              txids.push([socket,signed.id,false]);
              console.log('submitted successfully');
              socket.emit('submit_response', true);
            }
          }).catch(error => {
            console.log(error);
            socket.emit('submit_response', false);
          });
      })
      socket.on('send_address', address => {
        console.log(address)
        if (!isValidAddress(address)) return;
        socket.CSCADDRESS = address;
        sendBalance(socket);
      })
      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
    });
  
  serv.listen(process.env.PORT || 2000);
  console.log('Game Server Online');
  setInterval(() => {
    handleTick();
  }, 1000);
}

function sendBalance(socket){
  
  return api.getAccountInfo(socket.CSCADDRESS).then(info => {
    console.log(info.cscBalance)
    socket.emit('balance', info.cscBalance);
  }).catch(error => {
    console.log(error)
  });
}

const generate_tx = (socket, amt) => {
  console.log('preparing transaction');
      const payment = {
        "source": {
          "address": socket.CSCADDRESS,
          "maxAmount": {
            "value": amt,
            "currency": "CSC",
            "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
          }
        },
        "destination": {
          "address": ACCOUNTS.server,
          "amount": {
            "value": amt,
            "currency": "CSC",
            "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
          }
        }
      };
      return api.preparePayment(socket.CSCADDRESS, payment).then(prepared => {
        console.log('tx prepared')
        console.log(prepared)
        socket.emit('prepared_tx', prepared.txJSON);
      });
}

function handleTick(){
  newtx = [];
  if (txids.length > 0){
    console.log(txids)
    for (let index = 0; index < txids.length; index++) {
      const element = txids[index];
      
      if (element[2] == false){
        newtx.push(element);
      }
      else {
        continue;
      }
      verifyTransaction(element);
    }
  }
  txids = newtx;
}


/* Verify a transaction is in a validated CSC Ledger version */
function verifyTransaction(hash, options) {
  console.log('Verifing Transaction');
  return api.getTransaction(hash[1], options).then(data => {
    console.log(hash[1])
    if (data.outcome.result === 'tesSUCCESS'){
      //sendBalance(hash[0].CSCADDRESS)
      hash[0].emit('outcome', generateOutcome(data.outcome.deliveredAmount, hash[0]));
      hash[2] = true;

    }
    return true;
  }).catch(error => {
    console.log('tx not found', error)
  });
}

var outcomes = [
  {
    color: 'yellow',
    payout: 1.5,
    chance:2
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'gold',
    payout: 5,
    chance:20
  },
  {
    color: 'blue',
    payout: 2,
    chance:5
  },
  {
    color: 'orange',
    payout: 3,
    chance:10
  },
  {
    color: 'orange',
    payout: 3,
    chance:10
  },
  {
    color: 'orange',
    payout: 3,
    chance:10
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'green',
    payout: 1,
    chance: 1
  },
  {
    color: 'yellow',
    payout: 1.5,
    chance:2
  },
  {
    color: 'gold',
    payout: 5,
    chance:20
  },
]


function generateOutcome(winning, winner){
  function randO(){
    return Math.floor(Math.random()*outcomes.length);
  }
  function randA(){
    return Math.floor(1 + Math.random()*(outcomes.length-1));
  }
  function randB(){
    return Math.floor(Math.random()*(outcomes.length-1));
  }
  var ites = [outcomes[randO()].color,outcomes[randO()].color,outcomes[randO()].color];

  if (ites[0] == ites[1]){
    if (ites[1] == ites[2]){
      console.log(ites[0])
      var c = 0;
      for (a in outcomes){
        c++;
        let out = outcomes[a];
        if (out.color == ites[0]){
          console.log('existed', outcomes[c-1].chance)
          if (Math.random()*outcomes[c-1].chance < 1){
            let winnings = outcomes[c-1].chance * winning;
            console.log('winner', winnings);
            payout(winner, winnings)
          }
          else {
            ites[Math.floor(Math.random()*outcomes.length)] = randO();
            console.log('almost won');
          }
        }
      }
    }
  }

  return ites;
}

function payout(destination, amount){
  amount = amount.toString();
  console.log('preparing transaction');
      const payment = {
        "source": {
          "address": ACCOUNTS.server,
          "maxAmount": {
            "value": amount,
            "currency": "CSC",
            "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
          }
        },
        "destination": {
          "address": destination,
          "amount": {
            "value": amount,
            "currency": "CSC",
            "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
          }
        }
      };
      return api.preparePayment(ACCOUNTS.server, payment).then(prepared => {
        console.log('tx prepared')
        console.log(prepared)
        let signed = api.sign(prepared.txJSON, ACCOUNTS.server_secret);
        console.log(signed)
        return api.submit(signed.signedTransaction).then(result => {
          console.log(result)
        });
      });
}
