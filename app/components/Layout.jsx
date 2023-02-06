import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { isAuth, logout } from '../utils/auth';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { followingActions, profileActions } from '../store';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const Layout = (props) => {
  const dispatch = useDispatch();
  const { name, profile_image } = useSelector((state) => state.profileSlice);
  const token = Cookies.get('token');
  const [keyword, setKeyword] = useState('');
  const [userList, setUserList] = useState([]);

  const getFollowing = async () => {
    try {
      const resFollowing = await axios.get(`/user/get-following`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resProfile = await axios.get(`/user/get-initial-profile`, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      dispatch(
        followingActions.setInitialFollowing({
          followingFetched: resFollowing.data.following,
        })
      );
      dispatch(
        profileActions.setInitialProfile({
          name: resProfile.data.user.name,
          profile_image:
            resProfile.data.profile_image.url === ''
              ? '/static/images/unknown-profile.jpg'
              : resProfile.data.profile_image.url,
        })
      );
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (isAuth()) {
      getFollowing();
    }
    setKeyword('');
  }, [token]);

  const fetchUser = async (e) => {
    setKeyword(e.target.value.trim());
    if (e.target.value.trim() === '') {
      setUserList([]);
      return;
    }
    try {
      const res = await axios.post(
        `/user/user-autocomplete`,
        {
          keyword: e.target.value.trim(),
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      setUserList(res.data.users);
    } catch (e) {
      console.log(e);
    }
  };

  const findUserSubmit = (e) => {
    e.preventDefault();
    Router.push(`/search?key=${keyword}`);
  };

  const autocomplete = userList.map((user, index) => (
    <option key={index} value={user.name}>
      @{user.username}
    </option>
  ));
  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow p-3 mb-3 bg"
        style={{ boxShadow: '0 4px -2px black' }}
      >
        <div className="container-fluid">
          <Link
            href={`${isAuth() && isAuth().role === 'admin' ? '/admin' : '/'}`}
            legacyBehavior
          >
            <a className="navbar-brand">
              <img
                src="/static/images/logo.png"
                style={{ height: '50px' }}
                alt="logo image"
              />
            </a>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex align-items-center w-100 justify-content-end">
              <li className="nav-item me-auto">
                <Link href="/about-us" legacyBehavior>
                  <a className="nav-link" aria-current="page">
                    About us
                  </a>
                </Link>
              </li>
              {!isAuth() && (
                <>
                  <li className="nav-item mx-1">
                    <Link href="/login" legacyBehavior>
                      <a className="nav-link" aria-current="page">
                        Login
                      </a>
                    </Link>
                  </li>
                  <li className="nav-item mx-1">
                    <Link href="/register" legacyBehavior>
                      <a className="nav-link">Register</a>
                    </Link>
                  </li>
                </>
              )}
              {isAuth() && isAuth().role === 'user' && (
                <>
                  <li className="nav-item me-auto">
                    <form onSubmit={findUserSubmit}>
                      <input
                        className="form-control"
                        list="datalistOptions"
                        placeholder="Search..."
                        onChange={fetchUser}
                        value={keyword}
                      />
                      <datalist id="datalistOptions">{autocomplete}</datalist>
                    </form>
                  </li>
                  <li className="nav-item mx-1">
                    <Link href="/profile" legacyBehavior>
                      <a
                        className="nav-link d-flex align-items-center"
                        aria-current="page"
                      >
                        <img
                          src={profile_image}
                          alt="profile image"
                          className="me-1"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <span className="text-secondary">{name}</span>
                      </a>
                    </Link>
                  </li>
                  <li className="nav-item mx-1">
                    <Link href="/post/create" legacyBehavior>
                      <a className="nav-link" aria-current="page">
                        Create post
                      </a>
                    </Link>
                  </li>
                  <li className="nav-item mx-1">
                    <Link href="/tag/create" legacyBehavior>
                      <a className="nav-link" aria-current="page">
                        Create tag
                      </a>
                    </Link>
                  </li>
                  <li className="nav-item mx-1">
                    <Link href="/notification" legacyBehavior>
                      <a className="nav-link" aria-current="page">
                        Notification
                      </a>
                    </Link>
                  </li>
                  <li className="nav-item mx-1">
                    <Link href="/request" legacyBehavior>
                      <a className="nav-link" aria-current="page">
                        Requests
                      </a>
                    </Link>
                  </li>
                </>
              )}
              {isAuth() && isAuth().role === 'admin' && (
                <>
                  <li className="nav-item mx-1">
                    <Link
                      href="/admin/view-posts"
                      className="nav-link"
                      aria-current="page"
                    >
                      View all posts
                    </Link>
                  </li>
                  <li className="nav-item mx-1">
                    <Link
                      href="/admin/view-users"
                      className="nav-link"
                      aria-current="page"
                    >
                      View all users
                    </Link>
                  </li>
                </>
              )}
              {isAuth() && (
                <li className="nav-item mx-1">
                  <a
                    className="nav-link"
                    onClick={() => logout()}
                    aria-current="page"
                    style={{ cursor: 'pointer' }}
                  >
                    Logout
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <div
        className="container-fluid p-3"
        style={{
          width: '100%',
          height: '100%',
          marginTop: '72px',
          backgroundColor: '#E5E7E9',
        }}
      >
        <div className="container mt-3">{props.children}</div>
      </div>
    </>
  );
};

export default Layout;
