function setupSignInWindow(){
    $('#sign-in-window').load('client/assets/views/sign-in.html', () => {
        $('#SignInModal').modal({backdrop: 'static', keyboard: false}).modal('show');
        $('#send_account').click(() => {
            const _address = $('input[name="account"]').val();
            $('#address').html(_address)
            oi.emit('send_address', _address);
        });
    });
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip();
    setupSignInWindow();

    // SCREEN ELEMENTS
    handleClick = function(e){
        let el = e.currentTarget;
        let value = $(el).attr('data-value');
        $('.btn-bet').removeClass('btn-success').addClass('btn-outline-secondary');
        $(e.currentTarget).removeClass('btn-outline-secondary').addClass('btn-success');
        $('.btn-send').removeClass('disabled').removeClass('btn-outline-danger').addClass('btn-danger').attr('data-original-title', "Place Wager of "+ value + " CSC");
        console.log(value);
        console.log('%c Wager Changed to: '+ value, 'background: #222; color: #bada55');
    }
    $('.btn-bet').click(function(e){
        handleClick(e);
    });

     handleClickSend = function(e){

        let value = $('.btn-bet.btn-success').attr('data-value');
        if (!value) return;
        console.log('%c Wager Placed as: '+ value, 'background: #222; color: #ff2555');
        console.log('%c Preparing Transaction for signature.', 'background: #222; color: grey');
        oi.emit('place_wager', value);
    }

    $('.btn-send').click(function(e){
        handleClickSend(e)
    });

    $('.btn-sign').click(function(e){
        let signature = $('input.signature').val();

        console.log('%c Signed Transaction '+signature+'', 'background: #222; color: grey');
        oi.emit('submit_secret',[$('textarea').text(),signature]);
        $('#exampleModalCenter').modal('hide');
    });

    // SOCKETS

    oi = io();
    oi.on('submit_response', result => {
        console.log('submit_response', result);
        if (result == true){ disableBet(); }
    });
    oi.on('balance', balance => {
        $('#SignInModal').modal('hide');
        $('#balance').html(balance);
    });
    oi.on('connect', function(socket){
        console.log('Connection to Server Established.');
    });
    oi.on('prepared_tx', function(rx){
        console.log(rx);
        $('textarea').text(rx)
        $('#exampleModalCenter').modal('show');
    });
    oi.on('outcome', function(rx){
        console.log(rx);
        spinCols(rx);
    });
  
    /// Slot Machine
  
    function ITEM (x, y, type){
        
        var item = new createjs.Shape();
        item.graphics.beginFill(type).drawRect(0, 0, 100, 100);
        item.y = stage.canvas.height/2 - 50;
        return item;
    }


    stage = new createjs.Stage("demoCanvas");

    function addItemToCol(col, type){
        let item = new ITEM(0, null, type);
        item.colorType = type;
        if (col == 0){
        item.x = 100;
        }
        else if (col == 1){
        item.x = stage.canvas.width/2 - 50;
        }
        else {
        item.x = stage.canvas.width - 200;
        }
        item.y += -cols[col].length * 150;
        cols[col].push(item);
        stage.addChild(item);
    }


    addItemToCol(0, 'green');
    addItemToCol(0, 'gold');
    addItemToCol(0, 'blue');
    addItemToCol(0, 'orange');
    addItemToCol(0, 'yellow');
    addItemToCol(1, 'green');
    addItemToCol(1, 'gold');
    addItemToCol(1, 'blue');
    addItemToCol(1, 'orange');
    addItemToCol(1, 'yellow');
    addItemToCol(2, 'green');
    addItemToCol(2, 'gold');
    addItemToCol(2, 'blue');
    addItemToCol(2, 'orange');
    addItemToCol(2, 'yellow');

        
        createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", handleTick);
    });
    
var cols = [
        [],
        [],
        []
    ];

velocities = [15,10,5];
var spinning = [false, false, false];
goals = ['DeepSkyBlue', 'DeepSkyBlue', 'DeepSkyBlue'];

function spinCol(col){
    let flag = false;
        for (let index = 0; index < cols[col].length; index++) {
        const element = cols[col][index];
        element.y+=velocities[col];
        if (element.y > stage.canvas.height){
            element.y+= - cols[col].length * 150;
        }
        if (velocities[col] < 0.99) {
            velocities[col] = 1;
        }
        let distance = element.y - (stage.canvas.height/2 - 50);
        if (velocities[col] < 1 && Math.abs(distance) < 1 && goals[col] == element.colorType){
            console.log(distance)
            stopped++;
            flag = true;
        }
        }
        if (flag){
        spinning[col] = false;
        }
        if (stopped == 3){
            enableBet();
        }
        velocities[col] = velocities[col]*(.999)
        velocities[col] = velocities[col]*(.999)
        velocities[col] = velocities[col]*(.999)

    }

    function disableBet(){
        $('.btn-bet').off()
        $('.btn-send').off()
    }
    function enableBet(){
        $('.btn-bet').click(function(e){
            handleClick(e)
        })
        $('.btn-send').click(function(e){
            handleClickSend(e)
        })
    }
    
  
function handleTick(){
    for (let index = 0; index < spinning.length; index++) {
        const element = spinning[index];
        if (element == false) continue;
        spinCol(index)
    }
    stage.update();
}
stopped = 3;
function spinCols(g){
    stopped = 0;

    disableBet();
    function randV(){
        return Math.floor(Math.random()*10 + 5);
    }
    velocities = [randV(), randV(), randV()];
    goals = g;
    spinning = [true, true, true];
    console.log(velocities);
}