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
    trueUserId: localStorage.getItem('userId')
  };

  componentDidMount() {
      this.loadComments();
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

  render () {

    let buttons = (
      <div className={styles.post__actions}>
        <TimeAgo date={this.props.date} minPeriod="30"  />
      </div>
    );

    if(this.props.creator._id === localStorage.getItem("userId")) {
      buttons = (
        <div className={styles.post__actions} >
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