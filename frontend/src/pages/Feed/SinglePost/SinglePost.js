import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router';
// import openSocket from 'socket.io-client';
import { NavLink } from 'react-router-dom';

import Image from '../../../components/Image/Image';
import Button from '../../../components/Button/Button';
import FeedEdit from '../../../components/Feed/FeedEdit/FeedEdit';
import PostComment from '../../../components/Feed/Post/PostComment/PostComment';

import './SinglePost.css';

class SinglePost extends Component {
  state = {
    post: {},
    creator: '',
    date: '',
    image: '',
    content: '',
    isCommenting: false,
    commentPost: null,
    isEditing: false,
    editPost: null,
    editLoading: false,
    commentLoading: false,
    status: '',
    comments: [],
    trueUserId: localStorage.getItem('userId'),
    likes: []
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    fetch('http://localhost:8080/feed/post/' + postId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch post');
        }
        return res.json();
      })
      .then(resData => {
        // console.log('resData: ' + resData.post.creator.name);
        this.setState({
          post: resData.post,
          creator: resData.post.creator,
          image: 'http://localhost:8080/' + resData.post.imageUrl,
          date: new Date(resData.post.createdAt).toLocaleString('en-US'),
          content: resData.post.content,
          likes: resData.post.likes.map(like => {
            return{...like};
          }),
          comments: resData.post.comments.map(comment => {
            return{...comment};
          })
        });
        console.log(this.state.comments);
        // this.setState({ likes: resData.post.likes.map(like => {
        //   return{...like};
        // })});
      })
      .catch(err => {
        console.log(err);
      });
    // const socket = openSocket('http://localhost:8080');
    // socket.on('posts', data => {
    //   if (data.action === 'update') {
    //     this.updatePost(data.post);
    //   }
    // });
  }

  // updatePost = post => {
  //   this.setState(prevState => {
  //     const updatedPost = [...prevState.post];
  //     const updatedPostIndex = updatedPost.findIndex(p => p._id === post._id);
  //     if (updatedPostIndex > -1) {
  //       updatedPost[updatedPostIndex] = post;
  //     }
  //     return {
  //       post: updatedPost
  //     };
  //   });
  // };

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
        // this.loadPosts();
        
        // this.setState(prevState => {
        //   const updatedPosts = prevState.posts.filter(p => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
      this.props.history.push('/');
  };

  startCommentHandler = postId => {
    // console.log('yoyoyo start');
    this.setState(prevState => {
      const loadedPost = this.state.post;

      return {
        isCommenting: true,
        commentPost: loadedPost
      };
    });
  };

  cancelCommentHandler = () => {
    this.setState({ isCommenting: false, commentPost: null });
  };

  finishCommentHandler = postData => {
    console.log('yoyoyo finish');
    this.setState({
      commentLoading: true
    });
    const formData = new FormData();
    formData.append('comment', postData.comment);
    let url = 'http://localhost:8080/feed/postComment/' + this.state.commentPost._id;
    let method = 'POST';

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
        this.setState(prevState => {
          return {
            isEditing: false,
            editPost: null,
            editLoading: false
          };
        });
        window.location.reload();
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

  startEditPostHandler = postId => {
    // console.log('asdasdasd');
    this.setState(prevState => {
      const loadedPost = this.state.post;

      return {
        isEditing: true,
        editPost: loadedPost
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
        window.location.reload();
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

  likeHandler = event => {
    event.preventDefault();
    const postId = this.state.post._id;
    const userId = localStorage.getItem('userId');
    fetch('http://localhost:8080/feed/postLike?postId=' + postId + '&userId=' + userId, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Can't like post!");
      }
      return res.json();
    })
    .then(resData => {
      this.setState({gotLike: true})
      this.setState({ likes: resData.post.likes.map(like => {
        return{...like};
      })});
    })
    .catch(this.catchError);
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {

    let buttons = (
      <div className="post__actions">
        <Button mode="flat"  onClick={this.startCommentHandler.bind(this, this.state.post._id)}>
          Comment
        </Button>
      </div>
    );

    if(this.state.creator._id === localStorage.getItem("userId")) {
      buttons = (
        <div className="post__actions">
          <Button mode="flat"  onClick={this.startCommentHandler.bind(this, this.state.post._id)}>
            Comment
          </Button>
          <Button mode="flat" image={this.state.image} onClick={this.startEditPostHandler.bind(this, this.state.post._id)}>
            Edit
          </Button>
          <Button mode="flat" design="danger" onClick={this.deletePostHandler.bind(this, this.state.post._id)}>
            Delete
          </Button>
        </div>
      )
    }

    let likesAndComments = (
      <div>
        <div className="Post-caption">
          <Button onClick={this.likeHandler}>Like</Button> <strong> {this.state.likes.length} </strong>
        </div>
      </div>
    );

    if (this.state.likes.some(like => like._id.toString() === this.state.trueUserId)){
      likesAndComments = (
      <div>
        <div className="Post-caption">
            <Button design="danger" onClick={this.likeHandler}>Dislike</Button> <strong> {this.state.likes.length} </strong>
        </div>
      </div>
      );
    }

    return (
      <Fragment>
        <PostComment
          editing={this.state.isCommenting}
          selectedPost={this.state.commentPost}
          loading={this.state.commentLoading}
          onCancelEdit={this.cancelCommentHandler}
          onFinishEdit={this.finishCommentHandler}
        />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        
        <section className="single-post">
          {/* <h1>{this.state.title}</h1> */}
          <h2>
            Created by <NavLink className='Nav-link' to={'/profile/' + this.state.creator._id} user={this.state.creator}>{this.state.creator.name}</NavLink> on {this.state.date}
            
          </h2>
          <div className="single-post__image">
            <Image contain imageUrl={this.state.image} />
          </div>
          {likesAndComments}
          <h2 className="single-post">{this.state.content}</h2>
          <span className='Nav-link'><strong>  comments({this.state.comments.length})</strong></span>
          {/* <p>{this.state.comments}</p> */}
          {/* <p>
            {this.state.posts.map(post => (
              <Comment
                key={post._id}
                id={post._id}
                token={this.props.token}
                author={post.creator.name}
                creator={post.creator}
                date={new Date(post.createdAt).toLocaleString()}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                caller={this.state.caller}
                onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                onDelete={this.deletePostHandler.bind(this, post._id)}
                // onLike={this.likeHandler.bind(this, post._id)}
              />
            ))}
          </p> */}
          {buttons}
        </section>
      </Fragment>
    );
  }
}

export default withRouter(SinglePost);
