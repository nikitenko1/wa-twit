import Head from 'next/head';
import axios from 'axios';
import CreateForm from '../../components/Post/CreateForm';

const CreatePost = ({ token }) => {
  return (
    <>
      <Head>
        <title>Create post | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="p-5 bg-light">
        <div className="mb-2">
          <p className="display-3">Create post</p>
        </div>
        <div className="p-3">
          <CreateForm token={token} />
        </div>
      </div>
    </>
  );
};

export default CreatePost;

export const getServerSideProps = async (ctx) => {
  let token;
  if (ctx.req.headers.cookie) {
    token = ctx.req.headers.cookie.slice(6);
  } else {
    token = 123;
  }
  try {
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
        destination: '/login',
      },
    };
  }
};
