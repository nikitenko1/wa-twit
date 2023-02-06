import { useState, useEffect } from 'react';
import axios from 'axios';
import Resizer from 'react-image-file-resizer';
import Router from 'next/router';
import { toast } from 'react-toastify';

const CreateForm = ({ token }) => {
  const [enteredData, setEnteredData] = useState({
    content: '',
    images: [],
    tag: '',
  });
  const { content, images, tag } = enteredData;
  const [textLength, setTextLength] = useState(0);
  const [isPosting, setIsPosting] = useState(false);
  const [tagsFetched, setTagsFetched] = useState([]);

  const fetchTags = async () => {
    try {
      const res = await axios.get(`/tag/get-tags`, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      setTagsFetched(res.data.tags);
    } catch (e) {
      toast.error(e.response.data.error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const resizeFile = (file) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        300,
        300,
        'JPEG',
        100,
        0,
        (uri) => {
          resolve(uri);
        },
        'base64'
      );
    });
  };

  const handleChangeImage = async (e) => {
    try {
      let imagesArray = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const image = await resizeFile(file);
        imagesArray.push(image);
      }
      setEnteredData({
        ...enteredData,
        images: imagesArray,
      });
    } catch (err) {
      toast.error('Failed images were unable to complete their process');
    }
  };

  const handleChangeSelectRadio = (id) => {
    setEnteredData({
      ...enteredData,
      tag: id,
    });
  };

  const handleChangeContent = (e) => {
    setTextLength(e.target.value.length);
    setEnteredData({
      ...enteredData,
      content: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '') {
      return toast.error('Content is required.');
    }
    if (content.trim().length > 256) {
      return toast.error('Content is too long.');
    }
    if (images.length > 4) {
      return toast.error('Uploaded images must be less than 4');
    }
    if (tagsFetched.length === 0) {
      return toast.error('However, at first it was necessary to add tag.');
    }
    try {
      setIsPosting(true);
      const res = await axios.post(
        `/post/create`,
        {
          content,
          images,
          tag,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      toast.success(res.data.message);

      setEnteredData({
        content: '',
        images: [],
      });
      setTextLength(0);
      setTimeout(() => {
        Router.push('/post/create');
      }, 3000);
    } catch (e) {
      toast.error(e.response.data.error);
    }
    setIsPosting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-2 fs-5 text-secondary">length {textLength} / 256</div>
      <div className="form-floating">
        <textarea
          className="form-control"
          placeholder="Leave a comment here"
          id="floatingTextarea"
          onChange={handleChangeContent}
          maxLength={256}
          style={{ height: '200px' }}
          value={content}
        />
        <label htmlFor="floatingTextarea">Content</label>
      </div>
      <p className="mt-3 mb-2">Upload images (max 4 images)</p>
      <div className="d-flex align-items-center w-100">
        <div className="w-25 me-2">
          <input
            className="form-control"
            onChange={handleChangeImage}
            type="file"
            accept="image/*"
            multiple
          />
        </div>
      </div>
      <p className="mt-2 mb-2">Select tag</p>
      <div
        className="my-2 w-25 bg-light p-3 rounded"
        style={{ height: '150px', overflow: 'auto' }}
      >
        {tagsFetched.map((t, index) => {
          return (
            <div className="form-check" key={index}>
              <input
                className="form-check-input"
                type="radio"
                id="exampleRadios1"
                onChange={() => handleChangeSelectRadio(t._id)}
                checked={tag === t._id}
              />
              <label className="form-check-label" htmlFor="exampleRadios1">
                {t.tag_name}
              </label>
            </div>
          );
        })}
      </div>
      <div className="mt-3">
        <div className="w-100 text-end">
          <button className="btn btn-secondary w-25" disabled={isPosting}>
            {isPosting ? 'Posting..' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateForm;
