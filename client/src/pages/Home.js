import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";

function Home() {
  const [listOfPosts, setListOfPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);

  let history = useHistory();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      //# 로그인_0 : 토큰이 없는거 확인하고 login페이지로 이동한다.
      history.push("/login");
    } else {
      //# 게시글(Delete)_7 : 메인페이지로 왔을 때 게시글 목록이 업데이트 되야하므로 게시글 Read 단계로 자동으로 넘어가진다. (END)
      //# 게시글(Create)_6 : 메인페이지로 왔을 때 게시글 목록이 업데이트 되야하므로 게시글 Read 단계로 자동으로 넘어가진다. (END)
      //# 게시글(Read)_0 : 서버에 토큰을 싣어서 인가를 받은 후에 게시글을 불러올 수 있도록 한다.
      axios
        .get("http://localhost:3001/posts", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          console.log(response.data);
          //# 게시글(Read)_8 : 서버로부터 받아온 게시글들을 상태변화 시켜준다. (END)
          setListOfPosts(response.data.listOfPosts);
          setLikedPosts(
            //# 좋아요(Read)_1 : 로그인한 유저가 좋아요한 postId들 가져오기
            response.data.likedPosts.map((like) => {
              return like.PostId;
            })
          );
        });
      console.log(likedPosts);
    }
  }, []);

  const likeAPost = (postId) => {
    //# 좋아요(Create)_2 : 글 id 와 토큰 싣어서 서버에 보내주기
    axios
      .post(
        "http://localhost:3001/likes",
        { PostId: postId },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((response) => {
        setListOfPosts(
          listOfPosts.map((post) => {
            //# 좋아요(Create)_7 : 전체 글목록중에 좋아요를 클릭한 글 아이디와 일치하는 글을 찾는다.
            if (post.id === postId) {
              //# 좋아요(Create)_8-1 : 좋아요를 눌렀으므로 배열의 갯수를 하나 더 추가한다.
              if (response.data.liked) {
                return { ...post, Likes: [...post.Likes, "likeone!"] };
              } else {
                //# 좋아요(Create)_8-2 : 좋아요를 해제했기때문에 배열의 갯수를 하나 뺀다.
                const likesArray = post.Likes;
                likesArray.pop();
                return { ...post, Likes: likesArray };
              }
            } else {
              return post;
            }
          })
        );

        if (likedPosts.includes(postId)) {
          setLikedPosts(
            likedPosts.filter((id) => {
              return id != postId;
            })
          );
        } else {
          setLikedPosts([...likedPosts, postId]);
        }
      });
  };

  return (
    <div>
      {listOfPosts.map((value, key) => {
        return (
          <div key={key} className="post">
            <div className="title"> {value.title} </div>
            <div
              //# 게시글(Read)_9 : 특정 게시글을 클릭할 때 해당 글의 id를 url에 심는다.
              className="body"
              onClick={() => {
                history.push(`/post/${value.id}`);
              }}
            >
              {value.postText}
            </div>
            <div className="footer">
              <div className="username">
                <Link to={`/profile/${value.UserId}`}> {value.username} </Link>
              </div>
              <div className="buttons">
                <ThumbUpAltIcon
                  onClick={() => {
                    //# 좋아요(Create)_1 : 특정 게시글 좋아요 클릭할 때 글 id 싣어서 온클릭
                    likeAPost(value.id);
                  }}
                  className={
                    //# 좋아요(Read)_2 : 좋아요한 게시글 아이디 배열에 해당 글이 있으면 비활성화된 좋아요 버튼 렌더링
                    likedPosts.includes(value.id) ? "unlikeBttn" : "likeBttn"
                  }
                />
                {/* //# 좋아요(Create)_9 : Likes 배열에 들어가 있는 수만큼 좋아요가 렌더링된다. (END) */}

                <label> {value.Likes.length}</label>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Home;
