import moment from 'moment';
import Link from 'next/link';

const Follow = ({ notification }) => {
  const { from_user, createdAt } = notification;
  const { user, profile_image } = from_user;
  const { name, username } = user;

  return (
    <div className="alert bg-light rounded-3 shadow-sm">
      <Link href={`/profile/${username}`} className="d-flex align-items-center">
        <img
          src={
            profile_image.url === ''
              ? '/static/images/unknown-profile.jpg'
              : profile_image.url
          }
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '50%',
          }}
          alt="profile image"
        />
        <div className="w-100 ms-2 d-flex">
          <p className="fw-bold">
            {name}
            <span className="text-secondary">
              {' '}
              ( @{username} )<span className="text-dark"> has follow you.</span>
            </span>
          </p>
        </div>
      </Link>
      <div className="d-flex">
        <p className="text-dark ms-auto">{moment(createdAt).fromNow()}</p>
      </div>
    </div>
  );
};

export default Follow;
