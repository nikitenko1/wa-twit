import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChangePassword = ({ token }) => {
  const [enteredData, setEnteredData] = useState({
    password: '',
    confirm: '',
  });
  const [isChanging, setIsChanging] = useState(false);

  const { password, confirm } = enteredData;

  const handleChange = (type) => (e) => {
    setEnteredData({
      ...enteredData,
      [type]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.trim() === '') {
      return toast.error('Password is required.');
    }
    if (confirm.trim() === '') {
      return toast.error('Confirm password is required.');
    }
    if (password.trim().length < password.trim().length) {
      return toast.error('Password must not contain spaces.');
    }
    if (password !== confirm) {
      return toast.error('Password does not match.');
    }
    try {
      setIsChanging(true);
      const res = await axios.post(
        `/user/change-password`,
        {
          password,
          confirm,
          token,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      toast.success(res.data.message);

      setEnteredData({
        password: '',
        confirm: '',
      });
    } catch (e) {
      toast.error(e.response.data.error);
    }
    setIsChanging(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-floating mb-3 w-75 mx-auto">
        <input
          type="password"
          className="form-control"
          id="floatingInput"
          placeholder="enter your new password"
          value={password}
          onChange={handleChange('password')}
        />
        <label htmlFor="floatingInput">Password</label>
      </div>
      <div className="form-floating mb-3 w-75 mx-auto">
        <input
          type="password"
          className="form-control"
          id="floatingInput1"
          placeholder="confirm new password"
          value={confirm}
          onChange={handleChange('confirm')}
        />
        <label htmlFor="floatingInput1">Confirm password</label>
      </div>
      <div className="text-center">
        <button
          className="btn btn-outline-primary rounded-pill px-5 py-2 w-75"
          disabled={isChanging}
        >
          {isChanging ? 'Changing..' : 'Change'}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;
