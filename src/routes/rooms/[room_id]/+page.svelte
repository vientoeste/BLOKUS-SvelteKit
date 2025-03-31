<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Alert from "$lib/components/Alert.svelte";
  import Board from "$lib/components/Board.svelte";
  import Controller from "$lib/components/Controller.svelte";
  import Players from "$lib/components/Players.svelte";
  import {
    BlockPlacementValidator,
    GameManager_Legacy,
  } from "$lib/game/client.svelte";
  import {
    WebSocketMessageDispatcher,
    WebSocketMessageReceiver,
  } from "$lib/websocket/client";
  import { blockStore, gameStore, modalStore } from "../../../Store";
  import type {
    BoardMatrix,
    ParticipantInf,
    PlayerIdx,
    Rotation,
    SubmitMoveDTO,
  } from "$types";
  import type { PageData } from "./$types";
  import { getPlayersSlot } from "$lib/utils";

  const { data }: { data: PageData } = $props();
  const { room, playerIdx, roomCache, moves } = data;

  let socket: WebSocket;
  // [TODO] get board from server if started(that means, logics for reconnected is needed)
  let board: BoardMatrix = Array.from(Array(20), () => {
    const newArr: (number | false)[] = [];
    newArr.length = 20;
    return newArr.fill(false);
  });

  let gameManager: GameManager_Legacy | null = $state(null);
  let messageReceiver: WebSocketMessageReceiver;
  let messageDispatcher: WebSocketMessageDispatcher;
  let blockPlacementValidator: BlockPlacementValidator;

  let players: (ParticipantInf | undefined)[] = $state([]);

  onDestroy(() => {
    gameStore.set({
      isStarted: false,
      mySlots: [],
      playerIdx: 0,
      players: [],
      turn: -1,
    });
    blockStore.set([]);
    socket?.close();
  });

  onMount(async () => {
    // if goto called at the outside of onMount, it would be considered as server-side
    // so 'throw redirect' at client side is unnecessary, just call goto after mounted
    if (
      playerIdx === undefined ||
      [0, 1, 2, 3].findIndex((e) => e === playerIdx) === -1
    ) {
      modalStore.open(Alert, {
        title: "invalid approach",
        message: "try again please",
      });
      goto("/rooms");
    }
    $gameStore.playerIdx = playerIdx as PlayerIdx;
    $gameStore.players = [
      roomCache.p0,
      roomCache.p1,
      roomCache.p2,
      roomCache.p3,
    ];
    $gameStore.isStarted = room.isStarted;
    $gameStore.turn = roomCache.turn;

    // [TODO] consider reconnect
    const url = new URL(window.location.href);

    socket = new WebSocket(
      `${url.protocol === "http:" ? "ws" : "wss"}://${url.host}${url.pathname}`,
    );
    await new Promise<void>((resolve) => {
      socket.addEventListener("open", () => {
        resolve();
      });
    });
    const workerModule = await import(
      "$lib/workers/checkBlockPlaceability.worker?worker"
    );
    const worker = new workerModule.default();

    messageReceiver = new WebSocketMessageReceiver(socket);
    messageDispatcher = new WebSocketMessageDispatcher(socket);
    blockPlacementValidator = new BlockPlacementValidator(worker);
    gameManager = new GameManager_Legacy({
      board,
      gameId: roomCache.gameId,
      turn: roomCache.turn ?? -1,
      playerIdx: $gameStore.playerIdx,
      users: [roomCache.p0, roomCache.p1, roomCache.p2, roomCache.p3],
      messageReceiver,
      messageDispatcher,
      blockPlacementValidator,
    });

    players = gameManager.users;
    if (roomCache.started) {
      $gameStore.mySlots = getPlayersSlot({
        playerIdx: $gameStore.playerIdx,
        players: $gameStore.players,
      });
      gameManager?.restoreGameState(moves);
    }
  });
</script>

<Players
  {players}
  ready={() => {
    gameManager?.ready();
  }}
  unready={() => {
    gameManager?.unready();
  }}
></Players>
<Board
  relayMove={({
    position,
    blockInfo: { type, rotation, flip },
    slotIdx,
  }: SubmitMoveDTO) => {
    gameManager?.submitMove({
      blockInfo: {
        type,
        flip,
        rotation: (rotation % 4) as Rotation,
      },
      slotIdx,
      position,
    });
  }}
  board={gameManager?.board}
/>

<Controller startGame={() => gameManager?.startGame()}></Controller>
