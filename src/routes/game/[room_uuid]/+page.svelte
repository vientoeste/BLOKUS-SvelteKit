<script lang="ts">
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<head>
  <link rel="stylesheet" href="/main.css" />
</head>
<br />
<br />
<table style="border: 10px;">
  {@html data.board}
</table>
