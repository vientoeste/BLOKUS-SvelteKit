<script lang="ts">
  import { onMount } from "svelte";
  import { getUserInfoFromLocalStorage, parseJson } from "$lib/utils";
  import { modalStore, userStore } from "../Store";
  import Alert from "$lib/components/Alert.svelte";
  import type { ApiResponse, SignOutResponse } from "$lib/types";

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
    const rawResponse = await fetch(
      (event.currentTarget as HTMLFormElement).action,
      {
        method: "DELETE",
      },
    );
    const response = parseJson<ApiResponse<SignOutResponse>>(
      await rawResponse.text(),
    );
    if (typeof response === "string") {
      modalStore.open(Alert, {
        title: "sign out failed",
        message: "unknown error occured: please try again.",
      });
      return;
    }
    const { type, status } = response;
    if (type === "failure") {
      modalStore.open(Alert, {
        title: "sign out failed",
        message: response.error.message,
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
