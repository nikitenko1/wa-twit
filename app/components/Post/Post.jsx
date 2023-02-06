import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import jwt from 'jsonwebtoken';

const Post = ({
  post,
  token,
  onLikeHandler,
  onUnlikeHandler,
  onRetweetHandler,
  onUnRetweetHandler,
}) => {
  const router = useRouter();
  const { _id } = jwt.decode(token);
  const imageLength = post.images.length;

  let imageContent = '';

  if (imageLength > 0) {
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
      <div className="alert alert-light p-2 rounded-3 shadow-sm border">
        <div className="d-flex justify-content-around">
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
              alt=""
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
          <Link href={`/post/${post._id}`} className="ms-auto p-2">
            <img
              src="/static/images/full-screen.png"
              style={{ width: '25px' }}
              alt="view"
              title="View post"
            />
          </Link>
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
              onClick={() => router.push(`/post/${post._id}`)}
            />
            <span className="ms-1 text-success">{post.comment_number}</span>
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
          {post.like.includes(_id) ? (
            <img
              src="/static/images/heart.png"
              alt="link image"
              style={{ cursor: 'pointer', width: '32px' }}
              onClick={() => onUnlikeHandler(post._id, post.postedBy._id)}
            />
          ) : (
            <img
              src="/static/images/heart-empty.png"
              alt="link image"
              style={{ cursor: 'pointer', width: '32px' }}
              onClick={() => onLikeHandler(post._id, post.postedBy._id)}
            />
          )}
          <span className="ms-1">{post.like.length}</span>
        </div>
        <hr />
      </div>
    </>
  );
};

export default Post;
