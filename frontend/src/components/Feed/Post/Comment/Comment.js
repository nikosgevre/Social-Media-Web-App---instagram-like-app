import React, {Component, Fragment} from 'react';
import { NavLink } from 'react-router-dom';
import TimeAgo from 'react-timeago'

import Button from '../../../Button/Button';
import styles from './Comment.module.css';

class Post extends Component {

  state = {
    author: '',
    date: '',
    comments: [],
    likes: [],
    trueUserId: localStorage.getItem('userId')
  };

  componentDidMount() {
      this.loadComments();
      this.loadLikes();
  }

  loadComments = () => {
    fetch('http://localhost:8080/feed/getComments/' + this.props.postId, {
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

  loadLikes = () => {
    // console.log('getlikes');
    const commentId = this.props.id;
    // console.log(commentId);
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

  render () {

    let likesAndComments = (
      <div>
        <div className={styles.PostCaption}>
            <Button onClick={this.likeHandler}>L</Button> <strong> {this.state.likes.length} | </strong>
            {/* <NavLink className={styles.Navlink} to={`${this.props.id}`} user={this.props.creator}><strong>  comments</strong> {(this.state.comments.length === 0) ? '' : ( '(' + this.state.comments.length + ')')}</NavLink> */}
            {/* <Button style={{float:"right"}} onClick={this.startCommentHandler.bind(this, this.state.post._id)}>  Comment  </Button>   */}
            {/* <strong> {this.state.comments.length} </strong> */}
        </div>
      </div>
    );

    if (this.state.likes.some(like => like._id.toString() === this.state.trueUserId)){
      likesAndComments = (
      <div>
        <div className={styles.PostCaption}>
            <Button design="danger" onClick={this.likeHandler}>D</Button> <strong> {this.state.likes.length} | </strong>
            {/* <NavLink className={styles.Navlink} to={`${this.props.id}`} user={this.props.creator}><strong>  comments</strong> {(this.state.comments.length === 0) ? '' : ( '(' + this.state.comments.length + ')')}</NavLink> */}
            {/* <Button  onClick={this.startCommentHandler.bind(this, this.state.post._id)}>  Comment  </Button>  */}
            {/* <strong> {this.state.comments.length} </strong> */}
        </div>
        {/* <div className="Post-caption">
          <NavLink className='Nav-link' to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink> {this.props.content}
        </div> */}
      </div>
      );
    };

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
        <article className={styles.post1}>
          <div>
            <div >
              <NavLink className={styles.Navlink} to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink> {this.props.content}
            </div>
          </div>
          {buttons}
        </article>
      </Fragment>
    );
  }
}

export default Post;