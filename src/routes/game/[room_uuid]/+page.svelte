<script lang="ts">
  import type { PageData } from "./$types";
  import { io } from "$lib/socket.io/game";
  import { onMount } from "svelte";

  const changeMode = () => {
    document.getElementById("notStarted")?.remove();
    const startedBlock = document.getElementById("started");
    if (startedBlock) {
      startedBlock.style.display = "";
    }
  };
  // [TODO] socket.io-client works strangely
  onMount(() => {
    // [CHECK] Does socket.on('customEvent') not work on +page.svelte?
    io.on("startGame", (e) => {
      console.log("emitted");
      console.log(e);
      changeMode();
    });
  });
  console.log("tmp");
  export let data: PageData;
  let number = 0;
  export let turn: number = -1;
  export let participants: string[] = [""];
  function emitStartGame() {
    io.emit("startGame", "data"); // on server-side, works well but on client-side seems doesn't work
  }
  // [TODO] ws를 통해 보드 밸류 등 수정

  const tmp = (turn: number, participants: string[]) => {
    switch (participants.length) {
      case 1:
        return participants[0];
      case 2:
        return participants[turn % 2];
      case 3:
        if (turn % 4 === 3) {
          return participants[Math.floor(turn / 4) % 3];
        }
        return participants[turn % 4];
      case 4:
        return participants[turn % 4];
    }
  };
</script>

<head>
  <link rel="stylesheet" href="/main.css" />
</head>
<br />
<br />
<!-- {#if turn === -1} -->
<div id="notStarted">
  Game Not Started
  <form action="#" on:submit|preventDefault={emitStartGame}>
    <button type="submit">start</button>
  </form>
</div>
<!-- {:else} -->
<div id="started" style="display: none;">
  <title>Game Started</title>
  Current Turn: {turn}, {tmp(turn, participants)}'s turn<br />
  Color: {turn === 0
    ? "blue"
    : turn === 1
    ? "red"
    : turn === 2
    ? "yellow"
    : "green"}
</div>
<!-- {/if} -->
<br />Participants: {participants}
<form method="POST" id="tmp" action="?/putBlock">
  <div class="container" id="container">
    <div class="board" id="board">
      <table style="border: 1px solid rgba(0, 0, 0, 0.267);">
        {@html data.board}
      </table>
      <button>submit</button>
      <table class="inputs">
        <tr>
          <th>col</th>
          <td><input type="text" id="col" name="col" value="" readonly /></td>
        </tr>
        <tr>
          <th>row</th>
          <td><input type="text" id="row" name="row" value="" readonly /></td>
        </tr>
        <tr>
          <th>block</th>
          <td
            ><input
              type="text"
              id="block"
              name="block"
              value=""
              style="width:160%"
              readonly
            /></td
          >
        </tr>
        <tr>
          <th>rotation</th>
          <td
            ><input
              id="rotation"
              name="rotation"
              type="text"
              value={number}
            /><button
              on:click={(event) => {
                number++;
                number = number % 4;
                event.preventDefault();
              }}>+</button
            ></td
          >
        </tr>
        <tr>
          <th>flip</th>
          <td
            ><input
              type="checkbox"
              id="flip"
              name="flip"
              value=""
              style="width:20px;height:20px;"
            /></td
          >
        </tr>
      </table>
      <input
        type="hidden"
        id="player"
        name="player"
        value={turn === 0 ? "a" : turn === 1 ? "b" : turn === 2 ? "c" : "d"}
      />
      <button formaction="?/removeRoom">remove this room</button>
    </div>
    <div class="blocks" id="blocks">
      {@html data.block}
    </div>
  </div>
</form>
