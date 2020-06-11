import React, { Component, Fragment } from 'react';

import openSocket from 'socket.io-client';
// import ChatUsers from '../../components/Chat/ChatUsers';
import ChatUsers from '../../components/Chat/ChatUsers2';
import Message from '../../components/Chat/Message/Message';

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';

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
    message: 'Pick someone to chat with!',
    clicked: false,
    msgloading: true,
    messages: [],
    clickedUser: ''
  };

  componentDidMount() {
    // get user profile and sockets
    this.fetchUser();
    this.fetchUsers();
    const socket = openSocket('http://localhost:8080');
    socket.on('chat', data => {
      if (data.action === 'create') {
        this.loadMessages(this.state.clickedUser);
      } else if (data.action === 'delete') {
        this.loadMessages(this.state.clickedUser);
      }
    });
  };

  // get user handler
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

  loadMessages = (user) => {
    fetch('http://localhost:8080/chat/messages?user1=' + this.props.userId + '&user2=' + user._id, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch messages.');
      }
      return res.json();
    })
    .then(resData => {
      this.setState({
        messages: resData.messages.map(msg => {
          return {
            ...msg
          };
        }),
        msgLoading: false
      });
    })
    .catch(this.catchError);
  };

  clicked = (user) => {
    // event.preventDefault();
    // console.log('clicked');
    this.loadMessages(user);
    this.setState({
      message: user.name,
      clickedUser: user,
      clicked: true
    })
  };

  // part of updating user status handler
  messageInputChangeHandler = (input, value) => {
    this.setState({ message: value });
  };

  // send message handler
  messageSendHandler = event => {
    event.preventDefault();
    fetch('http://localhost:8080/chat/message?from=' + this.state.trueUser._id + '&to=' + this.state.clickedUser._id, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: this.state.message
      })
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Can't send message!");
      }
      return res.json();
    })
    .then(resData => {
      console.log(resData);
    })
    .catch(this.catchError);
  };

  // delete message handler
  deleteMessageHandler = msgId => {
    this.setState({ msgloading: true });
    fetch('http://localhost:8080/chat/message/' + msgId, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting the message failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
      })
      .catch(err => {
        console.log(err);
        this.setState({ msgloading: false });
      });
  };

  render() {
    // // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    // let vh = window.innerHeight * 0.01;
    // // Then we set the value in the --vh custom property to the root of the document
    // document.documentElement.style.setProperty('--vh', `${vh}px`);
    // // We listen to the resize event
    // window.addEventListener('resize', () => {
    //   // We execute the same script as before
    //   let vh = window.innerHeight * 0.01;
    //   document.documentElement.style.setProperty('--vh', `${vh}px`);
    // });
    // console.log(this.state.messages);

    return (
      <Fragment>
        <div style={{textAlign: "center"}}><strong>Messages</strong></div>
        <hr></hr>
        <div className={styles.container}>
          <div className = {styles.test1}>
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
          {/* <div className = {styles.test2}>
            <p>{this.state.message}</p>
          </div> */}
          {this.state.clicked && (
            <div className = {styles.test2}>
              {!this.state.msgLoading && (
                <div>
                  {this.state.messages.map(msg => (
                    <Message
                      key={msg._id}
                      id={msg._id}
                      token={this.props.token}
                      from={msg.from}
                      to={msg.to}
                      trueUser={this.state.trueUser._id}
                      date={new Date(msg.createdAt).toLocaleString('en-US')}
                      content={msg.content}
                      onDelete={this.deleteMessageHandler.bind(this, msg._id)}
                    />
                  ))}
                </div>
              )}
              <section className={styles.feed__status}>
                <form onSubmit={this.messageSendHandler}>
                  <Input
                    type="text"
                    placeholder="Message"
                    control="input"
                    onChange={this.messageInputChangeHandler}
                  />
                  <Button mode="flat" type="submit">
                    Send
                  </Button>
                </form>
              </section>
            </div>
          )}
          
        </div>
      </Fragment>
    )
  };
}

export default Chat;
