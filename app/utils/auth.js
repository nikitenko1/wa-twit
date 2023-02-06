import cookie from 'js-cookie';
import Router from 'next/router';

export const authenticate = (token, userData) => {
  cookie.set('token', token, {
    expires: 1, //1 day
  });
  localStorage.setItem('userData', JSON.stringify(userData));
};

export const isAuth = () => {
  if (typeof window !== 'undefined' && window.document) {
    if (cookie.get('token') && localStorage.getItem('userData')) {
      return JSON.parse(localStorage.getItem('userData'));
    }
    return false;
  }
};

//Logout
export const logout = () => {
  if (typeof window !== 'undefined' && window.document) {
    cookie.remove('token');
    localStorage.removeItem('userData');
    Router.push('/login');
  }
};
