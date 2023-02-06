import Head from 'next/head';
import { useState } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'react-toastify';
import Comment from '../components/Notification/Comment';
import Follow from '../components/Notification/Follow';
import Like from '../components/Notification/Like';
import Retweet from '../components/Notification/Retweet';
import Accept from '../components/Notification/Accept';

const Notification = ({ token, notification }) => {
  const [notify, setNotify] = useState(notification);
  const [isEmpty, setIsEmpty] = useState(notify.length < 5 ? true : false);

  const [pagination, setPagination] = useState({
    limit: 5,
    skip: notify.length,
  });
  const { limit, skip } = pagination;

  const fetchNotification = async () => {
    try {
      const res = await axios.post(
        `/notifications`,
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
        setPagination({
          ...pagination,
          skip: [...notify, ...res.data].length,
        });
      }
      setNotify([...notify, ...res.data]);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  const content = notify.map((notify, index) => {
    if (notify.type === 'comment') {
      return <Comment key={index} notification={notify} />;
    } else if (notify.type === 'follow') {
      return <Follow key={index} notification={notify} />;
    } else if (notify.type === 'like') {
      return <Like key={index} notification={notify} />;
    } else if (notify.type === 'retweet') {
      return <Retweet key={index} notification={notify} />;
    } else if (notify.type === 'accept') {
      return <Accept key={index} notification={notify} />;
    }
  });

  return (
    <>
      <Head>
        <title>Notification | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="p-3 mt-3">
        <p className="display-3">Notification</p>
        <InfiniteScroll
          dataLength={notify.length}
          next={fetchNotification}
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
          <div className="p-2">{content}</div>
        </InfiniteScroll>
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
    const res = await axios.post(
      `/notifications`,
      { limit: 5, skip: 0 },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      }
    );
    return {
      props: {
        token,
        notification: res.data,
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

export default Notification;
