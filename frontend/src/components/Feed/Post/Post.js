import React, {Component} from 'react';
import { NavLink } from 'react-router-dom';
import TimeAgo from 'react-timeago';
import openSocket from 'socket.io-client';

import PostOptions from './PostOptions/PostOptions';
import OptionsModal from '../../Modal/OptionsModal/OptionsModal';
import Button from '../../Button/Button';
import Input from '../../Form/Input/Input';

import PostComment from '../../../components/Feed/Post/PostComment/PostComment';
import CommentEdit from '../../../components/Feed/Post/PostComment/PostComment';
import Comment from '../../../components/Feed/Post/Comment/Comment';

import styles from './Post.module.css';

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
    commentLoading: false,
    isCommenting: false,
    commentPost: null,
    isEditing: false,
    editLoading: false,
    editComment: null,
    isEditingComment: false,
    commentText: ''
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
        // this.loadComments();
        // this.loadPost();
        this.loadComments();
      } else if (data.action === 'postLike') {
        // this.loadPost();
        this.loadLikes();
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
    const postId = this.state.post._id;
    // console.log(this.state.content);
    fetch('http://localhost:8080/feed/post/' + postId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch posts');
      }
      return res.json();
    })
    .then(resData => {
      // this.setState({
      //   likes: resData.post.likes.map(like => {
      //     return{...like};
      //   }),
      //   comments: resData.post.comments.map(comment => {
      //     return {
      //       ...comment
      //     };
      //   })
      // });
      this.loadComments();
      this.loadLikes();
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

  loadLikes = () => {
    // console.log('getlikes');
    const postId = this.state.post._id;
    // console.log(postId);
    fetch('http://localhost:8080/feed/getLikes/' + postId, {
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

  finishCommentHandlerInput = postData => {
    this.setState({
      commentLoading: true
    });
    this.startCommentHandler(this.state.post._id);
    this.setState(prevState => {
      const loadedPost = this.state.post;

      return {
        isCommenting: true,
        commentPost: loadedPost
      };
    });
    // console.log(this.state.commentText);
    if(this.state.commentText.length>1){
      const formData = new FormData();
      // formData.append('comment', postData.comment);
      formData.append('comment', this.state.commentText);
      let url = 'http://localhost:8080/feed/postComment/' + this.state.post._id;
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
          // console.log(resData);
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
          // window.location.reload();
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

  finishCommentHandlerButton = postData => {
    this.setState({
      commentLoading: true
    });
    const formData = new FormData();
    formData.append('comment', postData.comment);
    // formData.append('comment', this.state.commentText);
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
      // window.location.reload();
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
  };

  commentInputChangeHandler = (input, value) => {
    this.setState({ commentText: value });
    // console.log(this.state.commentText);
    // console.log(this.props.token);
    // console.log(this.state.post._id);
  };

  startEditCommentHandler = comment => {
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

  optionsCancelHandler = () => {
    this.setState({showOptions: false});
  };

  render () {

    // console.log(this.state.commentText);
    // console.log('rerender');

    let postUser = (
      <header className={styles.post__header}>
        <div style={{display:"flex", justifyContent:"right", float:"right"}}>
          <button className={styles.Optoins} onClick={this.showOptionsHandler}><strong>...</strong></button>
        </div>
      </header>
    );
    
    let likesAndComments = (
      <div>
        <div className={styles.PostCaption}>
            <Button onClick={this.likeHandler}>Like</Button> <strong> {this.state.likes.length} | </strong>
            <NavLink className={styles.Navlink} to={`${this.props.id}`} user={this.props.creator}><strong>  comments</strong> {(this.state.comments.length === 0) ? '' : ( '(' + this.state.comments.length + ')')}</NavLink>
            {/* <Button style={{float:"right"}} onClick={this.startCommentHandler.bind(this, this.state.post._id)}>  Comment  </Button>   */}
            {/* <strong> {this.state.comments.length} </strong> */}
        </div>
        
        
      </div>
    );

    if (this.state.likes.some(like => like._id.toString() === this.state.trueUserId)){
      likesAndComments = (
      <div>
        <div className={styles.PostCaption}>
            <Button design="danger" onClick={this.likeHandler}>Dislike</Button> <strong> {this.state.likes.length} | </strong>
            <NavLink className={styles.Navlink} to={`${this.props.id}`} user={this.props.creator}><strong>  comments</strong> {(this.state.comments.length === 0) ? '' : ( '(' + this.state.comments.length + ')')}</NavLink>
            {/* <Button  onClick={this.startCommentHandler.bind(this, this.state.post._id)}>  Comment  </Button>  */}
            {/* <strong> {this.state.comments.length} </strong> */}
        </div>
        {/* <div className="Post-caption">
          <NavLink className='Nav-link' to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink> {this.props.content}
        </div> */}
      </div>
      );
    };

    // let buttons = (
    //   <div className={styles.post__actions}>
    //     <Button mode="flat" link={`${this.props.id}`}>
    //       View
    //     </Button>
    //   </div>
    // );

    // if(this.props.creator._id === localStorage.getItem("userId")) {
    //   buttons = (
    //     <div className={styles.post__actions}>
    //       <Button mode="flat" link={`${this.props.id}`}>
    //         View
    //       </Button>
    //       {/* <Button mode="flat" image={this.state.image} onClick={this.props.onStartEdit}>
    //         Edit
    //       </Button> */}
    //       <Button mode="flat" design="danger" onClick={this.props.onDelete}>
    //         Delete
    //       </Button>
    //     </div>
    //   )
    // };

    // if(this.props.profile) {
    //   if(this.props.creator._id === this.props.trueUserId){
    //     buttons = (
    //       <div className={styles.post__actions}>
    //         <Button mode="flat" link={`${this.props.id}`}>
    //           View
    //         </Button>
    //         <Button mode="flat" design="danger" onClick={this.props.onDelete}>
    //           Delete
    //         </Button>
    //       </div>
    //     );
    //   }
    // };

    if(this.props.caller === 'feed') {
      postUser= (
        <header className={styles.post__header}>
          {/* <div style={{display:"flex", justifyContent:"right", paddingTop:"-10px", paddingBottom:"5px"}}> */}
          <div style={{float:"right"}}>
            <button className={styles.Options} onClick={this.showOptionsHandler}><strong>...</strong></button>
          </div>
          <div className={styles.PostUser}>
            <div className={styles.PostUserAvatar}>
              <img src={this.state.userImage} alt={this.props.author} />
            </div>
            <div className={styles.PostUserNickname}>
              <NavLink className={styles.Navlink} to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink>
            </div>
          </div>
        </header>
      );
    }
    else if(this.props.caller === 'profile'){
      postUser = (
      <header className={styles.post__header}>
        <div style={{display:"flex", justifyContent:"right"}}>
          <button className={styles.Options} onClick={this.showOptionsHandler}><strong>...</strong></button>
        </div>
      </header>
      );
    }

    return (
      <article className={styles.post}>
        
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
        <OptionsModal show={this.state.showOptions} optionsModalClosed={this.optionsCancelHandler}>
          <PostOptions 
            id={this.props.id}
            onDelete={this.props.onDelete}
            profile={this.props.profile}
            creator={this.props.creator}
            trueUserId={this.props.trueUserId}
            onCancel={this.cancelCommentHandler}
            image={this.state.image}
          />
        </OptionsModal>

        {postUser}
        {/* <body></body> */}
        <div className={styles.PostImage}>
          <div className={styles.PostImageBg}>
            <img alt={this.props.content} src={this.state.image} />
          </div>
        </div>

        {likesAndComments}

        <div className={styles.PostCaption}>
          <NavLink className={styles.Navlink} to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink> {this.props.content}
        </div>
        <hr></hr>
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
          
          <section className={styles.feed__status}>
            <form onSubmit={this.finishCommentHandlerInput.bind(this)}>
              <Input
                id={this.state.post._id}
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
          <div style={{display:"flex", justifyContent:"center"}}><Button  onClick={this.startCommentHandler.bind(this, this.state.post._id)}>  Comment  </Button></div>

        <hr></hr>

        <div >
          <TimeAgo date={this.state.date} minPeriod="30"  />
          {/* {buttons} */}
        </div>

      </article>
    );
  }
}

export default Post;