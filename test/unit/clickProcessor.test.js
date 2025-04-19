//외부 라이브러리 사용을 하지 않기 위해 테스트에 assert 모듈 사용
const assert = require('assert');
const {registerUser, disqualifyUser, getUser} = require('../../logic/userManager.js');
const {processClick} = require('../../logic/clickProcessor.js');

//테스트 그룹 이름 설정
describe('Click Processor Unit Test', () => {
    // 초기화를 통한 각 테스트 케이스 전에 testUser 새로 등록.
    beforeEach(() => {
        registerUser('testUser', '울산시 동구');
    });

    // 규칙 1 : “1분”은 00초부터 59.999999초를 의미합니다. 시간 범위에 들어오지 않은 클릭은 세지 말아야합니다.
    it('1분이 지난 클릭은 무시되어야 한다', () => {
        // 시작 시각 기록
        processClick('testUser', 0);
        // 61초 후
        const result = processClick('testUser', 61000);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.reason, 'event_ended');
      });
    
    // 규칙 2 : 어떠한 연속된 1초 구간 내에 클릭 횟수가 4회를 초과하면 실격 처리됩니다. 초당 4회를 초과시 부정행위자로 간주하고 누적 클릭량에 관계 없이 실격 처리 됩니다.
    it('1초 내 5회 클릭하면 실격 처리되어야 한다', () => {
        const now = 10000;
        processClick('testUser', now);
        processClick('testUser', now + 100);
        processClick('testUser', now + 200);
        processClick('testUser', now + 300);
        // 5번째
        const result = processClick('testUser', now + 400);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.reason, 'too_fast');
    });

    // 규칙 3 : 첫 클릭은 참여로 간주됩니다.
    it('첫 클릭은 참여로 간주되어야 한다', () => {
        const result = processClick('testUser', 1000);
        assert.strictEqual(result.valid, true);
        const user = getUser('testUser');
        assert.strictEqual(user.joined, true);
        assert.strictEqual(user.clicks.length, 1);
    });

    // 규칙 4 : 참여한 유저가 10초간 클릭하지 않는다면 자동 실격 처리됩니다. 즉, 이후의 요청을 세지 말아야합니다.
    it('10초 이상 클릭이 없으면 실격 처리되어야 한다', () => {
        const now = 20000;
        processClick('testUser', now);
        // 11초 후
        const result = processClick('testUser', now + 11000);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.reason, 'inactive');
    });
});