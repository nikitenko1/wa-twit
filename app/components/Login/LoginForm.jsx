import { useState } from 'react';
import axios from 'axios';
import Router from 'next/router';
import { authenticate } from '../../utils/auth';
import Link from 'next/link';
import { toast } from 'react-toastify';

export const emailValidator = (email) => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (regex.test(email)) {
    return true;
  }
  return false;
};

const LoginForm = () => {
  const [enteredData, setEnteredData] = useState({
    email: '',
    password: '',
  });
  const { email, password } = enteredData;

  const handleChange = (type) => (e) => {
    setEnteredData({
      ...enteredData,
      [type]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() === '' || !emailValidator(email)) {
      return toast.error('Email is invalid.');
    } else if (password.trim() === '' || password.trim().length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    try {
      const res = await axios.post('/login', enteredData);
      toast.success(res.data.message);

      authenticate(res.data.token, res.data.userData);
      setEnteredData({
        email: '',
        password: '',
      });
      setTimeout(
        () =>
          res.data.userData.role === 'user'
            ? Router.push('/')
            : Router.push('/admin'),
        200
      );
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  return (
    <form className="mx-auto w-100" onSubmit={handleSubmit}>
      <div className="mb-5">
        <p className="display-4 text-warning">Login</p>
      </div>
      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control"
          id="floatingInput1"
          placeholder="name@example.com"
          onChange={handleChange('email')}
          value={email}
        />
        <label htmlFor="floatingInput1">Email address</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control"
          id="floatingInput2"
          placeholder="Enter your password"
          onChange={handleChange('password')}
          value={password}
        />
        <label htmlFor="floatingInput2">Password</label>
      </div>
      <div className="text-end d-flex justify-content-between">
        <Link href="/forget-password" legacyBehavior>
          Forget password
        </Link>
        <button className="btn btn-outline-warning py-2 px-5">Login</button>
      </div>
    </form>
  );
};

export default LoginForm;
