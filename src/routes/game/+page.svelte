<script lang="ts">
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<h2>Rooms</h2>

{@html data.queryRes}
