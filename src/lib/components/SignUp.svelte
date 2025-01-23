<script lang="ts">
  import type { ApiResponse, CreateUserResponse } from "$types";
  import {
    isFormDataFieldsValid,
    parseJson,
    validatePassword,
    validateUserId,
    validateUsername,
  } from "$lib/utils";
  import { modalStore } from "../../Store";

  const submitSignUp = async (event: Event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const userId = data.get("userId")?.toString();
    const username = data.get("username")?.toString();
    const password = data.get("password")?.toString();
    const passwordCheck = data.get("password-check")?.toString();

    if (!userId || !username || !password || !passwordCheck) {
      return;
    }

    if (password !== passwordCheck) {
      alert("password is not equal");
    }

    if (
      !isFormDataFieldsValid(data, [
        "userId",
        "username",
        "password",
        "password-check",
      ])
    ) {
      alert("check the sign up form: corrupted");
      return;
    }

    const { message: userIdValidationMessage, isValid: isUserIdValid } =
      validateUserId(userId);
    if (!isUserIdValid) {
      // [TODO] convert to nested modal
      alert(`Invalid user id: ${userIdValidationMessage}`);
      return;
    }

    const { message: usernameValidationMessage, isValid: isUsernameValid } =
      validateUsername(username);
    if (!isUsernameValid) {
      // [TODO] convert to nested modal
      alert(`Invalid username: ${usernameValidationMessage}`);
      return;
    }

    const { message: passwordValidationMessage, isValid: isPasswordValid } =
      validatePassword(password);
    if (!isPasswordValid) {
      // [TODO] convert to nested modal
      alert(`Invalid password: ${passwordValidationMessage}`);
      return;
    }

    const rawResponse = await fetch(
      (event.currentTarget as HTMLFormElement).action,
      {
        method: "POST",
        body: data,
        credentials: "same-origin",
      },
    );
    const response = parseJson<ApiResponse<CreateUserResponse>>(
      await rawResponse.text(),
    );
    if (typeof response === "string") {
      alert(`unknown error occured: please try again(${response})`);
      return;
    }
    const { type, status } = response;
    if (type === "failure") {
      alert(response.error.message);
      return;
    }
    alert(
      `welcome, ${username}! Please sign in again with the form beside for security.`,
    );
    modalStore.close();
  };
</script>

<div class="signup-form">
  <h2>Sign Up</h2>
  <form action="api/users" onsubmit={submitSignUp}>
    <div class="form-group">
      <label for="userId">user id</label>
      <input type="text" id="userId" name="userId" required />
    </div>
    <div class="form-group">
      <label for="username">username</label>
      <input type="text" id="username" name="username" required />
    </div>
    <div class="form-group">
      <label for="password">password</label>
      <input type="password" id="password" name="password" required />
    </div>
    <div class="form-group">
      <label for="password">password-check</label>
      <input type="password" id="password" name="password-check" required />
    </div>
    <button type="submit">가입하기</button>
  </form>
</div>
