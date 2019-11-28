import React, { Component, Fragment } from 'react';
import openSocket from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';

import './Profile.css'; 

const paginationNumber = Number.MAX_SAFE_INTEGER;

class Profile extends Component {

  state = {
    isEditing: false,
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false,
    user: {},
    posts: [],
    imagePath: '',
    caller: 'profile',
    followers: [],
    following: []
  }

  componentDidMount() {
    // console.log('-------------------- ' + this.props.userId);
    const userId = this.props.userId;
    fetch('http://localhost:8080/feed/profile/' + userId, {
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
        this.setState({ status: resData.status, user: resData.user });
        this.setState({
          posts: resData.user.posts.map(post => {
            return {
              ...post
            };
          })
        });
        // console.log(this.state.posts[0].creator.name + "---22222222222222222----------- " + this.state.posts[0].imageUrl);
        this.setState({ imagePath: 'http://localhost:8080/' + resData.user.posts.map(post => {
          let imgUrl = post.imageUrl;
          return imgUrl;
        }) 
        });
      })
      .catch(this.catchError);
      this.loadPosts();
      this.loadFollowers();
      this.loadFollowing();
      const socket = openSocket('http://localhost:8080');
      socket.on('posts', data => {
        if (data.action === 'create') {
          this.addPost(data.post);
        } else if (data.action === 'update') {
          this.updatePost(data.post);
        } else if (data.action === 'delete') {
          this.loadPosts();
        }
      });
  }

  loadFollowers = user => {
    const userId = this.props.userId;
    fetch('http://localhost:8080/feed/userFollowers/' + userId, {
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
          followers: resData.user.followers.map(follower => {
            return {
              ...follower
            }
          })
        });

      })
      .catch(this.catchError);
  };

  loadFollowing = user => {
    const userId = this.props.userId;
    fetch('http://localhost:8080/feed/userFollowing/' + userId, {
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
          following: resData.user.following.map(following => {
            return {
              ...following
            }
          })
        });
      })
      .catch(this.catchError);
  };

  addPost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      if (prevState.postPage === 1) {
        if (prevState.posts.length >= paginationNumber) {
          updatedPosts.pop();
        }
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        totalPosts: prevState.totalPosts + 1
      };
    });
  };

  updatePost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      const updatedPostIndex = updatedPosts.findIndex(p => p._id === post._id);
      if (updatedPostIndex > -1) {
        updatedPosts[updatedPostIndex] = post;
      }
      return {
        posts: updatedPosts
      };
    });
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
        // console.log(this.state.posts[0].creator.name + "---111111111111111----------- " + this.state.posts[1].imageUrl);
      })
      .catch(this.catchError);



  };

  // statusUpdateHandler = event => {
  //   event.preventDefault();
  //   fetch('http://localhost:8080/auth/status', {
  //     method: 'PATCH',
  //     headers: {
  //       Authorization: 'Bearer ' + this.props.token,
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       status: this.state.status
  //     })
  //   })
  //     .then(res => {
  //       if (res.status !== 200 && res.status !== 201) {
  //         throw new Error("Can't update status!");
  //       }
  //       return res.json();
  //     })
  //     .then(resData => {
  //       console.log(resData);
  //     })
  //     .catch(this.catchError);
  // };

  newPostHandler = () => {
    this.setState({ isEditing: true , newPost: true});
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost,
        newPost: false
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('image', postData.image);
    let url = 'http://localhost:8080/feed/post';
    let method = 'POST';
    if (this.state.editPost) {
      url = 'http://localhost:8080/feed/post/' + this.state.editPost._id;
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
          throw new Error('Creating or editing a post failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        const post = {
          _id: resData.post._id,
          title: resData.post.title,
          content: resData.post.content,
          creator: resData.post.creator,
          createdAt: resData.post.createdAt
        };
        this.setState(prevState => {
          return {
            isEditing: false,
            editPost: null,
            editLoading: false
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
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
        // this.setState(prevState => {
        //   const updatedPosts = prevState.posts.filter(p => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {

    console.log('typeof: ' + typeof(this.state.user.image));

    if(typeof(this.state.user.image) === 'undefined') {
      this.state.user.image= 'http://localhost:8080/images/prof_default.png';
    }

    // if(typeof(this.state.user.followers) !== 'undefined'){
    //   this.setState({followers: this.state.user.followers.length});
    // }
    // if(typeof(this.state.user.following) !== 'undefined'){
    //   this.setState({following: this.state.user.following.length});
    // }

    return (
      <Fragment>
          <div className="row">
            <div className="left col-lg-4">
              <div className="photo-left">
                <img className="photo" src={this.state.user.image} alt={this.state.user.name}/>
                <div className="active"></div>
              </div>
              <h4 className="name">{this.state.user.name}</h4>
              <p className="info">{this.state.user.email}</p>
              <div className="stats row">
                <div className="stat col-xs-4" style={{paddingRight: "300px"}}>
                  <p className="number-stat">{this.state.followers.length}</p>
                  <p className="desc-stat">Followers</p>
                </div>
                <div className="stat col-xs-4">
                  <p className="number-stat">{this.state.following.length}</p>
                  <p className="desc-stat">Following</p>
                </div>
                <div className="stat col-xs-4" style={{paddingLeft: "300px"}}>
                  <p className="number-stat">No. Posts</p>
                  <p className="desc-stat">Posts</p>
                </div>
              </div>
              <p className="desc">{this.state.user.status}</p>
            </div>
            <span className="follow" style={{float: "center"}}>Follow</span>
            {/* <div className="right col-lg-8" >
              <ul className="nav" style={{float: "left"}}>
                <li>Posts</li>
                <li>Collections</li>
                <li>Groups</li>
                <li>About</li>
              </ul>
              <span className="follow" style={{float: "right"}}>Follow</span>
            </div> */}
            <div className="row gallery">
              {/* {this.state.posts.map(post => (
                  <div key={post._id} style={{width: "150px", height: "150px"}} className="col-md-4">
                    <img src={`http://localhost:8080/${post.imageUrl}`} alt={post.content} />
                  </div>
              ))} */}

              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  token={this.props.token}
                  author={this.state.user.name}
                  creator={this.state.user}
                  date={new Date(post.createdAt).toLocaleString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  caller={this.state.caller}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}

            </div>
          </div>
       </Fragment>
    )
  }
}


export default Profile;