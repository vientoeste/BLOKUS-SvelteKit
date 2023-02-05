import { writable, type Writable } from 'svelte/store';

interface RoomInfo {
  participants: string[],
  turn: number,
}

// [TODO] 세션 여기서 구현??
export const alertMessage = writable({
  message: '',
});
// [TODO] 동적 변수 할당을 위해 객체 내에 writable을 사용했는데 subscribe가 제대로 되지 않음
export const rooms: Record<string, Writable<RoomInfo>> = {};
