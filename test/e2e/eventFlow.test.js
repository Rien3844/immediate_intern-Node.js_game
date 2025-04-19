const http = require('http');
const net = require('net');
const assert = require('assert');

//회원가입 테스트
function signup(userId, address, callback){
    const data = JSON.stringify({
        userId, address
    });

    const req = http.request({
        hostname: 'localhost',
        port: 8080,
        path: '/signup',
        method: 'PORT',
        headers: {
            'Content-Type': 'application/json',
            'Contetnt-Length': data.length
        }
    }, res => {
        assert.strictEqual(res.statusCode, 200);
        callback();
    });

    req.write(data);
    req.end();
}

//TCP 클릭 테스트
function tcpClient(userId, timestamps, done){
    const client = net.connect({
        port: 9000
    }, () => {
        client.write(JSON.stringify({
            userId
        }));
    });

    var step = 0;
    client.on('data', data => {
        const msg = JSON.parse(data.toString());

        if(msg.error){
            client.end();
            return done(new Error(`Failed: ${msg.error}`));
        }

        if(msg.message === 'connected'){
            timestamps.forEach(t, i => {
                setTimeout(() => {
                    client.write(JSON.stringify({
                        timestamp: t
                    }));
                    if(i === timestamps.length -1){
                        setTimeout(() => client.end(), 200);
                    };
                }, i * 100);
            });
        }
    });

    client.on('end', () => done());
    client.on('error', err => done(err));
}

// 테스트 실행
signup('winner', '울산 동구', () =>{
    const now = Date.now();
    tcpClient('winner', [now, now + 100, now + 200, now + 300], (err)=> {
        if(err){
            throw err;
        }
        console.log('[E2E] Test compvared successfully');
    });
});