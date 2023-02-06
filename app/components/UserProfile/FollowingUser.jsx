import Link from 'next/link';

const FollowingUser = ({ user }) => {
  return (
    <div className="p-2">
      <Link
        to={`/profile/${user.user.username}`}
        className=" d-flex align-items-center text-decoration-none"
      >
        <img
          src={
            user.profile_image.url === ''
              ? '/static/images/unknown-profile.jpg'
              : user.profile_image.url
          }
          style={{
            width: '55px',
            height: '55px',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
          alt="profile image"
        />
        <div className="ms-2">
          <p className="fw-bold fs-5">
            {user.user.name}
            <br />
            <span className="fw-normal text-secondary">
              @{user.user.username}
            </span>
          </p>
        </div>
      </Link>
    </div>
  );
};

export default FollowingUser;
