import { setContext, getContext } from 'svelte';
import type { GamePresentationLayer, GameStateLayer } from './application/facade';
import type { GameManager } from './index';
import { get, readonly, writable, type Readable } from 'svelte/store';

const GAME_CTX_KEY = Symbol('GAME_CTX');

export interface GameContext {
  state: Readable<GameStateLayer>;
  actions: Readable<GameManager>;
  presentation: Readable<GamePresentationLayer>;
}

export class GameContextContainer {
  state = writable<GameStateLayer | undefined>(undefined);
  actions = writable<GameManager | undefined>(undefined);
  presentation = writable<GamePresentationLayer | undefined>(undefined);

  initialize({
    state,
    actions,
    presentation,
  }: {
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

export const useGame = (): GameContext => {
  const container = getContext<GameContextContainer>(GAME_CTX_KEY);
  if (!container) {
    throw new Error('useGame must be used within createGameContext scope');
  }
  const { actions, presentation, state } = container;
  if (
    get(actions) === undefined
    || get(presentation) === undefined
    || get(state) === undefined
  ) {
    throw new Error('Hook useGame is called before initialization');
  }
  return {
    actions: readonly(actions),
    presentation: readonly(presentation),
    state: readonly(state),
  } as GameContext;
};
