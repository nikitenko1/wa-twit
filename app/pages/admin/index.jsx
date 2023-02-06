import Head from 'next/head';
import axios from 'axios';

const MyAdmin = () => {
  return (
    <>
      <Head>
        <title>Admin | Admin GlobalPal Service </title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="m-4 p-3 alert alert-light">
        <p className="display-2">Hi, Admin</p>
        <div className="p-3">
          <span>
            to Ukraine Shipping to another country? Select a country from the
            list.
          </span>
          <hr />
          <span>
            For customers living in the USA who are eager to send a package to
            their relatives, friends, or acquaintances in Ukraine, the Dnipro
            LLC company provides a personal package delivery service.
          </span>
        </div>
      </div>
    </>
  );
};

export default MyAdmin;

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
      props: {},
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
