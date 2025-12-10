import { setContext, getContext } from 'svelte';
import type { GamePresentationLayer, GameStateLayer } from './application/facade';
import type { GameManager } from './index';
import { writable } from 'svelte/store';

const GAME_CTX_KEY = Symbol('GAME_CTX');

export class GameContextContainer {
  state = writable<GameStateLayer | undefined>(undefined);
  actions = writable<GameManager | undefined>(undefined);
  presentation = writable<GamePresentationLayer | undefined>(undefined);

  initialize({ state, actions, presentation }: {
    state: GameStateLayer;
    actions: GameManager;
    presentation: GamePresentationLayer;
  }) {
    this.state.set(state);
    this.actions.set(actions);
    this.presentation.set(presentation);
  }
}

export const createGameContext = () => {
  const container = new GameContextContainer();
  setContext(GAME_CTX_KEY, container);
  return container;
};

export const useGame = () => {
  const container = getContext<GameContextContainer>(GAME_CTX_KEY);
  if (!container) {
    throw new Error('useGame must be used within createGameContext scope');
  }
  return container;
};
