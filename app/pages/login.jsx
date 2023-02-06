import Head from 'next/head';
import LoginForm from '../components/Login/LoginForm';

const Login = () => {
  return (
    <>
      <Head>
        <title>Login | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service login" />
      </Head>
      <div className="container mx-auto pt-5">
        <div className="border border-2 p-5 w-50 mx-auto rounded-3 shadow bg-light mt-2">
          <LoginForm />
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = (ctx) => {
  if (ctx.req.headers.cookie) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  } else {
    return {
      props: {},
    };
  }
};

export default Login;
