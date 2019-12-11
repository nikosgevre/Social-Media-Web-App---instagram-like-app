import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import Layout from './components/Layout/Layout';
import Backdrop from './components/Backdrop/Backdrop';
import Toolbar from './components/Toolbar/Toolbar';
import MainNavigation from './components/Navigation/MainNavigation/MainNavigation';
import MobileNavigation from './components/Navigation/MobileNavigation/MobileNavigation';
import ErrorHandler from './components/ErrorHandler/ErrorHandler';
import FeedPage from './pages/Feed/Feed';
import SinglePostPage from './pages/Feed/SinglePost/SinglePost';
import LoginPage from './pages/Auth/Login';
import SignupPage from './pages/Auth/Signup';
import SearchPage from './pages/Search/Search.js';
import ProfilePage from './pages/Profile/Profile.js';
import './App.css';

const App = (props) => {

  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  const logoutHandler = useCallback(() => {
    // event.preventDefault();
    // console.log('~~~~~~~~~');
    setIsAuth(false);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userId');
    props.history.replace('/');
  }, [props.history]);

  const setAutoLogout = useCallback((milliseconds) => {
    // event.preventDefault();
    setTimeout(() => {
      logoutHandler();
    }, milliseconds);
    // this.props.history.replace('/');
  }, [logoutHandler]);

  useEffect( () => {
    const token1 = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');
    if (!token1 || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }
    const userId1 = localStorage.getItem('userId');
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    setIsAuth(true);
    setToken(token1);
    setUserId(userId1);
    setAutoLogout(remainingMilliseconds);
    // console.log(token + ' : ' + token1 );
  }, [logoutHandler, setAutoLogout]);

  const mobileNavHandler = (isOpen) => {
    setShowMobileNav(isOpen);
    setShowBackdrop(isOpen);
  };

  const backdropClickHandler = () => {
    setShowBackdrop(false);
    setShowMobileNav(false);
    setError(null);
  };

  const loginHandler = (event, authData) => {
    event.preventDefault();
    setAuthLoading(true);
    fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: authData.email,
        password: authData.password
      })
    })
      .then(res => {
        if (res.status === 422) {
          throw new Error('Validation failed.');
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Could not authenticate you!');
        }
        return res.json();
      })
      .then(resData => {
        setIsAuth(true);
        setToken(resData.token);
        setAuthLoading(false);
        setUserId(resData.userId);
        localStorage.setItem('token', resData.token);
        localStorage.setItem('userId', resData.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem('expiryDate', expiryDate.toISOString());
        setAutoLogout(remainingMilliseconds);
      })
      .catch(err => {
        console.log(err);
        setIsAuth(false);
        setAuthLoading(false);
        setError(err);
      });
  };

  const signupHandler = (event, authData) => {
    event.preventDefault();
    setAuthLoading(true);
    fetch('http://localhost:8080/auth/signup', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: authData.signupForm.email.value,
        password: authData.signupForm.password.value,
        name: authData.signupForm.name.value
      })
    })
      .then(res => {
        if (res.status === 422) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Creating a user failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        setIsAuth(false);
        setAuthLoading(false);
        props.history.replace('/');
      })
      .catch(err => {
        console.log(err);
        setIsAuth(false);
        setAuthLoading(false);
        setError(err);
      });
  };

  const errorHandler = () => {
    setError(null);
  };

    
  let routes = (
    <Switch>
      <Route
        path="/"
        exact
        render={props => (
          <LoginPage
            {...props}
            onLogin={loginHandler}
            loading={authLoading}
          />
        )}
      />
      <Route
        path="/signup"
        exact
        render={props => (
          <SignupPage
            {...props}
            onSignup={signupHandler}
            loading={authLoading}
          />
        )}
      />
      {/* <Redirect to="/" /> */}
    </Switch>
  );
  if (isAuth) {
    routes = (
      <Switch>
        <Route
          path="/"
          exact
          render={props => (
            <FeedPage userId={userId} token={token} />
          )}
        />
        <Route
          path="/search"
          // exact
          render={props => (
            <SearchPage 
              {...props} 
              userId={userId} 
              token={token} 
            />
          )}
        />
        <Route
          path="/profile/:userId"
          // exact
          render={props => (
            <ProfilePage 
              {...props} 
              userId={userId} 
              token={token} 
            />
          )}
        />
        <Route
          path="/:postId"
          // exact
          render={props => (
            <SinglePostPage
              {...props}
              userId={userId}
              token={token}
            />
          )}
        />
        {/* <Redirect to="/" /> */}
      </Switch>
    );
  }
  // console.log('------------' + token);

  return (
    <Fragment>
      {showBackdrop && (
        <Backdrop onClick={backdropClickHandler} />
      )}
      <ErrorHandler error={error} onHandle={errorHandler} />
      <Layout
        header={
          <Toolbar>
            <MainNavigation
              onOpenMobileNav={mobileNavHandler.bind(this, true)}
              onLogout={logoutHandler}
              isAuth={isAuth}
              userId={userId}
              token={token}
              history={props.history}
            />
          </Toolbar>
        }
        mobileNav={
          <MobileNavigation
            open={showMobileNav}
            mobile
            onChooseItem={mobileNavHandler.bind(this, false)}
            onLogout={logoutHandler}
            isAuth={isAuth}
            userId={userId}
          />
        }
      />
      {routes}
    </Fragment>
  );
}

export default withRouter(App);
