import Router from 'next/router';
import { useState } from 'react';
import axios from 'axios';
import Resizer from 'react-image-file-resizer';
import { useDispatch } from 'react-redux';
import { profileActions } from '../../store';
import { toast } from 'react-toastify';

const Edit = (props) => {
  const dispatch = useDispatch();
  const [data, setData] = useState({
    private_: props.data.private,
    name: props.data.user.name,
    username: props.data.user.username,
    bio: props.data.bio,
    profile_image: '',
    cover_image: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [initialImage, setInitialImage] = useState({
    profile:
      props.data.profile_image.url === ''
        ? '/static/images/unknown-profile.jpg'
        : props.data.profile_image.url,
    cover:
      props.data.cover_image.url === ''
        ? '/static/images/cover-grey.png'
        : props.data.cover_image.url,
  });
  const [imagePreview1, setImagePreview1] = useState(
    props.data.profile_image.url === ''
      ? '/static/images/unknown-profile.jpg'
      : props.data.profile_image.url
  );
  const [imagePreview2, setImagePreview2] = useState(
    props.data.cover_image.url === ''
      ? '/static/images/cover-grey.png'
      : props.data.cover_image.url
  );

  const { private_, name, username, bio, profile_image, cover_image } = data;

  const token = props.token;

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

  const handleChange = (type) => (e) => {
    setData({
      ...data,
      [type]: e.target.value,
    });
  };
  const toggleChangeHandler = () => setData({ ...data, private_: !private_ });

  const handleProfileImage = async (e) => {
    const file = e.target.files[0];
    const image = await resizeFile(file);
    setData({
      ...data,
      profile_image: image,
    });
    setImagePreview1(URL.createObjectURL(file));
  };

  const handleCoverImage = async (e) => {
    const file = e.target.files[0];
    const image = await resizeFile(file);
    setData({
      ...data,
      cover_image: image,
    });
    setImagePreview2(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim() === '') {
      return toast.error('Username is required.');
    }
    if (name.trim().length > 32) {
      return toast.error('Name must be less than 32 characters.');
    }
    if (username.trim() === '') {
      return toast.error('Username is required.');
    }
    if (username.trim().length > 16) {
      return toast.error('Username must be less than 16 characters.');
    }
    if (bio.length > 128) {
      return toast.error('Bio must be less than 128 characters.');
    }
    try {
      setIsEditing(true);
      const res = await axios.post(
        `/user/edit-profile`,
        {
          name,
          username,
          bio,
          profile_image,
          cover_image,
          private_,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      toast.success(res.data.message);

      if (res.data.profile_url && res.data.cover_url) {
        setInitialImage({
          cover: res.data.cover_url,
          profile: res.data.profile_url,
        });
        dispatch(
          profileActions.updateProfile({
            name,
            profile_image: res.data.profile_url,
          })
        );
      } else if (res.data.profile_url) {
        setInitialImage({
          ...initialImage,
          profile: res.data.profile_url,
        });
        dispatch(
          profileActions.updateProfile({
            name,
            profile_image: res.data.profile_url,
          })
        );
      } else if (res.data.cover_url) {
        setInitialImage({
          ...initialImage,
          cover: res.data.cover_url,
        });
      } else {
        dispatch(
          profileActions.updateProfile({
            name: name,
          })
        );
      }
    } catch (e) {
      toast.error(e.response.data.error);
    }
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="display-4 mb-3">Edit profile</p>
      <div className="py-2">
        <img
          src={imagePreview2}
          alt="cover image"
          className="w-100 rounded-2 mb-1"
          style={{ height: '260px', objectFit: 'cover' }}
        />
        <br />
        <span className="text-secondary">Upload cover image</span>

        <input
          type="file"
          className="form-control w-25"
          accept="image/*"
          onChange={handleCoverImage}
        />
      </div>
      <div className="py-2 mb-2">
        <img
          src={imagePreview1}
          alt="profile image"
          className="my-2"
          style={{
            height: '160px',
            width: '160px',
            objectFit: 'cover',
            borderRadius: '50%',
          }}
        />
        <br />
        <span className="text-secondary">Upload profile image</span>
        <input
          type="file"
          className="form-control w-25"
          accept="image/*"
          onChange={handleProfileImage}
        />
      </div>
      <div className="form-check form-switch mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckChecked"
          checked={private_}
          onChange={toggleChangeHandler}
        />
        <label className="form-check-label" htmlFor="flexSwitchCheckChecked">
          Private
        </label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="name"
          className="form-control"
          id="floatingInput1"
          placeholder="name@example.com"
          value={name}
          maxLength="32"
          onChange={handleChange('name')}
        />
        <label htmlFor="floatingInput1">Name</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="name"
          className="form-control"
          id="floatingInput2"
          placeholder="name@example.com"
          value={username}
          maxLength="16"
          onChange={handleChange('username')}
        />
        <label htmlFor="floatingInput2">Username</label>
      </div>
      <div className="form-floating">
        <textarea
          className="form-control"
          placeholder="Leave a comment here"
          id="floatingTextarea2"
          style={{ height: '150px' }}
          defaultValue={bio}
          maxLength="128"
          onChange={handleChange('bio')}
        />
        <label htmlFor="floatingTextarea2">Bio</label>
      </div>
      <div className="mt-3 text-end">
        <button
          className="btn btn-outline-secondary me-3"
          type="button"
          onClick={() => Router.push('/profile/change-password')}
        >
          Change password
        </button>
        <button className="btn btn-secondary px-5" disabled={isEditing}>
          {isEditing ? 'Saving..' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default Edit;
