import React, {Component, Fragment} from 'react';
import TimeAgo from 'react-timeago';
import openSocket from 'socket.io-client';

import Button from '../../Button/Button';
import FeedEdit from '../../Feed/FeedEdit/FeedEdit';

// import styles from './Message.module.css';
import './Message.css';

class Message extends Component {

  state = {
    from: '',
    to: '',
    date: '',
    content: '',
    overFlowMenuActive: false,
    trueUserId: localStorage.getItem('userId'),
    message: {},
    isEditing: false,
    editLoading: false,
    editComment: null,
    isEditingComment: false,
    commentText: '',
    editMsg: null
  };

  componentDidMount() {
    const msgId = this.props.id;
    fetch('http://localhost:8080/chat/message/' + msgId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch msg');
      }
      return res.json();
    })
    .then(resData => {
      this.setState({
        from: resData.msg.from,
        to: resData.msg.to,
        date: new Date(resData.msg.createdAt).toLocaleString(),
        content: resData.msg.content,
        message: resData.msg
      });
      
    })
    .catch(err => {
      console.log(err);
    });
    // sockets for instant updating changes on a post
    // const socket = openSocket('http://localhost:8080');
    // socket.on('post', data => {
    //   if (data.action === 'editMessage') {
    //     this.loadMessage();
    //   }
    // });
  };

  // load message
  // loading post's details handler
//   loadPost = () => {
//     const postId = this.state.post._id;
//     fetch('http://localhost:8080/feed/post/' + postId, {
//       headers: {
//         Authorization: 'Bearer ' + this.props.token
//       }
//     })
//     .then(res => {
//       if (res.status !== 200) {
//         throw new Error('Failed to fetch posts');
//       }
//       return res.json();
//     })
//     .then(resData => {
//       this.setState({
//         post: resData.post
//       })
//       this.loadComments();
//       this.loadLikes();
//     })
//     .catch(err => {
//       console.log(err);
//     });
//   };

  // part of updating comments handler
  startEditMessageHandler = postId => {
    this.setState(prevState => {
      const loadedMsg = this.state.message;

      return {
        isEditing: true,
        editMsg: loadedMsg
      };
    });
  };

  // part of updating post handler
  cancelEditHandler = () => {
    this.setState({ isEditing: false, editMsg: null });
  };

  // part of updating comments handler
  finishEditHandler = msgData => {
    this.setState({
      editLoading: true
    });
    const formData = new FormData();
    // formData.append('title', postData.title);
    formData.append('content', msgData.content);
    // formData.append('image', postData.image);
    let url = 'http://localhost:8080/chat/message';
    let method = 'POST';
    if (this.state.editMsg) {
      url = 'http://localhost:8080/chat/message/' + this.state.editMsg._id;
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
          throw new Error('Editing a message failed!');
        }
        return res.json();
      })
      .then(resData => {
        this.setState(prevState => {
          return {
            isEditing: false,
            editMsg: null,
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

  render () {

    // console.log('yo');

    let mode='';

    if(this.props.trueUser===this.props.from){
        mode='fromTrueUser';
    }else{
        mode='fromFriend';
    }
    // console.log(mode);

    let buttons = '';
    if(this.state.trueUserId === localStorage.getItem("userId")) {
        buttons = (
          <div className={['msg__actions']}>
            <Button mode="flat"  onClick={this.startEditMessageHandler.bind(this, this.state.message._id)}>
                <span role="img" aria-label="sheep">&#x270F;&#xFE0F;</span>
            </Button>
          </div>
        )
      }
    // console.log(this.state.date)

    return (
        // <Fragment>
            
            <article className={[mode]}>
                <FeedEdit
                    editing={this.state.isEditing}
                    selectedPost={this.state.editMsg}
                    loading={this.state.editLoading}
                    onCancelEdit={this.cancelEditHandler}
                    onFinishEdit={this.finishEditHandler}
                />
                <div className={['MsgCaption']}>
                    {this.props.content}
                </div>
                {/* {buttons} */}
                {/* <hr></hr> */}
                <div className={['time']}> 
                    <TimeAgo date={this.state.date} minPeriod="30"/>
                    {/* {this.state.date} */}
                </div>
            </article>
        // </Fragment>
    );
  }
}

export default Message;