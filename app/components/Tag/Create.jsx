import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Create = ({ token }) => {
  const [tag, setTag] = useState('');

  const [isCreating, setIsCreating] = useState(false);

  const handleChange = (e) => {
    setTag(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tag.trim() === '') {
      return toast.error('Tag name is required.');
    }
    if (tag.trim().replace(' ', '').length < tag.trim().length) {
      return toast.error('Tag name must not has a space.');
    }
    if (tag.trim().length > 32) {
      return toast.error('Tag name must be less than 32 characters.');
    }
    try {
      setIsCreating(true);
      const res = await axios.post(
        `/tag/create`,
        {
          tag: tag.trim(),
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      toast.success(res.data.message);

      setTag('');
    } catch (e) {
      toast.error(e.response.data.error);
    }
    setIsCreating(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control"
          id="floatingInput"
          placeholder="Enter tag name"
          onChange={handleChange}
          value={tag}
        />
        <label htmlFor="floatingInput">Tag name</label>
      </div>
      <div className="w-100 text-end">
        <button
          className="btn btn-outline-warning px-5"
          disabled={tag.trim() === '' || isCreating}
        >
          {isCreating ? 'Creating..' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default Create;
