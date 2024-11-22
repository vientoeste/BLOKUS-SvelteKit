import { writable } from 'svelte/store';

interface ModalState {
  isOpen: boolean;
  component: any | null;
  props?: Record<string, any>;
  events?: Record<string, () => void>
}

const createModalStore = () => {
  const { subscribe, set, update } = writable<ModalState>({
    isOpen: false,
    component: null,
    props: {},
    events: {},
  });

  return {
    subscribe,
    open: (component: any, props?: Record<string, any>, events?: { onclose?: () => void }) => {
      set({
        isOpen: true,
        component,
        props,
        events,
      });
    },
    close: () => {
      update(state => {
        if (state.events?.onClose) {
          state.events.onClose();
        }
        return {
          isOpen: false,
          component: null,
          props: {},
          events: {}
        };
      });
    }
  };
}

export const modalStore = createModalStore();
