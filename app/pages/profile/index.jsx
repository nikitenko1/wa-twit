import Head from 'next/head';
import axios from 'axios';
import Information from '../../components/Profile/Information';
import Posts from '../../components/Profile/Posts';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { followingActions } from '../../store';
import { toast } from 'react-toastify';

const Profile = ({ token }) => {
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

  return (
    <>
      <Head>
        <title>Your profile | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="p-4 mt-4 rounded-3 alert alert-light">
        <Information token={token} />
        <hr />
        <Posts token={token} />
      </div>
    </>
  );
};

export default Profile;

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
    await axios.get(`/check-user`, {
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
