<script lang="ts">
  import type { PageData } from "./$types";
  let number = 0;
  export let data: PageData;
</script>

<head>
  <link rel="stylesheet" href="/main.css" />
</head>
<br />
<br />
<form method="POST" id="tmp" action="?/putBlock">
  <button formaction="?/removeRoom">d</button>
  <div class="container" id="container">
    <div class="board" id="board">
      <table style="border: 1px solid rgba(0, 0, 0, 0.267);">
        {@html data.board}
      </table>
      <button>submit</button>
    </div>
    <div class="valueField" id="valueField">
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
      <input type="hidden" id="player" name="player" value="a" />
    </div>
    <div class="blocks" id="blocks">
      {@html data.block}
    </div>
  </div>
</form>
