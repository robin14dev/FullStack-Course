const express = require("express");
const router = express.Router();
const { Comments } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");

//# 댓글(Read)_2 : 특정 글의 아이디를 가지고 댓글들을 조회해서 클라이언트로 필터링된 댓글들을 보내준다.
router.get("/:postId", async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comments.findAll({ where: { PostId: postId } });
  res.json(comments);
});
//# 댓글(Create)_3 : 토큰 검증
router.post("/", validateToken, async (req, res) => {
  //# 댓글(Create)_4 : 클라이언트에서 받아온 댓글내용과 토큰에 담겨있던 username을 합친다.
  const comment = req.body;
  const username = req.user.username;
  comment.username = username;
  console.log('create comment', comment);
  //# 댓글(Create)_5 : CommentDB에 넣어준다.
  await Comments.create(comment);
  res.json(comment);
});

//# 댓글(Delete)_3 : 토큰을 검증한다.
router.delete("/:commentId", validateToken, async (req, res) => {
  //# 댓글(Delete)_4 : 인가 후, 받아온 댓글아이디(유저아이디 아님!!)를 DB에서 조회해서 삭제한다.
  const commentId =  req.params.commentId;
  console.log("here-------",commentId);

  await Comments.destroy({
    where: {
      id: commentId,
    },
  });

  res.json("DELETED SUCCESSFULLY");
});

module.exports = router;
