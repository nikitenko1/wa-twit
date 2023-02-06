import Head from 'next/head';
import ChangePassword from '../../components/Profile/ChangePassword';
import axios from 'axios';

const ChangPasswordPage = ({ token }) => {
  return (
    <>
      <Head>
        <title>Change password | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="p-5 bg-light rounded-3">
        <h1 className="display-3 mb-4">Change password</h1>
        <ChangePassword token={token} />
      </div>
    </>
  );
};

export default ChangPasswordPage;

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
