import React, { useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthState } = useContext(AuthContext);

  let history = useHistory();

  const login = () => {
    //# 로그인_1 : 아이디와 비번 입력 해서 서버로 전송
    const data = { username: username, password: password };
    axios.post("http://localhost:3001/auth/login", data).then((response) => {
      //# 로그인_10 : 에러메시지를 받아오면 그대로 렌더링한다.
      if (response.data.error) {
        alert(response.data.error);
      } else {
        //# 로그인_11 : 토큰을 받아왔으면 localStorage에 토큰을 저장한다.
        localStorage.setItem("accessToken", response.data.token);
        //# 로그인_12 : 받아온 유저정보로 로그인 상태를 update해준다
        setAuthState({
          username: response.data.username,
          id: response.data.id,
          status: true,
        });
        //# 로그인_13 : 메인페이지로 이동한다.
        history.push("/");
      }
    });
  };
  return (
    <div className="loginContainer">
      <label>Username:</label>
      <input
        type="text"
        onChange={(event) => {
          setUsername(event.target.value);
        }}
      />
      <label>Password:</label>
      <input
        type="password"
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />

      <button onClick={login}> Login </button>
    </div>
  );
}

export default Login;
