import Head from 'next/head';
import axios from 'axios';
import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Link from 'next/link';
import { toast } from 'react-toastify';

const ViewAllUsers = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);

  const [pagination, setPagination] = useState({
    limit: 6,
    skip: 0,
  });
  const { limit, skip } = pagination;

  const fetchUsers = async () => {
    try {
      const res = await axios.post(
        `/admin/get-users`,
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
          skip: [...users, ...res.data].length,
        });
      }
      setUsers([...users, ...res.data]);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUserHandler = async (userId) => {
    const answer = window.confirm('Are you sure you want to delete this user.');
    if (answer) {
      try {
        await axios.delete(`/admin/delete-user/${userId}`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });
        const filteredUsers = users.filter(
          (val) => val.user_data._id !== userId
        );
        setUsers(filteredUsers);
        setPagination({
          pagination,
          skip: skip - 1,
        });
      } catch (e) {
        toast.error(e.response.data.error);
      }
    }
  };

  const allUsers = (
    <InfiniteScroll
      dataLength={users.length}
      next={fetchUsers}
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
      {users.map((user, index) => {
        return (
          <div
            className="alert alert-light p-4 rounded shadow-sm row w-75 mx-auto"
            key={index}
          >
            <div className="mx-auto d-flex justify-content-between align-items-center">
              <Link
                href={`/admin/profile/${user.username}`}
                className="d-flex align-items-center"
              >
                <img
                  src={
                    user.user_data.profile_image.url === ''
                      ? '/static/images/unknown-profile.jpg'
                      : user.user_data.profile_image.url
                  }
                  alt="profile image"
                  style={{
                    width: '75px',
                    height: '75px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <p className="fw-bold fs-5 ms-2">
                  {user.name}
                  {user.private && (
                    <img
                      src="/static/images/lock-icon.png"
                      className="ms-2"
                      style={{ width: '20px' }}
                      alt="loading.."
                    />
                  )}
                  <br />
                  <span className="text-secondary fw-normal">
                    @{user.username}
                  </span>
                </p>
              </Link>
              <div>
                <img
                  src="/static/images/delete.png"
                  style={{ width: '35px', cursor: 'pointer' }}
                  onClick={() => deleteUserHandler(user.user_data._id)}
                  alt="loading.."
                />
              </div>
            </div>
          </div>
        );
      })}
    </InfiniteScroll>
  );

  return (
    <>
      <Head>
        <title>Users | Admin GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div>
        <p className="display-3">All Users</p>
        <span className="fw-bold fs-5 text-secondary">
          Found {users.length} users.
        </span>
        <hr />
        {allUsers}
      </div>
    </>
  );
};

export default ViewAllUsers;

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
