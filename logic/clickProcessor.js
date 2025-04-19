//클릭 처리

//"1분"은 00초부터 59.999999초를 의미합니다. 시간 범위에 들어오지 않은 클릭은 세지 말아야합니다.
//어떠한 연속된 1초 구간 내에 클릭 횟수가 4회를 초과하면 실격 처리됩니다. 초당 4회를 초과시 부정행위자로 간주하고 누적 클릭량에 관계 없이 실격 처리 됩니다.
//첫 클릭은 참여로 간주됩니다.
//참여한 유저가 10초간 클릭하지 않는다면 자동 실격 처리됩니다. 즉, 이후의 요청을 세지 말아야합니다.

const {getUser, disqualifyUser} = require('./userManager.js');

const MAX_DURATION = 60 * 1000; //1분 = 60000ms
const MAX_CLICKS_IN_1S = 4; // 1초당 최대 클릭 횟수
const MAX_INACTIVE_TIME = 10 * 1000; //10초

function processClick(userId, timestamp){
    const user = getUser(userId);

    if(!user || user.disqualifed){
        return {
            valid: false, reason: 'disqualified'
        };
    }

    //첫 클릭 확인
    if(!user.joined){
        user.joined = true;
        user.startTime = timestamp;
    }

    const elapsed = timestamp - user.startTime;
    //1분 이후 클릭 무시
    if(elapsed > MAX_DURATION){
        return {
            valid: false, reason: 'event_ended'
        };
    }

    //10초 이상 클릭하지 않았는지 검사
    if(user.lastClickTime && timestamp - user.lastClickTime > MAX_INACTIVE_TIME){
        disqualifyUser(userId, 'inactive');
        return {
            valid: false, reason: 'inactive'
        };
    }

    user.clicks.push(timestamp);
    user.lastClickTime = timestamp;

    //슬라이딩 윈도우
    //최근 1초 이내 클릭 횟수 확인
    const recentClicks = user.clicks.filter(t => timestamp - t <= 1000);
    if(recentClicks.length > MAX_CLICKS_IN_1S){
        disqualifyUser(userId, 'too_fast');
        return {
            valid: false, reason: 'too_fast'
        };
    }

    return {valid: true};
}