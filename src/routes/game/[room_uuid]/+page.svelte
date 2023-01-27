<script lang="ts">
  import { prevent_default } from "svelte/internal";
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<head>
  <link rel="stylesheet" href="/main.css" />
</head>
<br />
<br />
<form method="POST" id="tmp" action="?/putBlock">
  <table style="border: 1px solid rgba(0, 0, 0, 0.267);" class="board">
    {@html data.board}
  </table>
  <input type="hidden" id="row" name="row" value="" />
  <input type="hidden" id="col" name="col" value="" />
</form>
{@html data.block}
