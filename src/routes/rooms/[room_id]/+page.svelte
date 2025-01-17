<script lang="ts">
  import { onMount } from "svelte";
  import type { BoardMatrix } from "$lib/types";
  import Board from "$lib/components/Board.svelte";
  import { gameStore, modalStore } from "../../../Store";
  import Alert from "$lib/components/Alert.svelte";
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";
  import { GameManager } from "$lib/game/client";
  import Controller from "$lib/components/Controller.svelte";
  import {
    WebSocketMessageDispatcher,
    WebSocketMessageReceiver,
  } from "$lib/websocket/client";

  const { data: room }: { data: PageData } = $props();

  let socket: WebSocket;
  // [TODO] get board from server if started(that means, logics for reconnected is needed)
  let board: BoardMatrix = Array.from(Array(20), () => {
    const newArr: (number | false)[] = [];
    newArr.length = 20;
    return newArr.fill(false);
  });
  if (
    room.playerIdx === undefined ||
    [0, 1, 2, 3].findIndex((e) => e === room.playerIdx) === -1
  ) {
    modalStore.open(Alert, {
      title: "invalid approach",
      message: "try again please",
    });
    goto("/rooms");
  }
  $gameStore.playerIdx = room.playerIdx as 0 | 1 | 2 | 3;

  let gameManager: GameManager | null = $state(null);
  let messageReceiver: WebSocketMessageReceiver;
  let messageDispatcher: WebSocketMessageDispatcher;
  onMount(() => {
    // [TODO] consider reconnect
    const url = new URL(window.location.href);

    socket = new WebSocket(
      `${url.protocol === "http:" ? "ws" : "wss"}://${url.host}${url.pathname}?idx=${room.playerIdx}`,
    );

    messageReceiver = new WebSocketMessageReceiver(socket);
    messageDispatcher = new WebSocketMessageDispatcher(socket);
    gameManager = new GameManager({
      board,
      turn: room.turn ?? -1,
      playerIdx: $gameStore.playerIdx,
      messageReceiver,
      messageDispatcher,
    });
  });
</script>

<Board
  relayMove={({ position, blockType, rotation, flip }) => {
    // [TODO] send MOVE message when user is in the 'turn' sequence
  }}
  {board}
/>

<Controller startGame={() => gameManager?.startGame()}></Controller>
