const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) return res.json({ error: "User not logged in!" });

  try {
    //# 게시글(Read)_3 : 받아온 토큰을 복호화 해서 찐토큰인지 검증한다.
    const validToken = verify(accessToken, "importantsecret");
    //# 게시글(Read)_4 : 복호화 했을 때 토큰에 들어있던 정보는 유저 정보가 들어있으므로 이 정보들을 req.user에 담는다.
    req.user = validToken;
    if (validToken) {
      //# 게시글(Read)_5 : 담았으면 다음 next함수를 실행시켜 Posts.js로 돌아간다.
      return next();
    }
  } catch (err) {
    return res.json({ error: err });
  }
};

module.exports = { validateToken };
