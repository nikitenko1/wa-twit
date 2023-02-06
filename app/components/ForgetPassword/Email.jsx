import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Email = () => {
  const [email, setEmail] = useState('');

  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() === '') {
      return toast.error('Email is required.');
    } else if (email.trim().length < email.length) {
      return toast.error('Email cannot contain spaces.');
    }
    try {
      setIsSending(true);
      const res = await axios.post(`/forget-password/send-email`, {
        email,
      });
      toast.success(res.data.message);

      setEmail('');
    } catch (e) {
      toast.success(e.response.data.error);
    }
    setIsSending(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-floating mb-3 w-75 mx-auto">
        <input
          type="email"
          className="form-control"
          id="floatingInput"
          placeholder="name@example.com"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          value={email}
        />
        <label htmlFor="floatingInput">Email address</label>
      </div>
      <div className="text-center">
        <button
          className="btn btn-outline-primary rounded-pill px-5 py-2 w-75"
          disabled={isSending}
        >
          {isSending ? 'Sending..' : 'Send'}
        </button>
      </div>
    </form>
  );
};

export default Email;
