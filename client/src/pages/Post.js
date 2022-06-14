import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";

function Post() {
  //# 게시글(Read)_10 : url에 params를 useParams로 파싱해서 id를 추출한다.
  let { id } = useParams();
  console.log(id);
  const [postObject, setPostObject] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { authState } = useContext(AuthContext);

  let history = useHistory();

  useEffect(() => {
    //# 게시글(Read)_11 : 해당 id를 params로 서버에 담아서 보낸다.
    axios.get(`http://localhost:3001/posts/byId/${id}`).then((response) => {
      //# 게시글(Read)_14 : 서버에서 받아온 글을 상태변경시켜 렌더링해준다.
      setPostObject(response.data);
    });
    //# 댓글(Read)_1 : 특정 글의 댓글들을 불러오기 위해서 특정글의 id를 서버로 보낸다.
    axios.get(`http://localhost:3001/comments/${id}`).then((response) => {
      //# 댓글(Read)_3 : 받아온 댓글들을 상태변화 시켜준다. (END)
      console.log(response.data);
      setComments(response.data);
    });
  }, []);

  const addComment = () => {
    axios
      .post(
        //# 댓글(Create)_2 : 토큰을 싣어서 댓글 내용과 글 아이디를 서버에 보낸다.
        "http://localhost:3001/comments",
        {
          commentBody: newComment,
          PostId: id,
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      )
      .then((response) => {
        if (response.data.error) {
          console.log(response.data.error);
        } else {
          //# 댓글(Create)_6 : DB에 댓글 저장이 성공한 후, client에서 추가한 댓글 상태변화 시켜준다. (END)
          console.log(response.data);
          const commentToAdd = {
            commentBody: newComment,
            username: response.data.username,
          };
          setComments([...comments, commentToAdd]);
          setNewComment("");
          axios.get(`http://localhost:3001/comments/${id}`).then((response) => {
            //# 댓글(Read)_3 : 받아온 댓글들을 상태변화 시켜준다. (END)
            console.log(response.data);
            setComments(response.data);
          });
          
        }
        
      });
  };

  const deleteComment = (id) => {
    //# 댓글(Delete)_2 : 댓글 고유 아이디와 토큰을 싣어서 서버에 보낸다
    console.log('id!!!',id);
    axios
      .delete(`http://localhost:3001/comments/${id}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then(() => {
        //# 댓글(Delete)_5 : DB에서 댓글 삭제 성공 후, client에서도 삭제된 댓글을 상태변경 해준다 (filter이용) (END)
        console.log('전',comments);
        setComments(
          comments.filter((val) => {
            return val.id !== id;
          })
        );
        console.log('후',comments);

      });
  };

  const deletePost = (id) => {
    //# 게시글(Delete)_2 : 삭제할 글의 아이디와 토큰을 싣어 서버로 보낸다.
    axios
      .delete(`http://localhost:3001/posts/${id}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then(() => {
        //# 게시글(Delete)_6 : 서버에서 삭제가 성공했다면 메인페이지로 이동한다.
        history.push("/");
      });
  };

  const editPost = (option) => {
    if (option === "title") {
      let newTitle = prompt("Enter New Title:");
      //# 게시글(Update)_2 : 수정한 글과 글 id, token을 싣어서 서버에게 보내준다.
      axios.put(
        "http://localhost:3001/posts/title",
        {
          newTitle: newTitle,
          id: id,
        },
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      );
      //# 게시글(Update)_5 : 수정에 성공한 글을 상태변화 시켜준다. (END)
      setPostObject({ ...postObject, title: newTitle });
    } else {
      let newPostText = prompt("Enter New Text:");
      axios.put(
        "http://localhost:3001/posts/postText",
        {
          newText: newPostText,
          id: id,
        },
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      );

      setPostObject({ ...postObject, postText: newPostText });
    }
  };

  return (
    <div className="postPage">
      <div className="leftSide">
        <div className="post" id="individual">
          <div
            className="title"
            onClick={() => {
              //# 게시글(Update)_1 : 현재로그인한 유저와 글작성 유저가 같으면 수정할 수 있게 온클릭으로 넣어준다.
              if (authState.username === postObject.username) {
                editPost("title");
              }
            }}
          >
            {postObject.title}
          </div>
          <div
            className="body"
            onClick={() => {
              //# 게시글(Update)_1 : 현재로그인한 유저와 글작성 유저가 같으면 수정할 수 있게 온클릭으로 넣어준다.
              if (authState.username === postObject.username) {
                editPost("body");
              }
            }}
          >
            {postObject.postText}
          </div>
          <div className="footer">
            {postObject.username}
            {authState.username === postObject.username && (
              <button
                onClick={() => {
                  //# 게시글(Delete)_1 : 해당 글의 아이디를 parameter로 전달하여 클릭메소드 실행시킨다.
                
                  deletePost(postObject.id);
                }}
              >
                {" "}
                Delete Post
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="rightSide">
        <div className="addCommentContainer">
          <input
            type="text"
            placeholder="Comment..."
            autoComplete="off"
            value={newComment}
            onChange={(event) => {
              setNewComment(event.target.value);
            }}
          />
          {/* //# 댓글(Create)_1 : 댓글 내용입력하고 온클릭 실행한다.  */}
          <button onClick={addComment}> Add Comment</button>
        </div>
        <div className="listOfComments">
          {comments.map((comment, key) => {
            return (
              <div key={key} className="comment">
                {comment.commentBody}
                <label> Username: {comment.username}</label>
                {authState.username === comment.username && (
                  <button
                    onClick={() => {
                      //# 댓글(Delete)_1 : 지울 댓글의 아이디를 넣어 온클릭 실행
                      console.log(comment);
                      deleteComment(comment.id);
                    }}
                  >
                    X
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Post;
