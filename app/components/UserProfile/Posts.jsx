import { useState } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import jwt from 'jsonwebtoken';
import Post from '../../components/Post/Post';
import Retweet from '../../components/Post/Retweet';
import { toast } from 'react-toastify';

const Posts = ({ posts, userId, token }) => {
  const { _id } = jwt.decode(token);
  const [allPosts, setAllPosts] = useState(posts);
  const [isEmpty, setIsEmpty] = useState(allPosts < 5 ? true : false);
  const [pagination, setPagination] = useState({
    limit: 5,
    skip: 0,
  });
  const { limit, skip } = pagination;

  const fetchPosts = async () => {
    try {
      const res = await axios.post(
        `/post/get-user-posts`,
        { limit, skip, userId },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      if (res.data.length < 5) {
        setIsEmpty(true);
      } else {
        setAllPosts([...allPosts, ...res.data]);
        setIsEmpty(false);
        setPagination({
          ...pagination,
          skip: [...allPosts, ...res.data].length,
        });
      }
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
      const newPosts = allPosts.map((post) => {
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
      setAllPosts(newPosts);
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
      const newPosts = allPosts.map((post) => {
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
      setAllPosts(newPosts);
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
      const newPosts = allPosts.map((post) => {
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
      setAllPosts(newPosts);
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
      const newPosts = allPosts.map((post) => {
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
      setAllPosts(newPosts);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  return (
    <div className="p-3">
      <InfiniteScroll
        dataLength={allPosts.length}
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
        {allPosts.map((post, index) => {
          if (post.type === 'post') {
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
          } else if (post.type === 'retweet') {
            return <Retweet key={index} post={post} />;
          }
        })}
      </InfiniteScroll>
    </div>
  );
};

export default Posts;
