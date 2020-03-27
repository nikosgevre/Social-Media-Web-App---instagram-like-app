import React, { Component } from 'react';

import Input from '../../../../components/Form/Input/Input';
import { required, length } from '../../../../util/validators';
import Auth from '../../Auth';

class NewPassword extends Component {
  state = {
    resetForm: {
      password: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, length({ min: 5 })]
      },
      formIsValid: false
    },
    user: null,
    userId: '',
    passwordToken: ''
  };

  componentDidMount() {
    const rstToken = this.props.match.params.token;
    fetch('http://localhost:8080/auth/reset/' + rstToken, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch post');
      }
      return res.json();
    })
    .then(resData => {
      this.setState({
        userId: resData.userId,
        passwordToken: resData.resetToken
      });
    })
    .catch(err => {
      console.log(err);
    });
  }

  inputChangeHandler = (input, value) => {
    this.setState(prevState => {
      let isValid = true;
      for (const validator of prevState.resetForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.resetForm,
        [input]: {
          ...prevState.resetForm[input],
          valid: isValid,
          value: value
        }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
      return {
        resetForm: updatedForm,
        formIsValid: formIsValid
      };
    });
  };

  inputBlurHandler = input => {
    this.setState(prevState => {
      return {
        resetForm: {
          ...prevState.resetForm,
          [input]: {
            ...prevState.resetForm[input],
            touched: true
          }
        }
      };
    });
  };

  render() {
    return (
      <Auth>
        <form
          onSubmit={e =>
            this.props.onSetNewPassword(e, {
              password: this.state.resetForm.password.value,
              userId: this.state.userId,
              passwordToken: this.state.passwordToken,
              type: 'password'
            })
          }
        >
          <fieldset>
            <p >Set A New Password</p>
            <Input
              id="password"
              label="Your New Password"
              type="password"
              control="input"
              onChange={this.inputChangeHandler}
              onBlur={this.inputBlurHandler.bind(this, 'password')}
              value={this.state.resetForm['password'].value}
              valid={this.state.resetForm['password'].valid}
              touched={this.state.resetForm['password'].touched}
            />
            <div>
              <input type="hidden" name="userId" value={this.state.userId} />
              <input type="hidden" name="passwordToken" value={this.state.passwordToken} />
              <input type="hidden" name="_csrf" value={this.props.token} />
              <input type="submit" value="Register" />
            </div>
          </fieldset>
        </form>
      </Auth>
    );
  }
}

export default NewPassword;
