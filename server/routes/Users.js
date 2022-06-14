const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");

//# 회원가입_3 : 받아온 회원 정보를 db에 저장한다.
router.post("/", async (req, res) => {
  const { username, password } = req.body;
  //# 회원가입_4 : DB에 password를 그냥 저장하면 안되니깐 해싱과 솔팅을 도와주는 bcrypt 라이브러리를 사용하여 비번을 해싱한다.
  bcrypt.hash(password, 10).then((hash) => {
    //# 회원가입_5 : 해싱한 비번을 UsersDB에 저장한다.
    Users.create({
      username: username,
      password: hash,
    });
    //# 회원가입_6 : 회원가입에 성공했다는 메시지를 보내준다. (END)
    res.json("SUCCESS");
  });
});

//# 로그인_3 : client에서 받아온 아이디와 비번을 req.body로 받아온다.
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  //# 로그인_4 : db에서 찾는다
  const user = await Users.findOne({ where: { username: username } });
  //# 로그인_5 : 받아온 아이디가 db에 없으면 에러메시지 전송한다.
  if (!user) res.json({ error: "User Doesn't Exist" });
  //# 로그인_6 : 받아온 아이디가 있으면 이제 비번을 비교한다.
  bcrypt.compare(password, user.password).then(async (match) => {
    //# 로그인_7 : 비번이 틀리면 에러메시지를 전송한다.
    if (!match) res.json({ error: "Wrong Username And Password Combination" });
    //# 로그인_8 : 비번도 일치하면 토큰을 생성한다.
    const accessToken = sign(
      { username: user.username, id: user.id },
      "importantsecret"
    );
    //# 로그인_9 : 토큰 생성후에 토큰과 유저 정보를 client에게 보내준다.
    res.json({ token: accessToken, username: username, id: user.id });
  });
});

router.get("/auth", validateToken, (req, res) => {
  res.json(req.user);
});

router.get("/basicinfo/:id", async (req, res) => {
  const id = req.params.id;

  const basicInfo = await Users.findByPk(id, {
    attributes: { exclude: ["password"] },
  });

  res.json(basicInfo);
});

router.put("/changepassword", validateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await Users.findOne({ where: { username: req.user.username } });

  bcrypt.compare(oldPassword, user.password).then(async (match) => {
    if (!match) res.json({ error: "Wrong Password Entered!" });

    bcrypt.hash(newPassword, 10).then((hash) => {
      Users.update(
        { password: hash },
        { where: { username: req.user.username } }
      );
      res.json("SUCCESS");
    });
  });
});

module.exports = router;
