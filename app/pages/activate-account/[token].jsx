import Head from 'next/head';
import { useState } from 'react';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Router from 'next/router';
import { toast } from 'react-toastify';

const ActivatePage = ({ name, token, invalidToken }) => {
  const [buttonText, setButtonText] = useState('Activate');

  if (invalidToken) {
    Router.push('/');
  }

  const activateHandler = async () => {
    try {
      const res = await axios.post(`/activate-account`, { token });
      toast.success(res.data.message);

      setButtonText('Activated');

      setTimeout(() => {
        Router.push('/login');
      }, 3000);
    } catch (e) {
      toast.error(e.response.data.error);
      setButtonText('Activate');
    }
  };

  let content = (
    <>
      <p className="display-5">
        Hi, <b>{name}</b>. Please click the below button to activate tour
        account.
      </p>
      <div className="p-2 w-100 d-flex">
        <button
          className="btn btn-outline-secondary py-2 mx-auto w-75"
          onClick={activateHandler}
        >
          {buttonText}
        </button>
      </div>
      <div className="pt-3 text-center">
        <p className="fw-3 fs-4">Let's login.</p>
      </div>
    </>
  );
  if (invalidToken) {
    content = (
      <div className="text-center">
        <p className="fs-3 fw-3">Invalid Token.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Activation account | Twizzer</title>
        <meta name="description" content="Twizzer" />
      </Head>
      <div className="p-5">{content}</div>
    </>
  );
};

export default ActivatePage;

export const getServerSideProps = (ctx) => {
  const token = ctx.params.token;
  if (!jwt.decode(token)) {
    return {
      props: {
        invalidToken: true,
      },
    };
  }
  const { name } = jwt.decode(token);
  return {
    props: {
      token,
      name,
      invalidToken: false,
    },
  };
};
