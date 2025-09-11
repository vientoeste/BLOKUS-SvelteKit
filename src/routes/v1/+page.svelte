<script lang="ts">
  import { onMount } from "svelte";
  import { getUserInfoFromLocalStorage } from "$lib/utils";
  import { userStore } from "$lib/store";

  onMount(() => {
    const user = getUserInfoFromLocalStorage(localStorage);
    $userStore = {
      id: user.id ?? undefined,
      userId: user.userId ?? undefined,
      username: user.username ?? undefined,
    };
    return;
  });
</script>

{#if $userStore.id !== undefined}
  <h1>Welcome, {$userStore.username}!</h1>
{:else}
  <h1>Welcome to Blokus!</h1>
  <p>
    You have to sign in first. <br />
    If you don't have an account, sign in first using the form beside.
  </p>
{/if}
<br />
<br />
