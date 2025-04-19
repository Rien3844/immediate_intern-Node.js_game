//전체 유저 목록 및 실격 여부, 클릭 정보 저장
//worker.js에서 오는 메시지 수신

const cluster = require('cluster');
const os = require('os');
const path = require('path');
const {getAllUsers} = require('../logic/userManager.js');
const { access } = require('fs');

//시스템의 CPU 개수 만큼 워커 생성
const numCPUs = os.cpus().length;

for(var i = 0; i < numCPUs; i++){
    //각 워커 별로 worker.js실행
    const worker = cluster.fork();

    //워커가 보낸 메시지를 마스터가 받아서 처리
    worker.on('message', (msg) => {
        if(msg.type === 'logWinner'){
            const allUsers = getAllUsers();
            console.log(`Winner: ${JSON.stringify(winner)}`);
        }
    });
}

cluster.on('exit', (worker, code, signal) => {
    console.log(`[MASTER] Worker ${worker.process.pid} exited`);
});

//우승자 계산 로직
function resolveWinner(allUsers){
    //실격되지 않고, 클릭 수 1회 이상 유저만 필터링
    const valid = allUsers.filter(([_, u]) => !u.disqualified && u.clicks.length > 0);
    if(valid.length === 0){
        return null;
    }

    //클릭 수 내림차순 정렬
    valid.sort((a, b) => {
        const aClicks = a[1].clicks.length;
        const bClicks = b[1].clicks.length;
        //클릭 수 많은 순
        if(aClicks !== bClicks){
            return bClicks - aClicks;
        }
        //클릭 도달 시간 비교
        return a[1].clicks[aClicks -1] - b[1].clicks[bClicks - 1];
    });

    const [userId, data] = valid[0];
    return {
        userId, address: data.address, clicks: data.clicks.length
    };
}