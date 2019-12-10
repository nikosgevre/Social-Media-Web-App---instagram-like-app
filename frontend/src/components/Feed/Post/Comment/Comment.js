import React, {Component, Fragment} from 'react';
import { NavLink } from 'react-router-dom';
import TimeAgo from 'react-timeago'

import Button from '../../../Button/Button';
import style from './Comment.css';

class Post extends Component {

  state = {
    author: '',
    date: '',
    comments: [],
    trueUserId: localStorage.getItem('userId')
  };

  componentDidMount() {
    // const postId = this.props.id;
    // fetch('http://localhost:8080/feed/post/' + postId, {
    //   headers: {
    //     Authorization: 'Bearer ' + this.props.token
    //   }
    // })
    // .then(res => {
    //   if (res.status !== 200) {
    //     throw new Error('Failed to fetch');
    //   }
    //   return res.json();
    // })
    // .then(resData => {
    //   this.setState({
    //     author: resData.post.creator.name,
    //     date: new Date(resData.post.createdAt).toLocaleString()
    //   });
      this.loadComments();
    // })
    // .catch(err => {
    //   console.log(err);
    // });
  }

  loadComments = () => {
    // console.log('asdasdsa');
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

    let postUser = (<header className="post__header"></header>);
    let buttons = (
      <div className="post__actions">
      </div>
    );

    if(this.props.creator._id === localStorage.getItem("userId")) {
      buttons = (
        <div className="post__actions" >
          <Button mode="flat" onClick={this.props.onStartEdit}>
            Edit
          </Button>
          <Button mode="flat" design="danger" onClick={this.props.onDelete}>
            Delete
          </Button>
        </div>
      )
    }

    postUser= (
        <div className="Post-user-nickname">
            <NavLink className='Nav-link' to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink>
        </div>
    );
    return (

    //   <article className="post">
    //     <div style={{float:"left"}}>
    //       <NavLink className='Nav-link' to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink> {this.props.content}
    //     </div>
    //     <div className="Post-caption" style={{float:"right"}}>
    //       <TimeAgo date={this.props.date} minPeriod="30"  />
    //     </div>
    //     {buttons}
    //   </article>
      <Fragment>
        {/* <hr></hr> */}
        <article className="post1">
          <div>
            <div >
              <NavLink className='Nav-link' to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink> {this.props.content}
            </div>
            <div className="Post-caption" >
              <TimeAgo date={this.props.date} minPeriod="30"  />
            </div>
          </div>
          {/* <hr></hr> */}
          {buttons}
        </article>
      </Fragment>
    );
  }
}

export default Post;