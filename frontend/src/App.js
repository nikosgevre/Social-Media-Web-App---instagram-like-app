import React, { Component, Fragment } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

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
import PasswordResetPage from './pages/Auth/Reset/ResetPassword/Reset';
import NewPasswordPage from './pages/Auth/Reset/ResetPassword/NewPassword';
import EmailResetPage from './pages/Auth/Reset/ResetEmail/Reset';
import NewEmailPage from './pages/Auth/Reset/ResetEmail/NewEmail';
// import styles from './App.module.css';

class App extends Component {
  state = {
    showBackdrop: false,
    showMobileNav: false,
    isAuth: false,
    token: null,
    userId: null,
    authLoading: false,
    error: null
  };

  componentDidMount() {
    const token = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      this.logoutHandler();
      return;
    }
    const userId = localStorage.getItem('userId');
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    this.setState({ isAuth: true, token: token, userId: userId });
    this.setAutoLogout(remainingMilliseconds);
  }

  mobileNavHandler = isOpen => {
    this.setState({ showMobileNav: isOpen, showBackdrop: isOpen });
  };

  backdropClickHandler = () => {
    this.setState({ showBackdrop: false, showMobileNav: false, error: null });
  };

  logoutHandler = () => {
    this.setState({ isAuth: false, token: null });
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userId');
    this.props.history.replace('/');
  };

  loginHandler = (event, authData) => {
    event.preventDefault();
    this.setState({ authLoading: true });
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
        // console.log(resData);
        this.setState({
          isAuth: true,
          token: resData.token,
          authLoading: false,
          userId: resData.userId
        });
        localStorage.setItem('token', resData.token);
        localStorage.setItem('userId', resData.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem('expiryDate', expiryDate.toISOString());
        this.setAutoLogout(remainingMilliseconds);
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isAuth: false,
          authLoading: false,
          error: err
        });
      });
  };

  signupHandler = (event, authData) => {
    event.preventDefault();
    this.setState({ authLoading: true });
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
        this.setState({ isAuth: false, authLoading: false });
        this.props.history.replace('/');
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isAuth: false,
          authLoading: false,
          error: err
        });
      });
  };

  resetHandler = (event, authData) => {
    event.preventDefault();
    this.setState({ authLoading: false });
    // console.log(type);
    fetch('http://localhost:8080/auth/reset?type=' + authData.type, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: authData.email
      })
    })
      .then(res => {
        if (res.status === 422) {
          throw new Error('Reset password failed.');
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Could not authenticate you!');
        }
        return res.json();
      })
      .then(resData => {
        this.props.history.push('/');
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isAuth: false,
          authLoading: false,
          error: err
        });
      });
  };

  newCredentialsHandler = (event, authData) => {
    event.preventDefault();
    this.setState({ authLoading: false });
    console.log(authData.type);
    const formData = new FormData();
    if(authData.type==='password'){
      formData.append('password', authData.password);
      formData.append('userId', authData.userId);
      formData.append('resetToken', authData.passwordToken);
    } else if(authData.type==='email'){
      formData.append('email', authData.email);
      formData.append('resetToken', authData.emailToken);
      formData.append('userId', authData.userId);
    }
    // formData.append('userId', authData.userId);
    // for (var pair of formData.entries()) {
    //   console.log(pair[0]+ ' - ' + pair[1]); 
    // }
    fetch('http://localhost:8080/auth/new-credentials?type=' + authData.type, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token
      },
      body: formData
    })
      .then(res => {
        if (res.status === 422) {
          throw new Error('Reset failed.');
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Could not authenticate you!');
        }
        return res.json();
      })
      .then(resData => {
        this.props.history.push('/');
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isAuth: false,
          authLoading: false,
          error: err
        });
      });
  };

  setAutoLogout = milliseconds => {
    setTimeout(() => {
      this.logoutHandler();
    }, milliseconds);
    // this.props.history.replace('/');
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {
    
    let routes = (
      <Switch>
        <Route
          path="/"
          exact
          render={props => (
            <LoginPage
              {...props}
              onLogin={this.loginHandler}
              loading={this.state.authLoading}
            />
          )}
        />
        <Route
          path="/signup"
          exact
          render={props => (
            <SignupPage
              {...props}
              onSignup={this.signupHandler}
              loading={this.state.authLoading}
            />
          )}
        />
        <Route
          path="/resetPassword"
          exact
          render={props => (
            <PasswordResetPage
              {...props}
              token={this.state.token}
              onReset={this.resetHandler}
              loading={this.state.authLoading}
            />
          )}
        />
        <Route
          path="/resetP/:token"
          exact
          render={props => (
            <NewPasswordPage
              {...props}
              token={this.state.token}
              onSetNewPassword={this.newCredentialsHandler}
              loading={this.state.authLoading}
            />
          )}
        />
        {/* <Redirect to="/" /> */}
      </Switch>
    );
    if (this.state.isAuth) {
      routes = (
        <Switch>
          <Route
            path="/"
            exact
            render={props => (
              <FeedPage userId={this.state.userId} token={this.state.token} />
            )}
          />
          <Route
            path="/search"
            // exact
            render={props => (
              <SearchPage 
                {...props} 
                userId={this.state.userId} 
                token={this.state.token} 
              />
            )}
          />
          <Route
            path="/profile/:userId"
            // exact
            render={props => (
              <ProfilePage 
                {...props} 
                userId={this.state.userId} 
                token={this.state.token} 
              />
            )}
          />
          <Route
            path="/chat"
            // exact
            render={props => (
              <ProfilePage 
                {...props} 
                userId={this.state.userId} 
                token={this.state.token} 
              />
            )}
          />
          <Route
            path="/resetEmail"
            exact
            render={props => (
              <EmailResetPage
                {...props}
                token={this.state.token}
                onReset={this.resetHandler}
                loading={this.state.authLoading}
              />
            )}
          />
          <Route
            path="/resetE/:token"
            exact
            render={props => (
              <NewEmailPage
                {...props}
                token={this.state.token}
                onSetNewEmail={this.newCredentialsHandler}
                loading={this.state.authLoading}
              />
            )}
          />
          <Route
            path="/:postId"
            // exact
            render={props => (
              <SinglePostPage
                {...props}
                userId={this.state.userId}
                token={this.state.token}
              />
            )}
          />
          {/* <Redirect to="/" /> */}
        </Switch>
      );
    }

    return (
      <Fragment>
        {this.state.showBackdrop && (
          <Backdrop onClick={this.backdropClickHandler} />
        )}
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <Layout
          header={
            <Toolbar>
              <MainNavigation
                onOpenMobileNav={this.mobileNavHandler.bind(this, true)}
                onLogout={this.logoutHandler}
                isAuth={this.state.isAuth}
                userId={this.state.userId}
                token={this.state.token}
                // history={this.props.history}
              />
            </Toolbar>
          }
          mobileNav={
            <MobileNavigation
              open={this.state.showMobileNav}
              mobile
              onChooseItem={this.mobileNavHandler.bind(this, false)}
              onLogout={this.logoutHandler}
              isAuth={this.state.isAuth}
              userId={this.state.userId}
            />
          }
        />
        {routes}
      </Fragment>
    );
  }
}

export default withRouter(App);
