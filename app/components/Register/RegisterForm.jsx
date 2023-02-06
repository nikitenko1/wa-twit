import { useState } from 'react';
import axios from 'axios';
import { emailValidator } from '../Login/LoginForm';
import { toast } from 'react-toastify';
import Router from 'next/router';

const RegisterForm = () => {
  const [enteredData, setEnteredData] = useState({
    email: '',
    name: '',
    password: '',
    confirm: '',
  });
  const { email, name, password, confirm } = enteredData;
  const [isLoading, setIsLoading] = useState(false);

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
    } else if (name.trim() === '') {
      return toast.error('Name is required.');
    } else if (password.trim().length < 6 || confirm.trim().length < 6) {
      return toast.error('Password must be at least 6 characters.');
    } else if (password.trim() !== confirm.trim()) {
      return toast.error('Password does not match.');
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`/register`, {
        email: email.trim(),
        name: name.trim(),
        password: password.trim(),
        confirm: confirm.trim(),
      });
      toast.success(res.data.message);
      setEnteredData({
        email: '',
        name: '',
        password: '',
        confirm: '',
      });

      setTimeout(() => {
        Router.push('/login');
      }, 3000);
    } catch (e) {
      toast.error(e.response.data.error);
    }
    setIsLoading(false);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <p className="display-4 text-warning">Register</p>
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
          type="text"
          className="form-control"
          id="floatingInput2"
          placeholder="Enter your name"
          onChange={handleChange('name')}
          value={name}
        />
        <label htmlFor="floatingInput2">Name</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control"
          id="floatingInput3"
          placeholder="Enter your password"
          onChange={handleChange('password')}
          value={password}
        />
        <label htmlFor="floatingInput3">Password</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control"
          id="floatingInput4"
          placeholder="Confirm your password"
          onChange={handleChange('confirm')}
          value={confirm}
        />
        <label htmlFor="floatingInput4">Confirm password</label>
      </div>
      <div className="text-end">
        <button
          className="btn btn-outline-warning py-2 px-5"
          disabled={isLoading}
        >
          {isLoading ? 'Registering' : 'Register'}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
