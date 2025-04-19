//회원가입 요청 관리는 다른 곳에서도 쓸 수 있게 HTTP 서버로 만들자고 합니다.
//회원가입 http 서버 생성
const http = require('http');
const { registerUser } = require('../logic/userManager.js');

const PORT = 8080;//포트지정

const server = http.createServer((req, res) => {
    if(req.method === 'POST' && req.url === '/signup') {
        //post요청 받을 빈 문자열 생성
        var body = '';

        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try{
                const { userId, address } = JSON.parse(body);

                //userId나 address가 잘못됫을때 오류 코드 생성
                if(!userId || !address){
                    res.writeHead(400);
                    return res.end('Missing userId or address');
                }

                const result = registerUser(userId, address);

                //회원가입 완료 메시지
                if(result.success){
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: 'Signup successful'}));
                }
                //유저가 이미 회원가입되었을때 메시지
                else{
                    res.writeHead(409);
                    res.end('User already registered');
                }
            }//JSON파싱 오류 발생 시 오류 코드 생성
            catch(e){
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
    }//다른 경로 접근시 404 오류 코드 생성
    else{
        res.writeHead(404);
        res.end('Not Found');
    }
});

//지정된 포트로 서버 실행
server.listen(PORT, () => {
    console.log(`[HTTP] Signup server listening on port ${PORT}.`);
})