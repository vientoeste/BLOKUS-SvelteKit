/**
 * TEST GUIDE
 * 1. constructor
 * 2. sub/unsub -> publish availability
 * 3. sub -> multi-pubsub availability
 * 4. sub -> is availale for each events
 * 5. once -> pub
 * 6. once -> pub -> pub
 * 7. pub -> payload test
 * 8. pub -> unavailable event test
 * 9. removeAllListeners -> remove A works?
 * 10. removeAllListeners -> remove A then B works?
 * 11. removeAllListeners -> non-param call works?
 * 엣지 케이스 및 복합 시나리오
 * 시나리오 1: 리스너 내부에서 이벤트 발행
 *  테스트 내용: 이벤트 리스너가 실행되는 도중 다른 이벤트를 publish 할 때, 이벤트 처리 순서가 예상대로 동작하는지 확인합니다 (재귀 호출 또는 동시성 문제).
 *    리스너 A가 실행되면서 이벤트 X를 발행하고, 이벤트 X의 리스너가 실행 완료된 후 리스너 A의 나머지 부분이 실행되는지 확인.
 * 시나리오 2: 에러 핸들링
 *   테스트 내용: 리스너 함수 내에서 오류가 발생했을 때, 이것이 EventBus의 다른 리스너나 애플리케이션 전체에 미치는 영향을 확인합니다.
 *     리스너 중 하나가 에러를 throw 할 때, 다른 리스너들은 계속 실행되는지 확인 (현재 EventEmitter는 기본적으로 에러를 잡지 않으면 프로세스 종료).
 *     'error' 이벤트를 구독하여 리스너 내부 에러를 처리하는 시나리오를 테스트합니다.
 * 시나리오 3: 비동기 리스너 동작
 *   테스트 내용: async 콜백 함수나 Promise를 반환하는 콜백 함수를 리스너로 사용할 때, EventBus의 동작에 문제가 없는지 확인합니다. (EventEmitter는 기본적으로 리스너의 반환값을 기다리지 않음. 이 동작이 의도된 것인지 확인).
 * 시나리오 4: 경쟁 조건 (Race Conditions)
 *   테스트 내용: 이벤트 구독, 발행, 해지 작업이 거의 동시에 이루어질 때 발생하는 경쟁 조건이 올바르게 처리되는지 확인합니다 (예: 이벤트 발행 직전에 리스너 해지).
 */