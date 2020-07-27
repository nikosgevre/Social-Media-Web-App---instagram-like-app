import React, {Component} from 'react';
import { NavLink } from 'react-router-dom';

import styles from './ChatUsers2.module.css';

class ChatUsers extends Component {

  state = {
    userImage: ''
  };

  componentDidMount() {
    this.fetchUser();
    // sockets for instant updating changes on a post
    // const socket = openSocket('http://localhost:8080');
    // socket.on('post', data => {
    //   if (data.action === 'createComment') {
    //     // this.loadComments();
    //     this.loadPost();
    //     // this.loadComments();
    //   } else if (data.action === 'postLike') {
    //     // this.loadPost();
    //     this.loadLikes();
    //   } else if (data.action === 'deleteComment') {
    //     this.loadPost();
    //     // this.loadComments();
    //   } else if (data.action === 'editComment') {
    //     this.loadComments();
    //   }
    // });
  };

  // get user profile handler
  fetchUser = () => {
    const userId = this.props.id;
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
        userImage: 'http://localhost:8080/' + resData.user.image
      });
    })
    .catch(this.catchError);
  };

  render () {

    // post's header creator
    let postUser = (
      <header className={styles.post__header}>
        <div className={styles.PostUser}>
          <div className={styles.PostUserAvatar}>
            <img src={this.state.userImage} alt={this.props.author} />
          </div>
          <div className={styles.PostUserNickname}>
            {/* <NavLink className={styles.Navlink} to={'/profile/' + this.props.user._id} user={this.props.user}>{this.props.user.name}</NavLink> */}
            <div className={styles.Navlink}>{this.props.user.name}</div>
          </div>
        </div>
      </header>
    );

    return (
      <button className={styles.post} onClick={this.props.onClick}>
        {postUser}
      </button>
    );
  }
}

export default ChatUsers;