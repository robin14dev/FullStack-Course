const express = require("express");
const router = express.Router();
const { Likes } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");

//# 좋아요(Create)_3 : 토큰 검증
router.post("/", validateToken, async (req, res) => {
  //# 좋아요(Create)_4 : 인가 후, 클라이언트에서 받아온 postId와 토큰에 저장된 userId를 가지고  Likes DB에서 조회
  const { PostId } = req.body;
  const UserId = req.user.id;

  const found = await Likes.findOne({
    where: { PostId: PostId, UserId: UserId },
  });
  if (!found) {
    //# 좋아요(Create)_5-1 : 조회 시, 없으면 좋아요를 안눌렀으므로 좋아요DB에다 해당 글과 유저아이디로 저장
    await Likes.create({ PostId: PostId, UserId: UserId });
    //# 좋아요(Create)_6-1 : 좋아요 상태를 표시한 데이터를 클라이언트에게 보내줌
    res.json({ liked: true });
  } else {
    //# 좋아요(Create)_5-2 : 조회시 있으면 좋아요를 눌렀다는 것이므로, 좋아요DB에 해당 글과 유저아이디 삭제
    await Likes.destroy({
      where: { PostId: PostId, UserId: UserId },
    });
    //# 좋아요(Create)_6-2 : 좋아요 상태를 표시한 데이터를 클라이언트에게 보내줌
    res.json({ liked: false });
  }
});

module.exports = router;
