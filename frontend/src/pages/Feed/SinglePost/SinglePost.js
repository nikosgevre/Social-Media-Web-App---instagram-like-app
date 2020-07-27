import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router';
import openSocket from 'socket.io-client';
import { NavLink } from 'react-router-dom';

import Image from '../../../components/Image/Image';
import Button from '../../../components/Button/Button';
import FeedEdit from '../../../components/Feed/FeedEdit/FeedEdit';
import PostComment from '../../../components/Feed/Post/PostComment/PostComment';
import CommentEdit from '../../../components/Feed/Post/PostComment/PostComment';
import Comment from '../../../components/Feed/Post/Comment/Comment';
import Input from '../../../components/Form/Input/Input';

import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import styles from './SinglePost.module.css';

class SinglePost extends Component {

  _isMounted = false;
  
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
    likes: [],
    editComment: null,
    isEditingComment: false,
    commentText: ''
  };

  componentDidMount() {
    this._isMounted = true;
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
      this.setState({
        post: resData.post,
        creator: resData.post.creator,
        image: 'http://localhost:8080/' + resData.post.imageUrl,
        date: new Date(resData.post.createdAt).toLocaleString('en-US'),
        content: resData.post.content,
        likes: resData.post.likes.map(like => {
          return{...like};
        })
      });
      this.loadComments();
    })
    .catch(err => {
      console.log(err);
    });
    // sockets for instant updating changes
    const socket = openSocket('http://localhost:8080');
    socket.on('singlePost', data => {
      if (data.action === 'createComment') {
        // this.loadComments();
        this.loadPost();
      } else if (data.action === 'postLike') {
        this.loadPost();
      } else if (data.action === 'deleteComment') {
        // this.loadComments();
        this.loadPost();
      } else if (data.action === 'editPost') {
        this.loadPost();
      } else if (data.action === 'editComment') {
        this.loadComments();
      }
    });
  }

  // loading the post handler
  loadPost = () => {
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
      this.setState({
        post: resData.post,
        creator: resData.post.creator,
        image: 'http://localhost:8080/' + resData.post.imageUrl,
        date: new Date(resData.post.createdAt).toLocaleString('en-US'),
        content: resData.post.content,
        likes: resData.post.likes.map(like => {
          return{...like};
        })
      });
      // } 
      this.loadComments();
    })
    .catch(err => {
      console.log(err);
    });
  }

  // deleting the post handler
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
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
      this.props.history.push('/');
  };

  // deleting a comment handler
  deleteCommentHandler = commentId => {
    this.setState({ postsLoading: true });
    fetch('http://localhost:8080/feed/comment?commentId=' + commentId + '&postId=' + this.state.post._id, {
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
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  // part of creating comments handler
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

  // part of creating comments handler
  cancelCommentHandler = () => {
    this.setState({ isCommenting: false, commentPost: null });
  };

  // part of creating comments handler from input
  finishCommentHandlerInput = postData => {

    this.setState({
      commentLoading: true
    });
    this.startCommentHandler();
    const formData = new FormData();
    formData.append('comment', this.state.commentText);
    let url = 'http://localhost:8080/feed/postComment?refId=' + this.state.post._id + '&ref=post';
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

  // part of creating comments handler from modal
  finishCommentHandlerButton = postData => {
    this.setState({
      commentLoading: true
    });
    const formData = new FormData();
    formData.append('comment', postData.comment);
    let url = 'http://localhost:8080/feed/postComment?refId=' + this.state.commentPost._id + '&ref=post';
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
            editLoading: false,
            commentLoading: false,
            isCommenting: false,
            commentPost: null
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

  // part of creating comments handler from input
  commentInputChangeHandler = (input, value) => {
    this.setState({ commentText: value });
  };

  // part of updating comments handler
  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = this.state.post;

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  // part of updating post handler
  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  // part of updating comments handler
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

  // MAY BE DELETED
  // part of updating comments handler
  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  // liking the post handler
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

  // loading post's comments handler
  loadComments = () => {
    fetch('http://localhost:8080/feed/getComments/' + this.state.post._id, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch comments.');
      }
      return res.json();
    })
    .then(resData => {
      this.setState({
        comments: resData.comments.map(comment => {
          return {
            ...comment
          };
        })
      });
    })
    .catch(this.catchError);
  };

  // part of updating comments handler
  startEditCommentHandler = comment => {
    this.setState(prevState => {
      const loadedComment = comment;
      return {
        isEditingComment: true,
        editComment: loadedComment
      };
    });
  };

  // part of updating comments handler
  cancelEditCommentHandler = () => {
    this.setState({ isEditingComment: false, editComment: null });
  };

  // part of updating comments handler
  finishEditCommentHandler = postData => {
    this.setState({
      editLoading: true
    });
    const formData = new FormData();
    formData.append('comment', postData.comment);
    let url = 'http://localhost:8080/feed/postComment/' + this.state.post._id;
    let method = 'POST';
    if (this.state.editComment) {
      url = 'http://localhost:8080/feed/editComment?commentId=' + this.state.editComment._id + '&postId=' + this.state.post._id;
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
        this.setState(prevState => {
          return {
            isEditingComment: false,
            editComment: null,
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

  // sort comments handler
  sortComments = (sort) => {
    fetch('http://localhost:8080/feed/sortComments?sort=' + sort  + '&refId=' + this.state.post._id, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to sort comments.');
      }
      return res.json();
    })
    .then(resData => {
      this.setState({
        comments: resData.comments.map(comment => {
          return {
            ...comment
          };
        })
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
  };

  render() {

    // buttons section
    let buttons = (
      <div className={styles.post__actions}>
        <Button mode="flat"  onClick={this.startCommentHandler.bind(this, this.state.post._id)}>
          Comment
        </Button>
      </div>
    );

    if(this.state.creator._id === localStorage.getItem("userId")) {
      buttons = (
        <div className={styles.post__actions}>
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

    // likes and comments section
    let likesAndComments = (
      <div>
        <div className={styles.PostCaption}>
          <Button onClick={this.likeHandler}><span role="img" aria-label="sheep">&#128077;</span></Button> <strong> {this.state.likes.length} </strong>
        </div>
      </div>
    );

    if (this.state.likes.some(like => like._id.toString() === this.state.trueUserId)){
      likesAndComments = (
      <div>
        <div className={styles.PostCaption}>
            <Button mode='raised' onClick={this.likeHandler}><span role="img" aria-label="sheep">&#128077;</span></Button> <strong> {this.state.likes.length} </strong>
        </div>
      </div>
      );
    }

    return (
      <Fragment>
        <style dangerouslySetInnerHTML={{__html: `
           body { background-color: #fafafa; }
        `}} />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossOrigin="anonymous"></link>
        <PostComment
          editing={this.state.isCommenting}
          selectedPost={this.state.commentPost}
          loading={this.state.commentLoading}
          onCancelEdit={this.cancelCommentHandler}
          onFinishEdit={this.finishCommentHandlerButton}
        />
        <CommentEdit
          editing={this.state.isEditingComment}
          selectedPost={this.state.editComment}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditCommentHandler}
          onFinishEdit={this.finishEditCommentHandler}
        />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        
        <section className={styles.singlePost}>
          {/* <h1>{this.state.title}</h1> */}
          <h2>
            Created by <NavLink className={styles.Navlink} to={'/profile/' + this.state.creator._id} user={this.state.creator}>{this.state.creator.name}</NavLink> on {this.state.date}
            
          </h2>
          {/* <div className={styles.singlePost__image}>
            <Image contain imageUrl={this.state.image} />
          </div> */}
          {this.state.post.mimetype === 'video/mp4' ? (
               <video width="380" height="240" controls>
                  <source src={this.state.image} type="video/mp4" />
                </video> 
            ): 
            (
              <img alt={this.props.content} src={this.state.image} />
            )}
          {likesAndComments}
          <h2 className={styles.singlePost}>{this.state.content}</h2>
          
          <div>
            <span className={styles.Navlink} style={{paddingTop:"15px", paddingBottom:"15px"}}><strong>  comments({this.state.post.totalComments})</strong></span>
            <DropdownButton id="dropdown-basic-button" title="Sort Comments">
              <Dropdown.Item onClick={()=>this.sortComments('popular')}>Most Popular  |  </Dropdown.Item>
              <Dropdown.Item onClick={()=>this.sortComments('Mrecent')}>Most Recent  |  </Dropdown.Item>
              <Dropdown.Item onClick={()=>this.sortComments('Lrecent')}>Least Recent</Dropdown.Item>
            </DropdownButton>
          </div>
          &nbsp;
          {this.state.comments.map(comment => (
            <Comment
              key={comment._id}
              id={comment._id}
              token={this.props.token}
              postId={this.state.post._id}
              author={comment.creator.name}
              creator={comment.creator}
              date={new Date(comment.createdAt).toLocaleString()}
              content={comment.comment}
              onStartEdit={this.startEditCommentHandler.bind(this, comment)}
              onDelete={this.deleteCommentHandler.bind(this, comment._id)}
            />
          ))}
          <hr></hr>
          <section className={styles.feed__status}>
            <form onSubmit={this.finishCommentHandlerInput}>
              <Input
                id="comment"
                type="text"
                rows="1"
                placeholder="Comment"
                control="input"
                onChange={this.commentInputChangeHandler}
                value={this.state.commentText}
              />
              <Button mode="flat" type="submit">
                Comment
              </Button>
            </form>
          </section>

          <hr></hr>
          {buttons}
        </section>
      </Fragment>
    );
  }
}

export default withRouter(SinglePost);
