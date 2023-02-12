<script lang="ts">
  import type { PageData } from "./$types";
  let number = 0;
  export let data: PageData;
  export let turn: number = 0;
  export let participants: string[] = [""];

  // [TODO] store -> socket.io로 대체. socket 관련 UI 전면 수정 필요

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
{#if turn === -1}
  Game Not Started
  <form method="POST" action="?/startGame">
    <button>start</button>
  </form>
{:else}
  Current Turn: {turn}, {tmp(turn, participants)}'s turn<br />
  Color: {turn === 0
    ? "blue"
    : turn === 1
    ? "red"
    : turn === 2
    ? "yellow"
    : "green"}
{/if}
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
