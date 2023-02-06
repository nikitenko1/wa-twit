import Head from 'next/head';
import axios from 'axios';
import Create from '../../components/Tag/Create';

const MyCreate = ({ token }) => {
  return (
    <>
      <Head>
        <title>Create tag | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="p-5 my-5 bg-light rounded-3 shadow-sm">
        <p className="display-3">Create tag</p>
        <div className="p-2">
          <Create token={token} />
        </div>
      </div>
    </>
  );
};

export default MyCreate;

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
