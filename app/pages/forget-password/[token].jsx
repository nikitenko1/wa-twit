import Head from 'next/head';
import jwt from 'jsonwebtoken';
import NewPassword from '../../components/ForgetPassword/NewPassword';

const MyNewPassword = ({ token, email }) => {
  return (
    <>
      <Head>
        <title>Reset password | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="p-5 bg-light rounded-3">
        <h1 className="display-3 mb-4">New password</h1>
        <NewPassword email={email} token={token} />
      </div>
    </>
  );
};

export default MyNewPassword;

export const getServerSideProps = (ctx) => {
  try {
    const token = ctx.params.token;
    const { email } = jwt.decode(token);
    return {
      props: {
        token,
        email,
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
