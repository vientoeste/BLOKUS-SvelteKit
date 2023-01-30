import { writable, type Writable } from 'svelte/store';

// [TODO] 세션 여기서 구현??
export const alertMessage = writable({
  message: '',
});
export const rooms: Record<string, Writable<Record<string, string>>> = {};
