import Head from 'next/head';
import axios from 'axios';
import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from '../../components/Admin/Post';
import { toast } from 'react-toastify';

const ViewAllPosts = ({ token }) => {
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
        `/admin/get-posts`,
        {
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
          skip: [...posts, ...res.data].length,
        });
      }
      setPosts([...posts, ...res.data]);
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
      {posts.map((post, index) => (
        <Post key={index} post={post} />
      ))}
    </InfiniteScroll>
  );

  return (
    <>
      <Head>
        <title>Posts | Admin GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="p-3">
        <p className="display-3">All posts</p>
        <hr />
        <div className="p-3">{allPosts}</div>
      </div>
    </>
  );
};

export default ViewAllPosts;

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
    await axios.get(`/check-admin`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
    return {
      props: {
        token,
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
