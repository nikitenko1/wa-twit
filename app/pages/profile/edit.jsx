import Head from 'next/head';
import axios from 'axios';
import Edit from '../../components/Profile/Edit';

const MyEdit = ({ token, data }) => {
  return (
    <>
      <Head>
        <title>Edit profile | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div
        className="p-5 mt-4 rounded-3 bg-light"
        style={{ overflow: 'hidden' }}
      >
        <Edit token={token} data={data} />
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
    const res = await axios.get(`/user/get-profile`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
    return {
      props: {
        token,
        data: res.data,
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

export default MyEdit;
