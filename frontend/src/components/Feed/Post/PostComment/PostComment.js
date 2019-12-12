import React, { Component, Fragment } from 'react';

import Backdrop from '../../../Backdrop/Backdrop';
import Modal from '../../../Modal/Modal';
import Input from '../../../Form/Input/Input';
import { required, length } from '../../../../util/validators';

const POST_FORM = {
  comment: {
    value: '',
    valid: false,
    touched: false,
    validators: [required, length({ min: 0 })]
  }
};

class PostComment extends Component {
  state = {
    postForm: POST_FORM,
    formIsValid: false
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.editing &&
      prevProps.editing !== this.props.editing &&
      prevProps.selectedPost !== this.props.selectedPost
    ) {
      const postForm = {
        comment: {
          ...prevState.postForm.comment,
          value: this.props.selectedPost.comment,
          valid: true
        }
      };
      this.setState({ postForm: postForm, formIsValid: true });
    }
  }

  postInputChangeHandler = (input, value, files) => {
    this.setState(prevState => {
      let isValid = true;
      for (const validator of prevState.postForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.postForm,
        [input]: {
          ...prevState.postForm[input],
          valid: isValid,
          value: files ? files[0] : value
        }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
      return {
        postForm: updatedForm,
        formIsValid: formIsValid
      };
    });
  };

  inputBlurHandler = input => {
    this.setState(prevState => {
      return {
        postForm: {
          ...prevState.postForm,
          [input]: {
            ...prevState.postForm[input],
            touched: true
          }
        }
      };
    });
  };

  cancelPostChangeHandler = () => {
    this.setState({
      postForm: POST_FORM,
      formIsValid: false
    });
    this.props.onCancelEdit();
  };

  acceptPostChangeHandler = () => {
    const post = {
      comment: this.state.postForm.comment.value
    };
    this.props.onFinishEdit(post);
    this.setState({
      postForm: POST_FORM,
      formIsValid: false
    });
    // this.setState({
    //   postForm: POST_FORM,
    //   formIsValid: false
    // });
    // this.props.onCancelEdit();
  };

  render() {

    // let modalTitle = this.props.newPost ? 'New Post' : 'Edit Post';
    let modalTitle = 'Comment';

    return this.props.editing ? (
      <Fragment>
        <Backdrop onClick={this.cancelPostChangeHandler} />
        <Modal
          title={modalTitle}
          acceptEnabled={this.state.formIsValid}
          onCancelModal={this.cancelPostChangeHandler}
          onAcceptModal={this.acceptPostChangeHandler}
          isLoading={this.props.loading}
        >
          <form>
            <Input
              id="comment"
              label="Comment"
              control="textarea"
              rows="5"
              onChange={this.postInputChangeHandler}
              onBlur={this.inputBlurHandler.bind(this, 'comment')}
              valid={this.state.postForm['comment'].valid}
              touched={this.state.postForm['comment'].touched}
              value={this.state.postForm['comment'].value}
            />
          </form>
        </Modal>
      </Fragment>
    ) : null;
  }
}

export default PostComment;
