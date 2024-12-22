<script lang="ts">
  import type { ApiResponse, SignInResponse } from "$lib/types";
  import { parseJson, validatePassword, validateUserId } from "$lib/utils";
  import { writable } from "svelte/store";
  import { modalStore, userStore } from "../../Store";
  import Alert from "./Alert.svelte";
  import SignUp from "./SignUp.svelte";
  import { onMount } from "svelte";

  let savedId = writable("");
  onMount(() => {
    $savedId = localStorage.getItem("save") ?? "";
  });

  const submitSignIn = async (event: Event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const userId = data.get("userId")?.toString();
    const password = data.get("password")?.toString();
    if (!userId || !password) {
      return;
    }

    const { message: userIdValidationMessage, isValid: isUserIdValid } =
      validateUserId(userId);
    if (!isUserIdValid) {
      modalStore.open(Alert, {
        title: "invalid user id",
        message: userIdValidationMessage,
      });
      return;
    }

    const { message: passwordValidationMessage, isValid: isPasswordValid } =
      validatePassword(password);
    if (!isPasswordValid) {
      modalStore.open(Alert, {
        title: "invalid user id",
        message: passwordValidationMessage,
      });
      return;
    }

    localStorage.setItem("save", userId);
    $savedId = userId;

    const rawResponse = await fetch(
      (event.currentTarget as HTMLFormElement).action,
      {
        method: "POST",
        body: data,
        credentials: "same-origin",
      },
    );

    const response = parseJson<ApiResponse<SignInResponse>>(
      await rawResponse.text(),
    );
    if (typeof response === "string") {
      modalStore.open(Alert, {
        title: "sign in failed",
        message: "unknown error occured: please try again",
      });
      return;
    }
    const { type, status } = response;
    if (type === "success") {
      if (status !== 201) {
        modalStore.open(Alert, {
          title: "sign in failed",
          message: "unknown error occured: please try again",
        });
        return;
      }
      const { id, userId, username } = response.data;
      if (!id || !userId || !username) {
        modalStore.open(Alert, {
          title: "sign in failed",
          message: "unknown error occured: please try again",
        });
        return;
      }
      localStorage.setItem("id", id);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
      userStore.update(() => ({
        id,
        userId,
        username,
      }));
      modalStore.open(Alert, {
        title: "successfully signed up",
        message: `welcome, ${username}!`,
      });
      return;
    }

    const { error } = response;
    modalStore.open(Alert, {
      title: "sign in failed",
      message: error.message,
    });
  };
</script>

<div id="login-container">
  <div id="login-header">Sign in</div>
  <form action="/api/auth/session" method="post" onsubmit={submitSignIn}>
    <div id="login-body-container" class="row-layout">
      <div id="login-input-container" class="column-layout">
        <div id="login-id-wrapper">
          <input name="userId" bind:value={$savedId} />
        </div>
        <div id="login-pw-wrapper">
          <input name="password" type="password" />
        </div>
      </div>
      <button id="login-submit">submit</button>
    </div>
  </form>
  <div id="login-additionals" class="row-layout">
    <div id="login-save-id" class="row-layout">
      <input
        id="login-save-id-input"
        type="checkbox"
        onload={(e) => {
          const saveId = localStorage.getItem("save");
          if (saveId !== null) {
            e.currentTarget.ariaChecked = "true";
          }
        }}
      />
      <div>save</div>
    </div>
    <div id="register-container">
      <button
        type="button"
        onclick={() => {
          modalStore.open(SignUp);
        }}
      >
        sign up
      </button>
    </div>
  </div>
</div>

<style>
  #login-container {
    width: 350px;
    height: 180px;
    padding-top: 18px;
    padding-bottom: 14px;
    background: #f8f8f9;
    border: 1px #e4e8ec solid;
    padding-left: 8.7%;
    padding-right: 8%;
  }

  #login-additionals {
    margin-top: 10px;
    justify-content: space-between;
  }

  #login-input-container {
    gap: 10px;
  }

  input:not([type="checkbox"]) {
    border: 0;
    width: 176px;
    height: 34px;
    font-size: 16px;
    font-weight: 500;
    word-wrap: break-word;
    border-radius: 0px;
    outline: none;
    padding-left: 10px;
  }
  #login-id-wrapper,
  #login-pw-wrapper {
    width: 100%;
    height: 36px;
    background: white;
    border: 1px #e4e8ec solid;
  }
  #login-save-id {
    gap: 5px;
    color: #9e9e9e;
  }
  #login-save-id-input {
    width: 20px;
    height: 20px;
    background: white;
    appearance: none;
    border: 1px #e4e8ec solid;
  }
  #login-save-id-input:checked {
    background: #303030;
  }

  #login-save-id-input:checked::after {
    display: inline-block;
    width: 20px;
    height: 20px;
    font-size: 15px;
    text-align: center;
    content: "✔";
  }

  #login-submit {
    width: 100px;
    height: 82px;
    background: #606060;
    border: 1px #e4e8ec solid;
  }

  #login-body-container {
    justify-content: space-between;
  }

  #login-header {
    padding-bottom: 10px;
  }

  #register-container {
    color: #606060;
  }

  #register-container button {
    color: #606060;
    background-color: #f8f8f9;
    border: none;
  }
</style>
