import React, {Component} from 'react';
import { NavLink } from 'react-router-dom';

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
    userImage: ''
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
          date: new Date(resData.post.createdAt).toLocaleString('en-US'),
          content: resData.post.content,
          userImage: 'http://localhost:8080/' + resData.post.creator.image
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

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

    // console.log(typeof this.props.id);

    let buttons = (
      <div className="post__actions">
        <Button mode="flat" link={`${this.props.id}`}>
          View
        </Button>
      </div>
    );
    // console.log('---------------- ' + this.props.id);
    // console.log('user id: ' + localStorage.getItem("userId"));
    // console.log('creator id: ' + this.props.creator._id);
    if(this.props.creator._id === localStorage.getItem("userId")) {
      // console.log(this.props.creator);
      buttons = (
        <div className="post__actions">
          <Button mode="flat" link={`${this.props.id}`}>
            View
          </Button>
          <Button mode="flat" image={this.state.image} onClick={this.props.onStartEdit}>
            Edit
          </Button>
          <Button mode="flat" design="danger" onClick={this.props.onDelete}>
            Delete
          </Button>
        </div>
      )
    }

    let postUser = (<header className="post__header"></header>);

    if(this.props.caller === 'feed') {
      postUser= (
        <header className="post__header">
          <div className="Post-user">
              <div className="Post-user-avatar">
                <img src={this.state.userImage} alt={this.props.author} />
              </div>
              <div className="Post-user-nickname">
                <NavLink className='Nav-link' to={'/profile/' + this.props.creator._id}>{this.props.author}</NavLink>
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
          <div className="post__meta">
            <h3 className="post__meta">{this.state.date}</h3>
          </div>
        </header>
      );
    }
    else if(this.props.caller === 'profile'){
      postUser = (<header className="post__header"></header>);
    }

    // console.log('this.props.id: ' + this.props.id);

    return (
      <article className="post">
        {postUser}

        <div className="Post-image">
          <div className="Post-image-bg">
            <img alt={this.props.content} src={this.state.image} />
          </div>
        </div>

        <div className="Post-caption">
          <strong>{this.props.author}</strong> {this.props.content}
        </div>

        {buttons}

      </article>
    );
  }
}


export default Post;
