//유저 정보 관리
const users = new Map();

function registerUser(userId, address){
    if(users.has(userId)){
        return {success: false, reason: 'already_registered'};
    }//가입된 유저인지 체크

    users.set(userId, {
        address,
        clicks: [], // 클릭 타임스탬프를 저장할 배열
        disqualified: false, // 실격 여부
        lastClickTime: null, // 마지막 클릭 시간
        joined: false, // 이벤트 참여 여부
    });

    return { success: true};
}//회원 등록

function getUser(userId){
    return users.get(userId);
}//유저 정보 전체 조회

function isRegistered(userId){
    return users.has(userId);
}//유저 등록 여부 확인

function disqualifyUser(userId, reason = ''){
    const user = users.get(userId);
    if(user){
        user.disqualified = true;
        user.reason = reason;
    }
}//유저 실격 처리 및 실격 사유 저장

function isDisqualified(userId){
    const user = users.get(userId);
    return user?.disqualified | false;
}// 유저 실격 처리 여부 확인

function getAllUsers(){
    return Array.from(users.entries());
}//전체 유저 정보 출력 및 우승자 계산

module.exports = {
    registerUser, getUser, isRegistered, disqualifyUser, isDisqualified, getAllUsers,
};//모듈 추출