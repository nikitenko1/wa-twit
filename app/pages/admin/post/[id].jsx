import Head from 'next/head';
import { useState, useEffect } from 'react';
import axios from 'axios';
import OnePost from '../../../components/Admin/OnePost';
import Comment from '../../../components/Admin/Comment';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'react-toastify';

const UserPost = ({ post, token }) => {
  const [comments, setComments] = useState([]);
  const [commentNumber, setCommentNumber] = useState(0);
  const [isEmpty, setIsEmpty] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 5,
    skip: 0,
  });
  const { limit, skip } = pagination;

  const fetchComments = async () => {
    try {
      const res = await axios.post(
        `/admin/get-comments`,
        {
          limit,
          skip,
          postId: post._id,
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
      setCommentNumber([...comments, ...res.data].length);
      setComments([...comments, ...res.data]);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const deleteCommentHandler = async (commentId, commentedBy) => {
    const answer = window.confirm(
      'Are you sure you want to delete this comment.'
    );
    if (answer) {
      try {
        await axios.delete(
          `/admin/delete-comment/${commentId}/${post._id}/${commentedBy}`,
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }
        );
        const filtered = comments.filter((val) => val._id !== commentId);
        setComments(filtered);
        setCommentNumber(commentNumber - 1);
      } catch (e) {
        toast.error(e.response.data.error);
      }
    }
  };

  const allComments = (
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
      {comments.map((comment, index) => (
        <Comment
          key={index}
          comment={comment}
          onDeleteCommentHandler={deleteCommentHandler}
        />
      ))}
    </InfiniteScroll>
  );

  return (
    <>
      <Head>
        <title>Post | Admin GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div>
        <OnePost post={post} token={token} commentNumber={commentNumber} />
        <hr />
        <div>{allComments}</div>
      </div>
    </>
  );
};

export default UserPost;

export const getServerSideProps = async (ctx) => {
  const id = ctx.params.id;
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
    const res = await axios.post(
      `/admin/get-post`,
      {
        id,
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
