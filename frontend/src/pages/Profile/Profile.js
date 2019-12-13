import React, { Component, Fragment } from 'react';
import openSocket from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';

import styles from './Profile.module.css'; 
import btStyles from '../../Assets/global-styles/bootstrap.min.module.css';

class Profile extends Component {

  state = {
    isEditing: false,
    totalPosts: 0,
    editPost: null,
    postPage: 1,
    postsLoading: true,
    editLoading: false,
    user: {},
    posts: [],
    caller: 'profile',
    followers: [],
    following: [],
    userImage: '',
    userIdNew: '',
    trueUserId: localStorage.getItem('userId')
  };

  componentDidMount() {
    const userId = this.props.match.params.userId;
    this.setState({userIdNew: userId});
    this.fetchUser();
    const socket = openSocket('http://localhost:8080');
    socket.on('posts', data => {
      if (data.action === 'create') {
        // this.addPost(data.post);
      } else if (data.action === 'update') {
        // this.updatePost(data.post);
      } else if (data.action === 'delete') {
        this.loadPosts();
      }
    });
    this.setState({userIdNew: userId});
  };

  componentDidUpdate() {
    const userId = this.props.match.params.userId;
    if(userId !== this.state.userIdNew) {
      this.fetchUser();
    }
  };

  loadPosts = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }
    fetch('http://localhost:8080/feed/userPosts?page=' + page + '&userId=' + this.state.user._id, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch posts.');
      }
      return res.json();
    })
    .then(resData => {
      this.setState({
        posts: resData.posts.map(post => {
          return {
            ...post,
            imagePath: post.imageUrl
          };
        }),
        totalPosts: resData.totalItems,
        postsLoading: false
      });
    })
    .catch(this.catchError);
  };

  fetchUser = (direction) => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    const userId = this.props.match.params.userId;
    this.setState({userIdNew: userId});
    fetch('http://localhost:8080/user/profile/' + userId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch user status.');
      }
      return res.json();
    })
    .then(resData => {

      this.setState({
        user: resData.user,
        posts: resData.user.posts.map(post => {
          return {
            ...post
          };
        }),
        userImage: 'http://localhost:8080/' + resData.user.image,
        followers: resData.user.followers.map(follower => {
          return {
            ...follower
          }
        }),
        following: resData.user.following.map(following => {
          return {
            ...following
          }
        }),
        postsLoading: false
      });
    })
    .catch(this.catchError);
  };

  deletePostHandler = postId => {
    this.setState({ postsLoading: true });
    fetch('http://localhost:8080/feed/post/' + postId, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Deleting a post failed!');
      }
      return res.json();
    })
    .then(resData => {
      console.log(resData);
      this.loadPosts();
    })
    .catch(err => {
      console.log(err);
      this.setState({ postsLoading: false });
    });
  };

  followHandler = () => {
    const meId = localStorage.getItem('userId');
    const userId = this.state.userIdNew;
    fetch('http://localhost:8080/user/userFollow?userId=' + userId + '&meId=' + meId, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Can't follow user!");
      }
      return res.json();
    })
    .then(resData => {
      this.setState({ followers: resData.user.followers.map(follower => {
        return{...follower};
      })});
      this.setState({ following: resData.user.following.map(follow => {
        return{...follow};
      })});
    })
    .catch(this.catchError);
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
    console.log(error);
  };

  render() {

    // console.log('typeof: ' + (this.state.user._id));

    // if(typeof(this.state.user.image) === 'undefined') {
    //   this.state.user.image= 'http://localhost:8080/images/prof_default.png'http://localhost:8080/images/pro_default.png;
    // }

    // if(typeof(this.state.user.followers) !== 'undefined'){
    //   this.setState({followers: this.state.user.followers.length});
    // }
    // if(typeof(this.state.user.following) !== 'undefined'){
    //   this.setState({following: this.state.user.following.length});
    // }

    // let fButton = (<span className="follow" style={{float: "center"}}>Follow</span>);
    // if (this.state.user in this.state.user.followers) {
    //   let fButton = (<span className="follow" style={{float: "center"}}>Unfollow</span>)
    // } 

    let followButton = (<div></div>);
    
    if(this.state.user._id !== this.state.trueUserId) {
      // followButton = (<div></div>);
      if (this.state.followers.some(follower => follower._id.toString() === this.state.trueUserId)){
        followButton = (<Button  design="follow" onClick={this.followHandler}>Unfollow</Button>);
      }else if(!(this.state.followers.some(follower => follower._id.toString() === this.state.trueUserId))){
        followButton = (<Button  design="follow" onClick={this.followHandler}>Follow</Button>);
      }
    }

    // let followButton = (<Button  design="follow" onClick={this.followHandler}>Follow</Button>);

    // // console.log(this.state.followers);
    // if (this.state.followers.some(follower => follower._id.toString() === this.state.trueUserId)){
    //   followButton = (<Button  design="follow" onClick={this.followHandler}>Unfollow</Button>);
    // }

    // if(this.state.user._id === this.state.trueUserId) {
    //   followButton = (<div></div>);
    // }

    return (
      <Fragment>
          <div className={styles.row}>
            <div className={` ${styles.left} ${btStyles['col-lg-4']} `}>
              <div className={styles.photoLeft}>
                <img className={styles.photo} src={this.state.userImage} alt={this.state.user.name}/>
                <div className={styles.active}></div>
              </div>
              <h4 className={styles.name}>{this.state.user.name}</h4>
              <p className={styles.info}>{this.state.user.email}</p>
              <div className={` ${styles.stats} ${styles.row} `}>
                <div className={` ${styles.stat} ${btStyles['col-xs-4']} `} style={{paddingRight: "300px"}}>
                  <p className={styles.numberStat}>{this.state.followers.length}</p>
                  <p className={styles.descStat}>Followers</p>
                </div>
                <div className={` ${styles.stat} ${btStyles['col-xs-4']} `}>
                  <p className={styles.numberStat}>{this.state.following.length}</p>
                  <p className={styles.descStat}>Following</p>
                </div>
                <div className={` ${styles.stat} ${btStyles['col-xs-4']} `} style={{paddingLeft: "300px"}}>
                  <p className={styles.numberStat}>{this.state.posts.length}</p>
                  <p className={styles.descStat}>Posts</p>
                </div>
              </div>
              <p className={styles.desc}>{this.state.user.status}</p>
            </div>
            {followButton}
            {/* <div className="right col-lg-8" >
              <ul className="nav" style={{float: "left"}}>
                <li>Posts</li>
                <li>Collections</li>
                <li>Groups</li>
                <li>About</li>
              </ul>
              <span className="follow" style={{float: "right"}}>Follow</span>
            </div> */}
            <div className={` ${styles.row} ${styles.gallery} `}>

              {this.state.postsLoading && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <Loader />
                </div>
              )}
              {!this.state.postsLoading && (
                <div>
                {this.state.posts.map(post => (
                  <Post
                    key={post._id}
                    id={post._id}
                    token={this.props.token}
                    author={this.state.user.name}
                    creator={this.state.user}
                    trueUser={this.state.trueUserId}
                    date={new Date(post.createdAt).toLocaleString('en-US')}
                    title={post.title}
                    image={post.imageUrl}
                    content={post.content}
                    caller={this.state.caller}
                    profile={true}
                    // onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                    onDelete={this.deletePostHandler.bind(this, post._id)}
                  />
                ))}
                </div>
              )}
            </div>
          </div>
       </Fragment>
    )
  }
}


export default Profile;