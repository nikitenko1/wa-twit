import Link from 'next/link';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import Resizer from 'react-image-file-resizer';
import jwt from 'jsonwebtoken';
import { toast } from 'react-toastify';

const OnePost = ({
  fetchComments,
  post,
  token,
  onLikeHandler,
  onUnlikeHandler,
  onRetweetHandler,
  onUnRetweetHandler,
  onInsertNewCommentHandler,
  onSetCommentNumber,
  commentNumber,
}) => {
  const { _id } = jwt.decode(token);
  const imageLength = post.images.length;
  const [data, setData] = useState({
    comment: '',
    image: '',
  });
  const { comment, image } = data;

  const [loading, setLoading] = useState(false);
  const ownerId = post.postedBy._id;

  const handleChange = (e) => {
    setData({
      ...data,
      comment: e.target.value,
    });
  };

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
    const file = e.target.files[0];
    const image = await resizeFile(file);
    setData({
      ...data,
      image: image,
    });
  };

  useEffect(() => {
    fetchComments();
  }, [setLoading]);

  const handleSubmit = async (postId) => {
    if (comment.trim() === '') {
      return toast.error('Comment is required.');
    }
    if (comment.length > 256) {
      return toast.error('Comment must be less than 256 characters.');
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `/comment`,
        {
          comment,
          ownerId,
          postId,
          image,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      await onSetCommentNumber(commentNumber + 1);

      toast.success(res.data.message);

      setData({
        comment: '',
        image: '',
      });

      await onInsertNewCommentHandler(res.data.newComment);
      setTimeout(() => {
        Router.reload(window.location.pathname);
      }, 3000);
    } catch (e) {
      toast.error(e.response.data.error);
    }
    setLoading(false);
  };

  const deleteHandler = async (postId) => {
    const answer = window.confirm('Are you sure you want to delete this post.');
    if (answer) {
      try {
        await axios.delete(`/post/delete-post/${postId}`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });
        Router.push('/profile');
      } catch (e) {
        toast.error(e.response.data.error);
      }
    }
  };

  let imageContent = '';

  if (imageLength === 1) {
    imageContent = (
      <div className="w-100 px-4 py-2 text-center">
        <img
          src={post.images[0].url}
          alt="image"
          style={{ height: '280px', width: 'auto', objectFit: 'cover' }}
        />
      </div>
    );
  } else if (imageLength === 2) {
    imageContent = (
      <div className="w-100 d-flex px-4 py-2 text-center">
        <img
          src={post.images[0].url}
          alt="image"
          className="w-50 me-1"
          style={{ objectFit: 'cover' }}
        />
        <img
          src={post.images[1].url}
          alt="image"
          className="w-50 ms-1"
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  } else if (imageLength === 3) {
    imageContent = (
      <div className="w-100 px-4 py-2 text-center">
        <div className="w-100 mb-2">
          <img
            src={post.images[0].url}
            alt="image"
            className="w-100"
            style={{ height: '300px', objectFit: 'cover' }}
          />
        </div>
        <div className="d-flex w-100">
          <img
            src={post.images[1].url}
            alt="image"
            className="w-50 me-1"
            style={{ objectFit: 'cover' }}
          />
          <img
            src={post.images[2].url}
            alt="image"
            className="w-50 ms-1"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
    );
  } else if (imageLength === 4) {
    imageContent = (
      <div className="w-100 px-4 py-2 text-center">
        <div className="d-flex w-100 mb-2">
          <img src={post.images[0].url} alt="image" className="w-50 me-1" />
          <img src={post.images[1].url} alt="image" className="w-50 ms-1" />
        </div>
        <div className="d-flex w-100">
          <img src={post.images[2].url} alt="image" className="w-50 me-1" />
          <img src={post.images[3].url} alt="image" className="w-50 ms-1" />
        </div>
      </div>
    );
  }
  let tag_name = <span></span>;

  if (post.tag !== null) {
    tag_name = (
      <span>
        <Link href={`/tag/${post.tag._id}`}>#{post.tag.tag_name}</Link>
      </span>
    );
  }

  return (
    <>
      {/* Modal */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Comment
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <div className="form-floating">
                <textarea
                  className="form-control"
                  placeholder="Leave a comment here"
                  id="floatingTextarea2"
                  onChange={handleChange}
                  style={{ height: 200 }}
                  value={comment}
                  maxLength="256"
                />
                <label htmlFor="floatingTextarea2">Comments</label>
              </div>
              <div className="my-2">
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleChangeImage}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSubmit(post._id)}
                disabled={loading}
              >
                {loading ? 'Commenting..' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      <div className="alert alert-light p-2 rounded-3 shadow-sm">
        <div
          className={`${
            _id === post.postedBy._id ? 'd-flex justify-content-between' : ''
          }`}
        >
          <Link
            href={`/profile/${post.postedBy.user.username}`}
            className="m-3 d-flex align-items-center w-50 text-break"
          >
            <img
              src={
                post.postedBy.profile_image.url === ''
                  ? '/static/images/unknown-profile.jpg'
                  : post.postedBy.profile_image.url
              }
              alt="..."
              style={{
                height: '60px',
                width: '60px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <div className="p-2 d-flex align-items-center">
              <p className="text-dark fw-bold">
                {post.postedBy.user.name}
                <br />
                <span className="fw-normal text-secondary">
                  @{post.postedBy.user.username}
                </span>
              </p>
            </div>
          </Link>
          {_id === post.postedBy._id && (
            <div className="p-3">
              <img
                src="/static/images/delete.png"
                alt="delete"
                style={{ width: '45px', cursor: 'pointer' }}
                onClick={() => deleteHandler(post._id)}
                title="delete"
              />
            </div>
          )}
        </div>
        <div className="px-3 text-break">
          <p>
            {post.content} {tag_name}
          </p>
        </div>
        {imageContent}
        <div className="text-end px-4">
          <p className="text-secondary">{moment(post.createdAt).fromNow()}</p>
        </div>
        <div className="d-flex justify-content-between p-2">
          <div>
            <img
              src="/static/images/comment.png"
              style={{ width: '35px', cursor: 'pointer' }}
              alt="comment image"
              data-bs-toggle="modal"
              data-bs-target="#exampleModal"
            />
            <span className="ms-1">{commentNumber}</span>
          </div>
          <div>
            {post.retweet.includes(_id) ? (
              <img
                src="/static/images/retweet-on.png"
                style={{ width: '35px', cursor: 'pointer' }}
                alt="retweet image"
                onClick={() => onUnRetweetHandler(post._id, post.postedBy._id)}
              />
            ) : (
              <img
                src="/static/images/retweet-off.png"
                style={{ width: '35px', cursor: 'pointer' }}
                alt="retweet image"
                onClick={() => onRetweetHandler(post._id, post.postedBy._id)}
              />
            )}
            <span className="ms-1">{post.retweet.length}</span>
          </div>
          <div>
            {post.like.includes(_id) ? (
              <img
                src="/static/images/heart.png"
                alt="like image"
                style={{ cursor: 'pointer', width: '32px' }}
                onClick={() => onUnlikeHandler(post._id, post.postedBy._id)}
              />
            ) : (
              <img
                src="/static/images/heart-empty.png"
                alt="like image"
                style={{ cursor: 'pointer', width: '32px' }}
                onClick={() => onLikeHandler(post._id, post.postedBy._id)}
              />
            )}
            <span className="ms-1">{post.like.length}</span>
          </div>
        </div>
        <hr />
      </div>
    </>
  );
};

export default OnePost;
