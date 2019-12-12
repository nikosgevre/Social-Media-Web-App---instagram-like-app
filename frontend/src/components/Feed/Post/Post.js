import React, {Component} from 'react';
import { NavLink } from 'react-router-dom';
import TimeAgo from 'react-timeago';
import openSocket from 'socket.io-client';

import PostOptions from './PostOptions/PostOptions';
import OptionsModal from '../../Modal/OptionsModal/OptionsModal';
import Button from '../../Button/Button';

import PostComment from '../../../components/Feed/Post/PostComment/PostComment';
import CommentEdit from '../../../components/Feed/Post/PostComment/PostComment';
import Comment from '../../../components/Feed/Post/Comment/Comment';

import './Post.css';

class Post extends Component {

  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: '',
    overFlowMenuActive: false,
    userImage: '',
    comments: [],
    likes: [],
    trueUserId: localStorage.getItem('userId'),
    post: {},
    showOptions: false,
    isCommenting: false,
    commentPost: null,
    isEditing: false,
    editLoading: false,
    editComment: null,
    isEditingComment: false
  };

  componentDidMount() {
    const postId = this.props.id;
    fetch('http://localhost:8080/feed/post/' + postId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch status');
      }
      return res.json();
    })
    .then(resData => {
      this.setState({
        title: resData.post.title,
        author: resData.post.creator.name,
        image: 'http://localhost:8080/' + resData.post.imageUrl,
        date: new Date(resData.post.createdAt).toLocaleString(),
        content: resData.post.content,
        userImage: 'http://localhost:8080/' + resData.post.creator.image,
        likes: resData.post.likes.map(like => {
          return{...like};
        }),
        post: resData.post
      });
      this.loadComments();
      
    })
    .catch(err => {
      console.log(err);
    });
    const socket = openSocket('http://localhost:8080');
    socket.on('post', data => {
      if (data.action === 'createComment') {
        this.loadComments();
      } else if (data.action === 'postLike') {
        this.loadComments();
      } else if (data.action === 'deleteComment') {
        this.loadComments();
      } else if (data.action === 'editComment') {
        this.loadComments();
      }
    });
  };

  likeHandler = event => {
    event.preventDefault();
    const postId = this.props.id;
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
      this.setState({ likes: resData.post.likes.map(like => {
        return{...like};
      })});
    })
    .catch(this.catchError);
  };

  loadPost = () => {
    const postId = this.props.id;
    fetch('http://localhost:8080/feed/post/' + postId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch status');
      }
      return res.json();
    })
    .then(resData => {
      this.setState({
        likes: resData.post.likes.map(like => {
          return{...like};
        }),
        comments: resData.post.comments.map(comment => {
          return {
            ...comment
          };
        })
      });
    })
    .catch(err => {
      console.log(err);
    });
  };

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

  showOptionsHandler = () => {
    this.setState({showOptions: true})
  };

  startCommentHandler = postId => {
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
        // this.loadPost();
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

  startEditCommentHandler = comment => {
    // console.log('asdasdasd');
    this.setState(prevState => {
      const loadedComment = comment;

      return {
        isEditingComment: true,
        editComment: loadedComment
      };
    });
  };

  cancelEditCommentHandler = () => {
    this.setState({ isEditingComment: false, editComment: null });
  };

  finishEditCommentHandler = postData => {
    // console.log('yoyoyo finish edit comment');
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
        // window.location.reload();
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

  deleteCommentHandler = commentId => {
    // console.log('yoyoyo');
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
      // this.props.history.push('/');
      // window.location.reload();
  };

  // showDropdown = () => {
  //   document.getElementById("myDropdown").classList.toggle("show");
  // }

  // toggleOverflowMenu = () => {
  //   this.setState((prevState) => ({ overFlowMenuActive: 
  //      !prevState.overFlowMenuActive }));
  // };

  // closeOverflowMenu = () => {
  //     this.setState({ overFlowMenuActive: false });
  // };

  render () {

    let postUser = (
      <header className="post__header">
        {/* <button onClick={this.showOptionsHandler}><strong>...</strong></button> */}
      </header>
    );
    let buttons = (
      <div className="post__actions">
        <Button mode="flat" link={`${this.props.id}`}>
          View
        </Button>
      </div>
    );
    let likesAndComments = (
      <div>
        <div className="Post-caption">
            <Button onClick={this.likeHandler}>Like</Button> <strong> {this.state.likes.length} | </strong>
            {/* <NavLink className='Nav-link' to={`${this.props.id}`} user={this.props.creator}><strong>  comments</strong> ({(this.state.comments.length === 0) ? '' : this.state.comments.length})</NavLink> */}
            <Button  onClick={this.startCommentHandler.bind(this, this.state.post._id)}>  Comment  </Button>  <strong> {this.state.comments.length} </strong>
        </div>
        <div className="Post-caption">
          <NavLink className='Nav-link' to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink> {this.props.content}
        </div>
      </div>
    );

    if (this.state.likes.some(like => like._id.toString() === this.state.trueUserId)){
      likesAndComments = (
      <div>
        <div className="Post-caption">
            <Button design="danger" onClick={this.likeHandler}>Dislike</Button> <strong> {this.state.likes.length} | </strong>
            {/* <NavLink className='Nav-link' to={`${this.props.id}`} user={this.props.creator}><strong>  comments</strong> ({(this.state.comments.length === 0) ? '' : this.state.comments.length})</NavLink> */}
            <Button  onClick={this.startCommentHandler.bind(this, this.state.post._id)}>  Comment  </Button> <strong> {this.state.comments.length} </strong>
        </div>
        <div className="Post-caption">
          <NavLink className='Nav-link' to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink> {this.props.content}
        </div>
      </div>
      );
    };

    if(this.props.creator._id === localStorage.getItem("userId")) {
      buttons = (
        <div className="post__actions">
          <Button mode="flat" link={`${this.props.id}`}>
            View
          </Button>
          {/* <Button mode="flat" image={this.state.image} onClick={this.props.onStartEdit}>
            Edit
          </Button> */}
          <Button mode="flat" design="danger" onClick={this.props.onDelete}>
            Delete
          </Button>
        </div>
      )
    };

    if(this.props.profile) {
      if(this.props.creator._id === this.props.trueUserId){
        buttons = (
          <div className="post__actions">
            <Button mode="flat" link={`${this.props.id}`}>
              View
            </Button>
            <Button mode="flat" design="danger" onClick={this.props.onDelete}>
              Delete
            </Button>
          </div>
        );
      }
    };

    if(this.props.caller === 'feed') {
      postUser= (
        <header className="post__header">
          <div className="Post-user">
              <div className="Post-user-avatar">
                <img src={this.state.userImage} alt={this.props.author} />
              </div>
              <div className="Post-user-nickname">
                <NavLink className='Nav-link' to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink>
              </div>
              {/* <button style={{float:'right'}} onClick={this.showOptionsHandler}><strong>...</strong></button> */}
          </div>
          
        </header>
      );
    }
    else if(this.props.caller === 'profile'){
      postUser = (
      <header className="post__header">
      </header>
      );
    }

    return (
      <article className="post">
        <PostComment
          editing={this.state.isCommenting}
          selectedPost={this.state.commentPost}
          loading={this.state.commentLoading}
          onCancelEdit={this.cancelCommentHandler}
          onFinishEdit={this.finishCommentHandler}
        />
        <CommentEdit
          editing={this.state.isEditingComment}
          selectedPost={this.state.editComment}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditCommentHandler}
          onFinishEdit={this.finishEditCommentHandler}
        />

        <OptionsModal show={this.state.showOptions}>
          <PostOptions 
            id={this.props.id}
            onDelete={this.props.onDelete}
            profile={this.props.profile}
            creator={this.props.creator}
            trueUserId={this.props.trueUserId}
          />
        </OptionsModal>

        {postUser}
        {/* <body></body> */}
        <div className="Post-image">
          <div className="Post-image-bg">
            <img alt={this.props.content} src={this.state.image} />
          </div>
        </div>

        {likesAndComments}

        

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

        

        <div >
          <TimeAgo date={this.state.date} minPeriod="30"  />
          {buttons}
        </div>

      </article>
    );
  }
}

export default Post;