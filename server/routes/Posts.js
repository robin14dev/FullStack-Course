const express = require("express");
const router = express.Router();
const { Posts, Likes } = require("../models");

const { validateToken } = require("../middlewares/AuthMiddleware");

//# 게시글(Read)_2 : 토큰으로 이 앱의 유저인지 검증을 한다.
router.get("/", validateToken, async (req, res) => {
  //# 게시글(Read)_6 : DB에 저장되있던 게시글을 싸그리 불러온다 (include : 좋아요 table 정보)
  const listOfPosts = await Posts.findAll({ include: [Likes] });
  const likedPosts = await Likes.findAll({ where: { UserId: req.user.id } });
  console.log("likedPosts what is it?", likedPosts);
  //# 게시글(Read)_7 : 게시글들을 클라이언트로 보내준다.
  res.json({ listOfPosts: listOfPosts, likedPosts: likedPosts });
});

//# 게시글(Read)_12 : 받아온 params로 특정글을 DB에서 조회한다.
router.get("/byId/:id", async (req, res) => {
  const id = req.params.id;
  const post = await Posts.findByPk(id);
  //# 게시글(Read)_13 : 추출한 특정 글을 클라이언트로 보내준다.
  res.json(post);
});

router.get("/byuserId/:id", async (req, res) => {
  const id = req.params.id;
  const listOfPosts = await Posts.findAll({
    where: { UserId: id },
    include: [Likes],
  });
  res.json(listOfPosts);
});

//# 게시글(Create)_2 : 받아온 토큰을 검증한다
router.post("/", validateToken, async (req, res) => {
  //# 게시글(Create)_3 : 인가후, 토큰에 담겨있던 username과 id를 post에 추가한다.
  const post = req.body;
  post.username = req.user.username;
  post.UserId = req.user.id;
  //# 게시글(Create)_4 : 게시글을 DB에 저장한다.
  await Posts.create(post);
  res.json(post);
});

//# 게시글(Update)_3 : 받아온 토큰을 검증한다.
router.put("/title", validateToken, async (req, res) => {
  //# 게시글(Update)_4 : 인가 후 받아온 글의 컨텐츠를 아이디로 필터링해 DB에서 수정한다.
  const { newTitle, id } = req.body;
  await Posts.update({ title: newTitle }, { where: { id: id } });
  res.json(newTitle);
});

router.put("/postText", validateToken, async (req, res) => {
  const { newText, id } = req.body;
  await Posts.update({ postText: newText }, { where: { id: id } });
  res.json(newText);
});

//# 게시글(Delete)_3 : 받아온 토큰을 검증한다.
router.delete("/:postId", validateToken, async (req, res) => {
  //# 게시글(Delete)_4 : 인가 후에 해당 글의 아이디를 DB에서 찾아 삭제한다.
  const postId = req.params.postId;
  await Posts.destroy({
    where: {
      id: postId,
    },
  });
  //# 게시글(Delete)_5 : 삭제성공메시지를 보내준다.
  res.json("DELETED SUCCESSFULLY");
});

module.exports = router;
