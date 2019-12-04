import React, {Component} from 'react';
import { NavLink } from 'react-router-dom';
import TimeAgo from 'react-timeago'

import Button from '../../Button/Button';
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
    gotLike: false,
    trueUserId: localStorage.getItem('userId'),
    post: {}
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
          // trueUserId: localStorage.getItem('userId'),
          title: resData.post.title,
          author: resData.post.creator.name,
          image: 'http://localhost:8080/' + resData.post.imageUrl,
          date: new Date(resData.post.createdAt).toLocaleString(),
          content: resData.post.content,
          // comments: 'resData.post.comments', //map gia ola ta comments / isws kai state gia to post olokliro
          userImage: 'http://localhost:8080/' + resData.post.creator.image,
          likes: resData.post.likes.map(like => {
            return{...like};
          }),
          post: resData.post
        });
        // console.log(this.state.userId);
      })
      .catch(err => {
        console.log(err);
      });
  }

  likeHandler = event => {
    event.preventDefault();
    const postId = this.props.id;
    const userId = localStorage.getItem('userId');
    // console.log('postId: ' + postId);
    // console.log('userId: ' + userId);
    // backend for like
    // if already like then dislike
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
      // egine to like. sto like handler kaneis like
      this.setState({gotLike: true})
      this.setState({ likes: resData.post.likes.map(like => {
        return{...like};
      })});
    })
    .catch(this.catchError);
    // console.log('Liikee!!!');
  };

  dislikeHandler = event => {
    event.preventDefault();
    const postId = this.props.id;
    const userId = localStorage.getItem('userId');
    console.log('postId: ' + postId);
    // backend for like
    // if already like then dislike
    fetch('http://localhost:8080/feed/postDislike?postId=' + postId + '&userId=' + userId, {
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
      // egine to like. sto like handler kaneis like
      this.setState({gotLike: false})
      this.setState({ likes: resData.post.likes.map(like => {
        return{...like};
      })});
    })
    .catch(this.catchError);
    console.log('disssLiikee!!!');
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

    let postUser = (<header className="post__header"></header>);
    // let likesAndComments = (<div></div>);
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
            <NavLink className='Nav-link' to={`${this.props.id}`} user={this.props.creator}><strong>  comments</strong> {(this.state.comments.length === 0) ? '' : this.state.comments.length}</NavLink>
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
            <NavLink className='Nav-link' to={`${this.props.id}`} user={this.props.creator}><strong>  comments</strong> {(this.state.comments.length === 0) ? '' : this.state.comments.length}</NavLink>
        </div>
        <div className="Post-caption">
          <NavLink className='Nav-link' to={'/profile/' + this.props.creator._id} user={this.props.creator}>{this.props.author}</NavLink> {this.props.content}
        </div>
      </div>
      );
    }

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
    }

    if(this.props.profile) {
      buttons = (
        <div className="post__actions">
          <Button mode="flat" link={`${this.props.id}`}>
            View
          </Button>
          <Button mode="flat" design="danger" onClick={this.props.onDelete}>
            Delete
          </Button>
        </div>
      )
    }

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

              {/* <div className="dropdown" style={{float: "right"}}>
                <ul className="dropbtn icons btn-right showLeft" onClick={this.showDropdown()}>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                <div id="myDropdown" className="dropdown-content">
                  {buttons}
                </div>
              </div> */}
              
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

        {postUser}

        <div className="Post-image">
          <div className="Post-image-bg">
            <img alt={this.props.content} src={this.state.image} />
          </div>
        </div>

        {likesAndComments}

        <div className="Post-caption">
          <TimeAgo date={this.state.date} minPeriod="50"  />
        </div>

        {buttons}

      </article>
    );
  }
}

export default Post;