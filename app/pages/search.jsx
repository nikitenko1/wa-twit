import Head from 'next/head';
import { useState, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import User from '../components/User/User';
import { followingActions } from '../store';

const Search = ({ keyword, findUsers, token }) => {
  const followings = useSelector((state) => state.followingSlice.following);
  const [users, setUsers] = useState([]);
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
      console.log(e);
    }
  };

  useEffect(() => {
    getFollowing();
    setUsers(findUsers);
  }, [keyword]);

  return (
    <>
      <Head>
        <title>Search | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="p-3">
        <div className="p-3">
          {users.map((user, index) => (
            <User
              user={user}
              checkFollowing={followings}
              token={token}
              key={index}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Search;

export const getServerSideProps = async (ctx) => {
  const keyword = ctx.query.key;
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
    if (keyword.trim() === '') {
      return {
        props: {
          keyword,
          findUsers: [],
          token,
        },
      };
    }
    const res = await axios.post(
      `/user/user-searching`,
      { keyword },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      }
    );
    return {
      props: {
        keyword,
        findUsers: res.data.data,
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
