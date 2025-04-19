//TCP 연결 처리
//클릭 처리 수신 시 clickProcessor.js 에서 검증

const net = require('net');
const {processClick} = require('../logic/clickProcessor.js');
const { isRegistered, isDisqualified} = require('../logic/userManager.js');

const PORT = 9000;//포트 지정

const server = net.createServer(socket => {
    
    //유저 식별을 위한 별도의 변수 생성
    var userId = null;

    socket.on('data', data => {
        try{
            const message = JSON.parse(data.toString());

            //접속 후 첫 메시지 확인
            if(!userId && message.userId){
                //등록 여부 확인
                if(!isRegistered(message.userId)){
                    socket.write(JSON.stringify({
                        error: 'noet_registered'
                    }));
                    return socket.end();
                }

                //실격 유저 재참여 불가 - 접속 종료 처리
                if(isDisqualified(message.userId)){
                    socket.write(JSON.stringify({
                        error: 'disqualified'
                    }));
                    return socket.end();
                }

                userId = message.userId;
                socket.write(JSON.stringify({
                    message: 'connected'
                }));
                return;
            }

            //클릭 메시지 처리
            if(userId && message.timestamp){
                const timestamp = message.timestamp;

                //clickProcessor에서 클릭 처리
                const result = processClick(userId, timestamp);

                if(!result.valid){
                    socket.write(JSON.stringify({
                        error: result.reason
                    }));
                    return socket.end();
                }

                socket.write(JSON.stringify({
                    message: 'click_registered'
                }));
            }
        }catch(e){
            socket.write(JSON.stringify({
                error: 'invalid_format'
            }));
        }
    });

    socket.on('end', () => {
        console.log(`[TCP] Connection closed: ${userId}`);
    });

    socket.on('error', e => {
        console.error(`[TCP] Socket error:`, e);
    });
});

server.listen(PORT, () => {
    console.log(`[TCP] Worker TCP server listening on port ${PORT}`);
});