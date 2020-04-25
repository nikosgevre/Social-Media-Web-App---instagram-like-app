import React, { Component, Fragment } from 'react';

// import ChatUsers from '../../components/Chat/ChatUsers';
import ChatUsers from '../../components/Chat/ChatUsers2';

import styles from './Chat.module.css';

class Chat extends Component {
  state = {
    isLoading: true,
    isOpen: false,
    userLoading: false,
    trueUser: {},
    users: [],
    userImage: '',
    following: [],
    displayContactSwitch: [],
    message: 'Pick someone to chat with!'
  };

  componentDidMount() {
    // get user profile and sockets
    this.fetchUser();
    this.fetchUsers();
    // const socket = openSocket('http://localhost:8080');
    // socket.on('posts', data => {
    //   if (data.action === 'create') {
    //     // this.addPost(data.post);
    //   } else if (data.action === 'update') {
    //     // this.updatePost(data.post);
    //   } else if (data.action === 'delete') {
    //     this.loadPosts();
    //   }
    // });
  };

  // get user profile handler
  fetchUser = (direction) => {
    if (direction) {
      this.setState({ userLoading: true, trueUser: {} });
    }
    const userId = localStorage.getItem('userId');
    fetch('http://localhost:8080/user/profile/' + userId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch user.');
      }
      return res.json();
    })
    .then(resData => {
      this.setState({
        trueUser: resData.user,
        userImage: 'http://localhost:8080/' + resData.user.image,
        following: resData.user.following.map(following => {
          return {
            ...following
          }
        }),
        userLoading: false
      });
    })
    .catch(this.catchError);
  };

  fetchUsers = () => {
    if(this.props.token){
      fetch('http://localhost:8080/user/getUsers', {
        headers: {
          Authorization: 'Bearer ' + this.props.token
        }
      })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch users.');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({ 
          users: resData.users.map(user => {
            return {
              ...user
            };
          })
        });
        
      })
      .catch(this.catchError);
    }
  };

  clicked = (user) => {
    // event.preventDefault();
    // console.log('clicked');
    this.setState({
      message: user.name
    })
  };

  render() {
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    // We listen to the resize event
    window.addEventListener('resize', () => {
      // We execute the same script as before
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });


    return (
      <Fragment>
        <div style={{textAlign: "center"}}><strong>Messages</strong></div>
        <hr></hr>
        <div className={styles.container}>
          <div className = {styles.test}>
            {this.state.following.map(user => (
              <ChatUsers
                key={user._id}
                id={user._id}
                token={this.props.token}
                user={user}
                trueUser={this.state.trueUser}
                onClick={this.clicked.bind(this, user)}
              />
            ))}
          </div>
          <div className = {styles.test2}>
            <p>{this.state.message}</p>
          </div>
        </div>
      </Fragment>
    )
  };
}

export default Chat;
