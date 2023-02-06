import Head from 'next/head';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Router from 'next/router';
import jwt from 'jsonwebtoken';
import { toast } from 'react-toastify';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from '../../components/Post/Post';

const Tag = ({ tagId, token }) => {
  const { _id } = jwt.decode(token);
  const [tag, setTag] = useState('');
  const [posts, setPosts] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 5,
    skip: 0,
  });
  const { limit, skip } = pagination;

  const fetchPosts = async () => {
    try {
      const res = await axios.post(
        `/tag/get-posts`,
        { tag: tagId, limit, skip },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      setTag(res.data.tag_name);
      if (res.data.posts.length < 5) {
        setIsEmpty(true);
        setPagination({
          ...pagination,
          skip: 0,
        });
      } else {
        setPagination({
          ...pagination,
          skip: [...posts, ...res.data.posts].length,
        });
      }
      setPosts([...posts, ...res.data.posts]);
    } catch (e) {
      toast.error(e.response.data.error);
      Router.push('/');
    }
  };

  useEffect(() => {
    fetchPosts();
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
      const newPosts = posts.map((post) => {
        if (post._id === id) {
          const newLike = [...post.like, _id];
          return {
            ...post,
            like: newLike,
          };
        } else {
          return post;
        }
      });
      setPosts(newPosts);
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
      const newPosts = posts.map((post) => {
        if (post._id === id) {
          const filteredLike = post.like.filter((val) => val !== _id);
          return {
            ...post,
            like: filteredLike,
          };
        } else {
          return post;
        }
      });
      setPosts(newPosts);
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
      const newPosts = posts.map((post) => {
        if (post._id === id) {
          const newTweet = [...post.retweet, _id];
          return {
            ...post,
            retweet: newTweet,
          };
        } else {
          return post;
        }
      });
      setPosts(newPosts);
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
      const newPosts = posts.map((post) => {
        if (post._id === id) {
          const filteredRetweet = post.retweet.filter((val) => val !== _id);
          return {
            ...post,
            retweet: filteredRetweet,
          };
        } else {
          return post;
        }
      });
      setPosts(newPosts);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  const allPosts = (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchPosts}
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
      {posts.map((post, index) => {
        return (
          <Post
            key={index}
            post={post}
            token={token}
            onLikeHandler={likeHandler}
            onUnlikeHandler={unlikeHandler}
            onRetweetHandler={retweetHandler}
            onUnRetweetHandler={unRetweetHandler}
          />
        );
      })}
    </InfiniteScroll>
  );

  return (
    <>
      <Head>
        <title>{tag} | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="row p-5">
        <div className="text-break">
          <p className="display-4 fw-bold text-secondary">#{tag}</p>
          {allPosts}
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async (ctx) => {
  const tag = ctx.params.tag;
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
    await axios.get(`/check-user`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
    return {
      props: {
        token,
        tagId: tag,
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

export default Tag;
