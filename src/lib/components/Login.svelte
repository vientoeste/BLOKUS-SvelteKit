<div id="login-container">
  <div id="login-header">Sign in</div>
  <form action="?/signIn" method="post">
    <div id="login-body-container" class="row-layout">
      <div id="login-input-container" class="column-layout">
        <div id="login-id-wrapper">
          <input name="id" />
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
      <input id="login-save-id-input" type="checkbox" />
      <div>save</div>
    </div>
    <!-- [TODO] make signup modal for onclick -->
    <div id="register-container">sign up</div>
  </div>
</div>

<style>
  #login-container {
    width: 100%;
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
  #login-submit {
    width: 100px;
    height: 82px;
    background: #606060;
    border: 1px #e4e8ec solid;
  }
  #login-body-container {
    gap: 10px;
  }
  #login-header {
    padding-bottom: 10px;
  }
  #register-container {
    color: #606060;
  }
</style>
