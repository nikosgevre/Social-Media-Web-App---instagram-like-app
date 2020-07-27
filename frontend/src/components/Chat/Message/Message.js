import React, {Component, Fragment} from 'react';
import TimeAgo from 'react-timeago';

import Button from '../../Button/Button';

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
  };

  render () {

    let mode='';

    if(this.props.trueUser===this.props.from){
        mode='fromTrueUser';
    }else{
        mode='fromFriend';
    }

    let buttons = '';
    if(this.state.trueUserId === localStorage.getItem("userId")) {
        buttons = (
          <div className={['msg__actions']}>
            <Button mode="flat" design="danger" onClick={this.props.onDelete}>
              X
            </Button>
          </div>
        )
      }
    // console.log(this.state.date)

    return (
        // <Fragment>
            <article className={[mode]}>
                <div className={['MsgCaption']}>
                    {this.props.content}
                </div>
                <div className={['time']}> 
                  <div style={{display: "inline-block"}}>
                    <TimeAgo date={this.state.date} minPeriod="30"/>
                    {/* {this.state.date} */}
                  </div>
                    
                  <div style={{display: "inline-block", float: "right"}}>
                    {buttons}
                  </div>
                </div>
            </article>
        // </Fragment>
    );
  }
}

export default Message;