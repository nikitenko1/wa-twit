import Head from 'next/head';
import { useEffect, useState } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { toast } from 'react-toastify';
import InfiniteScroll from 'react-infinite-scroll-component';
import PopularUser from '../components/User/PopularUser';
import PopularTag from '../components/Tag/PopularTag';
import Post from '../components/Post/Post';
import Retweet from '../components/Post/Retweet';

const Home = ({ token }) => {
  const { _id } = jwt.decode(token);
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
        `/posts`,
        { limit, skip },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      if (res.data.length < 5) {
        setIsEmpty(true);
      } else {
        setIsEmpty(false);
        setPagination({
          ...pagination,
          skip: [...posts, ...res.data].length,
        });
      }
      setPosts([...posts, ...res.data]);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

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
      const res = await axios.post(
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
      setPosts([res.data.newTweet, ...newPosts]);
      setPagination({
        ...pagination,
        skip: skip + 1,
      });
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  const unRetweetHandler = async (id, ownerPostId) => {
    try {
      const res = await axios.post(
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
      const filtered = newPosts.filter(
        (val) => val._id !== res.data.deletedRetweet
      );
      setPosts(filtered);
      setPagination({
        ...pagination,
        skip: skip - 1,
      });
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
        if (post.type === 'post') {
          return (
            <Post
              key={index}
              onLikeHandler={likeHandler}
              onUnlikeHandler={unlikeHandler}
              onRetweetHandler={retweetHandler}
              onUnRetweetHandler={unRetweetHandler}
              token={token}
              post={post}
            />
          );
        } else if (post.type === 'retweet') {
          return (
            <Retweet
              key={index}
              onLikeHandler={likeHandler}
              onUnlikeHandler={unlikeHandler}
              onRetweetHandler={retweetHandler}
              onUnRetweetHandler={unRetweetHandler}
              token={token}
              post={post}
            />
          );
        }
      })}
    </InfiniteScroll>
  );

  return (
    <>
      <Head>
        <title>GlobalPal Service</title>
        <meta name="description" content="Generated by create GlobalPal" />
      </Head>
      <>
        <div className="row p-4">
          <div className="col-md-9 text-break">{allPosts}</div>
          <div className="col-md-3">
            <PopularUser token={token} />
            <PopularTag token={token} />
          </div>
        </div>
      </>
    </>
  );
};

export default Home;

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
    try {
      await axios.get(`/check-user`, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
    } catch (e) {
      console.log(e.response.data.error);
    }

    return {
      props: {
        token,
      },
    };
  } catch (e) {
    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
    };
  }
};
