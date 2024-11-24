<script lang="ts">
  import { onMount } from "svelte";
  import { getUserInfoFromLocalStorage } from "$lib/utils";
  import { modalStore, userStore } from "../Store";
  import Alert from "$lib/components/Alert.svelte";

  onMount(() => {
    const user = getUserInfoFromLocalStorage(localStorage);
    $userStore = {
      id: user.id ?? undefined,
      userId: user.userId ?? undefined,
      username: user.username ?? undefined,
    };
    return;
  });

  const submitSignOut = async (event: Event) => {
    event.preventDefault();
    const response = await fetch(
      (event.currentTarget as HTMLFormElement).action,
      {
        method: "DELETE",
      },
    );
    if (response.status !== 204) {
      modalStore.open(Alert, {
        title: "sign out failed",
        message: "unknown error occured: please try again.",
      });
      return;
    }
    modalStore.open(Alert, {
      title: "successfully signed out",
      message: "see you next!",
    });

    userStore.update(() => ({
      id: undefined,
      userId: undefined,
      username: undefined,
    }));
    localStorage.removeItem("id");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
  };
</script>

{#if $userStore.id !== undefined}
  <h1>Welcome, {$userStore.username}!</h1>
  <form action="api/auth/session" onsubmit={submitSignOut}>
    <button type="submit">sign out</button>
  </form>
{:else}
  <h1>Welcome to Blokus!</h1>
  <p>
    You have to sign in first. <br />
    If you don't have an account, sign in first using the form beside.
  </p>
{/if}
<br />
<br />
