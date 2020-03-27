import React, {Component, Fragment} from 'react';
import { NavLink } from 'react-router-dom';
import TimeAgo from 'react-timeago'
import openSocket from 'socket.io-client';

import Button from '../../../Button/Button';
import Comment from './Comment';
import Input from '../../../Form/Input/Input';
import CommentEdit from '../PostComment/PostComment';

import styles from './Comment.module.css';

class Post extends Component {

  state = {
    author: '',
    date: '',
    comments: [],
    likes: [],
    commentText: '',
    comment: null,
    commentLoading: false,
    isCommenting: false,
    commentComment: null,
    isEditingComment: false,
    editComment: null,
    editLoading: false,
    trueUserId: localStorage.getItem('userId')
  };

  componentDidMount() {
    fetch('http://localhost:8080/feed/getComment/' + this.props.id, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch comment.');
      }
      return res.json();
    })
    .then(resData => {
      this.setState({
        comment: resData.comment
      });
    })
    .catch(this.catchError);
    // load comments and likes
      this.loadComments();
      this.loadLikes();
      // open socket for instant updating of changes
      const socket = openSocket('http://localhost:8080');
      socket.on('comment', data => {
        if (data.action === 'commentLike') {
          this.loadLikes();
        } else if (data.action === 'deleteComment') {
          this.loadComments();
        } else if (data.action === 'editComment') {
          this.loadComments();
        }
      });
  }

  // load comments handler
  loadComments = () => {
    fetch('http://localhost:8080/feed/getComments/' + this.props.id, {
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

  // like/dislike comments handler
  likeHandler = event => {
    event.preventDefault();
    const commentId = this.props.id;
    const userId = localStorage.getItem('userId');
    fetch('http://localhost:8080/feed/commentLike?commentId=' + commentId + '&userId=' + userId, {
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
      this.setState({ likes: resData.comment.likes.map(like => {
        return{...like};
      })});
    })
    .catch(this.catchError);
  };

  // load comments likes handler
  loadLikes = () => {
    const commentId = this.props.id;
    fetch('http://localhost:8080/feed/getCommentsLikes/' + commentId, {
        headers: {
          Authorization: 'Bearer ' + this.props.token
        }
      })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch likes.');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          likes: resData.likes.map(like => {
            return {
              ...like
            };
          })
        });
      })
      .catch(this.catchError);
  }

  // part of creating nested comments handler
  startCommentHandler = postId => {
    this.setState(prevState => {
      const loadedComment = this.state.comment;

      return {
        isCommenting: true,
        commentComment: loadedComment
      };
    });
  };

  // part of creating nested comments handler
  finishCommentHandlerInput = postData => {
    this.setState({
      commentLoading: true
    });
    this.startCommentHandler(this.state.comment._id);
    this.setState(prevState => {
      const loadedComment = this.state.comment;

      return {
        isCommenting: true,
        commentComment: loadedComment
      };
    });
    if(this.state.commentText.length>1){
      const formData = new FormData();
      formData.append('comment', this.state.commentText);
      let url = 'http://localhost:8080/feed/postComment?refId=' + this.props.id + '&ref=comment';
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
            throw new Error('Creating or editing a comment failed!');
          }
          return res.json();
        })
        .then(resData => {
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
          this.loadComments();
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
    }
  };

  // part of creating and updating comments handler
  commentInputChangeHandler = (input, value) => {
    this.setState({ commentText: value });
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
    let url = 'http://localhost:8080/feed/postComment/' + this.props.postId;
    let method = 'POST';
    if (this.state.editComment) {
      url = 'http://localhost:8080/feed/editComment?commentId=' + this.state.editComment._id + '&postId=' + this.props.postId;
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

  // delete comment handler
  deleteCommentHandler = commentId => {
    fetch('http://localhost:8080/feed/comment?commentId=' + commentId + '&postId=' + this.props.postId, {
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

  render () {

    // likes and comments section of a comment
    let likesAndComments = (
      <div>
        <div className={styles.PostCaption}>
            <Button onClick={this.likeHandler}><span role="img" aria-label="sheep">&#128077;</span></Button> <strong> {this.state.likes.length}</strong>
        </div>
      </div>
    );

    if (this.state.likes.some(like => like._id.toString() === this.state.trueUserId)){
      likesAndComments = (
      <div>
        <div className={styles.PostCaption}>
            <Button mode='raised' onClick={this.likeHandler}><span role="img" aria-label="sheep">&#128077;</span></Button> <strong> {this.state.likes.length}</strong>
        </div>
      </div>
      );
    };

    // buttons and time info section of a comment
    let buttons = (
      <div className={styles.post__actions}>
        {likesAndComments}
        <TimeAgo date={this.props.date} minPeriod="30"  />
      </div>
    );

    if(this.props.creator._id === localStorage.getItem("userId")) {
      buttons = (
        <div className={styles.post__actions} >
          {likesAndComments}
          <TimeAgo date={this.props.date} minPeriod="30"  />
          <Button mode="flat" onClick={this.props.onStartEdit}>
            ?
          </Button>
          <Button mode="flat" design="danger" onClick={this.props.onDelete}>
            X
          </Button>
        </div>
      )
    }

    return (
      <Fragment>
        <CommentEdit
          editing={this.state.isEditingComment}
          selectedPost={this.state.editComment}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditCommentHandler}
          onFinishEdit={this.finishEditCommentHandler}
        />
        <article className={styles.post1}>
          <div>
            <div >
              <NavLink className={styles.Navlink} to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink> {this.props.content}
            </div>
          </div>
          {buttons}
          {this.props.caller==='comment' ? null : 
            (this.props.caller!=='feed') ? (
            <section className={styles.feed__status}>
              <form onSubmit={this.finishCommentHandlerInput.bind(this)}>
                <Input
                  id={this.props.id}
                  type="text"
                  // rows="1"
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
            ) : null
          }
          {this.props.caller==='feed' ? null : 
            <div>
                {this.state.comments.map(comment => (
                <Comment
                  key={comment._id}
                  id={comment._id}
                  token={this.props.token}
                  postId={comment._id}
                  author={comment.creator.name}
                  creator={comment.creator}
                  date={new Date(comment.createdAt).toLocaleString()}
                  content={comment.comment}
                  onStartEdit={this.startEditCommentHandler.bind(this, comment)}
                  onDelete={this.deleteCommentHandler.bind(this, comment._id)}
                  caller='comment'
                />
              ))}
            </div>
          }
        </article>
      </Fragment>
    );
  }
}

export default Post;