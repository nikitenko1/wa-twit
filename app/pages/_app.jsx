import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'nprogress/nprogress.css';
import '../styles/nprogress.css';
import Router from 'next/router';
import NProgress from 'nprogress';
import Layout from '../components/Layout';
import { Provider } from 'react-redux';
import store from '../store';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = ({ children }) => {
  const [showChild, setShowChild] = useState(false);
  useEffect(() => {
    setShowChild(true);
  }, []);
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);
  if (!showChild) {
    return null;
  }
  if (typeof window === 'undefined') {
    return <></>;
  } else {
    return <>{children}</>;
  }
};

// global axios defaults
axios.defaults.baseURL = 'http://localhost:8000/api';
axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.request.use(
  (request) => {
    // console.log(request);
    // Edit request config
    return request;
  },
  (error) => {
    // eslint-disable-next-line no-undef
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    // Edit response config
    return response;
  },
  (error) => {
    // eslint-disable-next-line no-undef
    return Promise.reject(error);
  }
);

const MyApp = ({ Component, pageProps }) => {
  useEffect(() => {
    const handleRouteStart = () => NProgress.start();
    const handleRouteDone = () => NProgress.done();

    Router.events.on('routeChangeStart', handleRouteStart);
    Router.events.on('routeChangeComplete', handleRouteDone);
    Router.events.on('routeChangeError', handleRouteDone);

    return () => {
      // Make sure to remove the event handler on unmount!
      Router.events.off('routeChangeStart', handleRouteStart);
      Router.events.off('routeChangeComplete', handleRouteDone);
      Router.events.off('routeChangeError', handleRouteDone);
    };
  }, []);
  return (
    <Provider store={store}>
      <App>
        <Layout>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            pauseOnFocusLoss={false}
          />
          <Component {...pageProps} />
        </Layout>
      </App>
    </Provider>
  );
};

export default MyApp;
