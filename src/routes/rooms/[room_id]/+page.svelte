<script lang="ts">
  import { onMount } from "svelte";
  import type {
    BoardMatrix,
    CancelReadyMessage,
    ConnectedMessage,
    ErrorMessage,
    LeaveMessage,
    MoveMessage,
    ReadyMessage,
    ReportMessage,
    StartMessage,
    WebSocketMessage,
  } from "$lib/types";
  import Board from "$lib/components/Board.svelte";
  import { parseJson } from "$lib/utils";
  import { putBlockOnBoard } from "$lib/game";
  import { gameStore, modalStore } from "../../../Store";
  import Alert from "$lib/components/Alert.svelte";
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";

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

  const startTurn = () => {
    // [TODO] wait for user input
    // [TODO] push move to local board and to server
  };

  const ready = () => {
    // [TODO] throttle
    const message: ReadyMessage = {
      type: "READY",
      playerIdx: $gameStore.playerIdx,
    };
    socket.send(JSON.stringify(message));
  };

  const cancelReady = () => {
    // [TODO] throttle
    const message: CancelReadyMessage = {
      type: "CANCEL_READY",
      playerIdx: $gameStore.playerIdx,
    };
    socket.send(JSON.stringify(message));
  };

  class WebSocketMessageHandler {
    private handleUserConnected({
      id,
      userId,
      username,
      playerIdx,
    }: ConnectedMessage) {
      throw new Error("not implemented");
    }

    private handleUserLeave({ playerIdx }: LeaveMessage) {
      throw new Error("not implemented");
    }

    private handleReady({ playerIdx }: ReadyMessage) {
      throw new Error("not implemented");
    }

    private handleCancelReady({ playerIdx }: CancelReadyMessage) {
      throw new Error("not implemented");
    }

    private handleMove({
      block,
      flip,
      playerIdx,
      position,
      rotation,
    }: MoveMessage) {
      const reason = putBlockOnBoard({
        board,
        blockInfo: {
          type: block,
          rotation: (rotation % 4) as 0 | 1 | 2 | 3,
          flip,
        },
        playerIdx,
        position,
        turn: ++$gameStore.turn,
      });
      if (!reason) {
        return;
      }
      modalStore.open(Alert, {
        title: "inproper move detected",
        message: `reporting to server<br>cause: ${reason}`,
      });
      const message: ReportMessage = {
        type: "REPORT",
        block,
        flip,
        playerIdx: $gameStore.playerIdx,
        position,
        rotation,
        turn: $gameStore.turn,
        // [TODO] check the saved board to clarify the move is proper
      };
      socket.send(JSON.stringify(message));
    }

    private handleStart({}: StartMessage) {
      if (!$gameStore.isStarted) {
        $gameStore.turn = 0;
        return;
      }
      modalStore.open(Alert, {
        title: "someone started game again",
        message: "reporting abusing",
      });
    }

    private handleError({ cause }: ErrorMessage) {
      modalStore.open(Alert, {
        title: "error occured",
        message: cause,
      });
    }

    handleMessage(message: WebSocketMessage) {
      switch (message.type) {
        case "LEAVE":
          this.handleUserLeave(message);
          break;
        case "READY":
          this.handleReady(message);
          break;
        case "CANCEL_READY":
          this.handleCancelReady(message);
          break;
        case "MOVE":
          this.handleMove(message);
          if ($gameStore.playerIdx === $gameStore.turn % 3) {
            startTurn();
          }
          break;
        case "START":
          this.handleStart(message);
          break;
        case "CONNECTED":
          this.handleUserConnected(message);
          break;
        case "REPORT":
          // client NEVER receive this event
          break;
        case "ERROR":
          this.handleError(message);
          break;
        default:
          modalStore.open(Alert, {
            title: "received unknown message",
            message,
          });
          break;
      }
    }
  }

  onMount(() => {
    // [TODO] consider reconnect
    const url = new URL(window.location.href);

    socket = new WebSocket(
      `${url.protocol === "http:" ? "ws" : "wss"}://${url.host}${url.pathname}`,
    );
    const webSocketMessageHandler = new WebSocketMessageHandler();

    socket.onmessage = (e) => {
      const message = parseJson<WebSocketMessage>(e.data);
      if (typeof message === "string") {
        return;
      }
      webSocketMessageHandler.handleMessage(message);
    };
  });
</script>

<Board
  relayMove={({ position, blockType, rotation, flip }) => {
    // [TODO] send MOVE message when user is in the 'turn' sequence
  }}
  {board}
/>
