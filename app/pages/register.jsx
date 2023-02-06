import Head from 'next/head';
import RegisterForm from '../components/Register/RegisterForm';

const Register = () => {
  return (
    <>
      <Head>
        <title>Register | GlobalPal Service</title>
        <meta name="description" content="GlobalPal Service" />
      </Head>
      <div className="container mx-auto pt-3">
        <div className="border p-5 w-50 mx-auto rounded shadow bg-light mt-3">
          <RegisterForm />
        </div>
      </div>
    </>
  );
};

export default Register;

export const getServerSideProps = (ctx) => {
  if (ctx.req.headers.cookie) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
  return {
    props: {},
  };
};
