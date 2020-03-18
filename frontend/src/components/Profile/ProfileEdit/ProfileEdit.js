import React, { Component, Fragment } from 'react';

import Backdrop from '../../Backdrop/Backdrop';
import Modal from '../../Modal/Modal';
import Input from '../../Form/Input/Input';
import FilePicker from '../../Form/Input/FilePicker';
import Image from '../../Image/Image';
import { required, length } from '../../../util/validators';
import { generateBase64FromImage } from '../../../util/image';

import styles from './ProfileEdit.module.css';

const USER_FORM = {
  image: {
    value: '',
    valid: false,
    touched: false,
    validators: [required]
  },
  name: {
    value: '',
    valid: false,
    touched: false,
    validators: [required, length({ min: 0 })]
  },
  status: {
    value: '',
    valid: false,
    touched: false,
    validators: [required, length({ min: 0 })]
  }
};

class ProfileEdit extends Component {
  state = {
    userForm: USER_FORM,
    formIsValid: false,
    imagePreview: null
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.editing &&
      prevProps.editing !== this.props.editing &&
      prevProps.selectedUser !== this.props.selectedUser
    ) {
      const userForm = {
        image: {
          ...prevState.userForm.image,
          value: this.props.selectedUser.image,
          valid: true
        },
        name: {
          ...prevState.userForm.name,
          value: this.props.selectedUser.name,
          valid: true
        },
        status: {
            ...prevState.userForm.status,
            value: this.props.selectedUser.status,
            valid: true
          }
      };
      this.setState({ userForm: userForm, formIsValid: true });
    }
  }

  userInputChangeHandler = (input, value, files) => {
    if (files) {
      generateBase64FromImage(files[0])
        .then(b64 => {
          this.setState({ imagePreview: b64 });
        })
        .catch(e => {
          this.setState({ imagePreview: null });
        });
    }
    this.setState(prevState => {
      let isValid = true;
      for (const validator of prevState.userForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.userForm,
        [input]: {
          ...prevState.userForm[input],
          valid: isValid,
          value: files ? files[0] : value
        }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
    //   for (const inputStatus in updatedForm) {
    //     formIsValid = formIsValid && updatedForm[inputStatus].valid;
    //   }
      return {
        userForm: updatedForm,
        formIsValid: formIsValid
      };
    });
  };

  inputBlurHandler = input => {
    this.setState(prevState => {
      return {
        userForm: {
          ...prevState.userForm,
          [input]: {
            ...prevState.userForm[input],
            touched: true
          }
        }
      };
    });
  };

  cancelUserChangeHandler = () => {
    this.setState({
      userForm: USER_FORM,
      formIsValid: false
    });
    this.props.onCancelEdit();
  };

  acceptUserChangeHandler = () => {
    const user = {
      image: this.state.userForm.image.value,
      name: this.state.userForm.name.value,
      status: this.state.userForm.status.value
    };
    this.props.onFinishEdit(user);
    this.setState({
        userForm: USER_FORM,
      formIsValid: false,
      imagePreview: null
    });
  };

  render() {

    let modalTitle = 'Profile Edit';

    return this.props.editing ? (
      <Fragment>
        <Backdrop onClick={this.cancelUserChangeHandler} />
        <Modal
          title={modalTitle}
          acceptEnabled={this.state.formIsValid}
          onCancelModal={this.cancelUserChangeHandler}
          onAcceptModal={this.acceptUserChangeHandler}
          isLoading={this.props.loading}
        >
          <form>
            <FilePicker
              id="image"
              label="Image"
              control="input"
              onChange={this.userInputChangeHandler}
              onBlur={this.inputBlurHandler.bind(this, 'image')}
              valid={this.state.userForm['image'].valid}
              touched={this.state.userForm['image'].touched}
            />
            <div className={styles.newUser__previewImage}>
              {!this.state.imagePreview && <p>Please choose a new image.</p>}
              {this.state.imagePreview && (
                <Image imageUrl={this.state.imagePreview} contain left />
              )}
            </div>
            &nbsp;
            <Input
              id="name"
              label="userame  |"
              control="textarea"
              rows="1"
              onChange={this.userInputChangeHandler}
              onBlur={this.inputBlurHandler.bind(this, 'name')}
              valid={this.state.userForm['name'].valid}
              touched={this.state.userForm['name'].touched}
              value={this.state.userForm['name'].value}
            />
            &nbsp;
            <Input
              id="status"
              label="status  |"
              control="textarea"
              rows="1"
              cols="50"
              onChange={this.userInputChangeHandler}
              onBlur={this.inputBlurHandler.bind(this, 'status')}
              valid={this.state.userForm['status'].valid}
              touched={this.state.userForm['status'].touched}
              value={this.state.userForm['status'].value}
            />
            &nbsp;
          </form>
        </Modal>
      </Fragment>
    ) : null;
  }
}

export default ProfileEdit;
