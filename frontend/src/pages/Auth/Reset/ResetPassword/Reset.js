import React, { Component } from 'react';

import Input from '../../../../components/Form/Input/Input';
// import Button from '../../components/Button/Button';
import { required, email } from '../../../../util/validators';
import Auth from '../../Auth';

class Login extends Component {
  state = {
    resetForm: {
      email: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, email]
      },
      formIsValid: false
    }
  };

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
            this.props.onReset(e, {
              email: this.state.resetForm.email.value,
              type: 'password'
            })
          }
        >
          <p >Reset Password</p>
          <Input
            id="email"
            label="Your E-Mail"
            type="email"
            control="input"
            onChange={this.inputChangeHandler}
            onBlur={this.inputBlurHandler.bind(this, 'email')}
            value={this.state.resetForm['email'].value}
            valid={this.state.resetForm['email'].valid}
            touched={this.state.resetForm['email'].touched}
          />
          <div>
            <input type="hidden" name="_csrf" value={this.props.token} />
            <input type="submit" value="Register" />
          </div>
          {/* <Button design="raised" type="submit" loading={this.props.loading}>
            Reset Password
          </Button> */}
        </form>
      </Auth>
    );
  }
}

export default Login;
