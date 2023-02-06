import Head from 'next/head';
import Email from '../../components/ForgetPassword/Email';

const MyEmail = () => {
  return (
    <>
      <Head>
        <title>Send email | Twizzer</title>
        <meta name="description" content="Twizzer" />
      </Head>
      <div className="p-5 bg-light rounded-3">
        <h1 className="display-3 mb-4">Forget password</h1>
        <Email />
      </div>
    </>
  );
};

export default MyEmail;
