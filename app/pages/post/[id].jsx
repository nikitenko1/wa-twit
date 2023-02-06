import Head from 'next/head';
import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'react-toastify';
import axios from 'axios';
import OnePost from '../../components/Post/OnePost';
import Comment from '../../components/Comment/Comment';

const Post = ({ post, token, postId }) => {
  const { _id } = jwt.decode(token);
  const [currentPost, setCurrentPost] = useState(post);
  const [comments, setComments] = useState([]);
  const [commentNumber, setCommentNumber] = useState(
    currentPost.comment_number
  );
  const [isEmpty, setIsEmpty] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 5,
    skip: 0,
  });
  const { limit, skip } = pagination;

  const fetchComments = async () => {
    try {
      const res = await axios.post(
        `/comment/get-comments`,
        {
          postId,
          limit,
          skip,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      if (res.data.length < 5) {
        setIsEmpty(true);
      } else {
        setPagination({
          ...pagination,
          skip: [...comments, ...res.data].length,
        });
      }
      setComments([...comments, ...res.data]);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  const insertNewCommentHandler = (newComment) => {
    setComments([newComment, ...comments]);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const likeHandler = async (id, ownerPostId) => {
    try {
      await axios.post(
        `/like`,
        {
          ownerPostId,
          postId: id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      const newLike = [...currentPost.like, _id];
      const newPost = {
        ...currentPost,
        like: newLike,
      };
      setCurrentPost(newPost);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  const unlikeHandler = async (id, ownerPostId) => {
    try {
      await axios.post(
        `/like/unlike`,
        {
          ownerPostId,
          postId: id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      const newLike = currentPost.like.filter((val) => val !== _id);
      const newPost = {
        ...currentPost,
        like: newLike,
      };
      setCurrentPost(newPost);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  const retweetHandler = async (id, ownerPostId) => {
    try {
      await axios.post(
        `/retweet`,
        {
          ownerPostId,
          postId: id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      const newRetweet = [...currentPost.retweet, _id];
      const newPost = {
        ...currentPost,
        retweet: newRetweet,
      };
      setCurrentPost(newPost);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  const unRetweetHandler = async (id, ownerPostId) => {
    try {
      await axios.post(
        `/retweet/cancel-retweet`,
        {
          ownerPostId,
          postId: id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      const newRetweet = currentPost.like.filter((val) => val !== _id);
      const newPost = {
        ...currentPost,
        retweet: newRetweet,
      };
      setCurrentPost(newPost);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  const deleteCommentHandler = async (commentId) => {
    const answer = window.confirm(
      'Are you sure you want to delete this comment.'
    );
    if (answer) {
      try {
        await axios.post(
          `/comment/delete`,
          {
            commentId,
          },
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }
        );
        const filteredComments = comments.filter(
          (val) => val._id !== commentId
        );
        setComments(filteredComments);
        setCommentNumber(commentNumber - 1);
      } catch (e) {
        toast.error(e.response.data.error);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Post | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="p-4">
        <OnePost
          fetchComments={fetchComments}
          token={token}
          post={currentPost}
          onLikeHandler={likeHandler}
          onUnlikeHandler={unlikeHandler}
          onRetweetHandler={retweetHandler}
          onUnRetweetHandler={unRetweetHandler}
          onInsertNewCommentHandler={insertNewCommentHandler}
          onSetCommentNumber={setCommentNumber}
          commentNumber={commentNumber}
        />
        <hr />
        <div>
          <span className="fw-bold fs-5 text-secondary">Comments</span>

          <InfiniteScroll
            dataLength={comments.length}
            next={fetchComments}
            hasMore={!isEmpty}
            loader={
              <div className="w-100 text-center">
                <img
                  src="/static/images/loading.gif"
                  style={{ width: '100px' }}
                  alt="loading.."
                />
              </div>
            }
          >
            <div className="p-2">
              {comments &&
                comments.map((comment, index) => {
                  return (
                    <Comment
                      key={index}
                      _id={_id}
                      comment={comment}
                      onDeleteHandler={deleteCommentHandler}
                    />
                  );
                })}
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </>
  );
};

export default Post;

export const getServerSideProps = async (ctx) => {
  try {
    let token;
    if (ctx.req.headers.cookie) {
      token = ctx.req.headers.cookie.slice(6);
    } else {
      return {
        redirect: {
          permanent: false,
          destination: '/login',
        },
      };
    }
    const postId = ctx.params.id;
    const res = await axios.post(
      `/post/get-post`,
      {
        postId,
      },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      }
    );
    return {
      props: {
        token,
        post: res.data,
        postId,
      },
    };
  } catch (e) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
};
