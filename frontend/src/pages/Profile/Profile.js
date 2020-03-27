import React, { Component, Fragment } from 'react';
import openSocket from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import ProfileEdit from '../../components/Profile/ProfileEdit/ProfileEdit';

import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import styles from './Profile.module.css'; 
import btStyles from '../../Assets/global-styles/bootstrap.min.module.css';

class Profile extends Component {

  state = {
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
    isEditing: false,
    editUser: null,
    trueUserId: localStorage.getItem('userId'),
    sort: 'recent'
  };

  componentDidMount() {
    const userId = this.props.match.params.userId;
    this.setState({userIdNew: userId});
    // get user profile and sockets
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

  // update user profile if other user is selected
  componentDidUpdate() {
    const userId = this.props.match.params.userId;
    if(userId !== this.state.userIdNew) {
      this.fetchUser();
    }
  };

  // loading user posts handler
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

  // get user profile handler
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
      const options = {month: 'long', day: 'numeric', year: 'numeric' };
      this.setState({
        user: resData.user,
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
        created: new Date(resData.user.createdAt).toLocaleDateString('gr-GR', options),
        postsLoading: false
      });
      this.loadPosts();
    })
    .catch(this.catchError);
  };

  // delete post handler
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

  // follow/unfollow user handler
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

  // part of profile edit handler
  startEditProfileHandler = userId => {
    // console.log('asdasdasd');
    this.setState(prevState => {
      const loadedUser = this.state.user;

      return {
        isEditing: true,
        editUser: loadedUser
      };
    });
  };

  // part of profile edit handler
  cancelEditHandler = () => {
    this.setState({ isEditing: false, editUser: null });
  };

  // part of profile edit handler
  finishEditHandler = userData => {
    this.setState({
      editLoading: true
    });
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('status', userData.status);
    formData.append('image', userData.image);
    let url = 'http://localhost:8080/user/profileEdit';
    let method = 'POST';
    if (this.state.editUser) {
      url = 'http://localhost:8080/user/profileEdit/' + this.state.editUser._id;
      method = 'PUT';
    }

    fetch(url, {
      method: method,
      body: formData,
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Editing a user failed!');
        }
        return res.json();
      })
      .then(resData => {
        this.setState(prevState => {
          return {
            isEditing: false,
            editUser: null,
            editLoading: false
          };
        });
        window.location.reload();
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editUser: null,
          editLoading: false,
          error: err
        });
      });
  };

  // sort posts handler
  sortPosts = (sort) => {
    fetch('http://localhost:8080/feed/sortPosts?sort=' + sort  + '&userId=' + this.state.user._id, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to sort posts.');
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

  // error handler
  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
    console.log(error);
  };

  render() {

    // follow and edit button handlers
    let followButton = (<div></div>);
    let editButton = (<div></div>);
    
    if(this.state.user._id !== this.state.trueUserId) {
      if (this.state.followers.some(follower => follower._id.toString() === this.state.trueUserId)){
        followButton = (<Button className={styles.fBtn} design="unfollow" mode='raised' onClick={this.followHandler}>Following</Button>);
      }else if(!(this.state.followers.some(follower => follower._id.toString() === this.state.trueUserId))){
        followButton = (<Button className={styles.ufBtn} design="follow" onClick={this.followHandler}>Follow</Button>);
      }
    }

    if(this.state.user._id === this.state.trueUserId) {
      editButton = (
        <div className={styles.post__actions}>
          <Button mode="flat" image={this.state.image} onClick={this.startEditProfileHandler.bind(this, this.state.user._id)}>
          <span role="img" aria-label="sheep">&#x270F;&#xFE0F;</span>
          </Button>
        </div>
      )
    }

    return (
      <Fragment>
        <style dangerouslySetInnerHTML={{__html: `
           body { background-color: #fafafa; }
        `}} />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossOrigin="anonymous"></link>
        <ProfileEdit
          editing={this.state.isEditing}
          selectedUser={this.state.editUser}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
          <div className={` ${styles.left} ${btStyles['col-lg-4']} `}>
            <div className={styles.photoLeft}>
              <img className={styles.photo} src={this.state.userImage} alt={this.state.user.name}/>
            </div>
            {editButton}
            <h4 className={` ${styles.stats} ${styles.name} `}>{this.state.user.name}</h4>
            <p className={` ${styles.stats} ${styles.info} `}>{this.state.user.email}</p>
            <p className={` ${styles.stats} ${styles.info} `}>Member since: {this.state.created}</p>
            <div className={` ${styles.stats} ${btStyles.row} `}>
              <div className={`  ${btStyles['col-4']} `} style={{paddingRight: "50px"}}>
                <p className={styles.numberStat}>{this.state.followers.length}</p>
                <p className={styles.descStat}>Followers</p>
              </div>
              <div className={`  ${btStyles['col-4']} `}>
                <p className={styles.numberStat}>{this.state.following.length}</p>
                <p className={styles.descStat}>Following</p>
              </div>
              <div className={`  ${btStyles['col-4']} `} style={{paddingLeft: "50px"}}>
                <p className={styles.numberStat}>{this.state.posts.length}</p>
                <p className={styles.descStat}>Posts</p>
              </div>
            </div>
            <p className={styles.desc}>{this.state.user.status}</p>
          </div>
          <div>
            {followButton}
            
          </div>
          <div className={` ${styles.gallery} `}>
            <div>
              <DropdownButton id="dropdown-basic-button" title="Sort">
                <Dropdown.Item onClick={()=>this.sortPosts('popular')}>Most Popular  |  </Dropdown.Item>
                <Dropdown.Item onClick={()=>this.sortPosts('Mrecent')}>Most Recent  |  </Dropdown.Item>
                <Dropdown.Item onClick={()=>this.sortPosts('Lrecent')}>Least Recent</Dropdown.Item>
              </DropdownButton>
            </div>
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
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
              </div>
            )}
          </div>

       </Fragment>
    )
  }
}


export default Profile;