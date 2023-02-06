import Head from 'next/head';
import { useEffect, Fragment } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { useDispatch } from 'react-redux';
import Posts from '../../components/UserProfile/Posts';
import Information from '../../components/UserProfile/Information';
import { followingActions } from '../../store';
import { toast } from 'react-toastify';

const UserProfile = ({ token, user, posts }) => {
  const dispatch = useDispatch();
  const getFollowing = async () => {
    try {
      const res = await axios.get(`/user/get-following`, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      dispatch(
        followingActions.setInitialFollowing({
          followingFetched: res.data.following,
        })
      );
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  useEffect(() => {
    getFollowing();
  }, []);

  let postsContent = (
    <div className="text-center my-5">
      <img
        src="/static/images/lock-icon.png"
        style={{ width: '150px' }}
        alt="lock"
      />
      <br />
      <span className="fs-4 fw-bold text-secondary">
        These posts are protected.
      </span>
    </div>
  );

  if (posts) {
    postsContent = <Posts posts={posts} userId={user._id} token={token} />;
  }

  return (
    <>
      <Head>
        <title>{user.user.name} | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="p-4 mt-4 rounded-3 bg-light">
        <Information user={user} token={token} />
        <hr />
        {postsContent}
      </div>
    </>
  );
};

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
    const username = ctx.params.username;
    const res = await axios.post(
      `/user/user-profile`,
      {
        userUsername: username,
        limit: 5,
        skip: 0,
      },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      }
    );
    const { _id } = jwt.decode(token);
    if (_id === res.data.user._id) {
      return {
        redirect: {
          permanent: false,
          destination: '/profile',
        },
      };
    }
    if (res.data.posts) {
      return {
        props: {
          user: res.data.user,
          posts: res.data.posts,
          token,
        },
      };
    } else {
      return {
        props: {
          user: res.data.user,
          token,
        },
      };
    }
  } catch (e) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
};

export default UserProfile;
