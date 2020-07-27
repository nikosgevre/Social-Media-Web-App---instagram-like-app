import React, { Component, Fragment } from 'react';

import Input from '../../components/Form/Input/Input';
// import Button from '../../components/Button/Button';
import { required, length, email } from '../../util/validators';
// import Auth from './Auth';

import styles from './Signup.module.css';
import btStyles from '../../Assets/global-styles/bootstrap.min.module.css';

class Signup extends Component {
  state = {
    signupForm: {
      email: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, email]
      },
      password: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, length({ min: 5 })]
      },
      name: {
        value: '',
        valid: false,
        touched: false,
        validators: [required]
      },
      formIsValid: false
    },
    loginForm: {
      email: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, email]
      },
      password: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, length({ min: 5 })]
      },
      formIsValid: false
    }
  };

  inputChangeHandlerS = (input, value) => {
    this.setState(prevState => {
      let isValid = true;
      for (const validator of prevState.signupForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.signupForm,
        [input]: {
          ...prevState.signupForm[input],
          valid: isValid,
          value: value
        }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
      return {
        signupForm: updatedForm,
        formIsValid: formIsValid
      };
    });
  };

  inputChangeHandlerL = (input, value) => {
    this.setState(prevState => {
      let isValid = true;
      for (const validator of prevState.loginForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.loginForm,
        [input]: {
          ...prevState.loginForm[input],
          valid: isValid,
          value: value
        }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
      return {
        loginForm: updatedForm,
        formIsValid: formIsValid
      };
    });
  };

  inputBlurHandlerS = input => {
    this.setState(prevState => {
      return {
        signupForm: {
          ...prevState.signupForm,
          [input]: {
            ...prevState.signupForm[input],
            touched: true
          }
        }
      };
    });
  };

  inputBlurHandlerL = input => {
    this.setState(prevState => {
      return {
        loginForm: {
          ...prevState.loginForm,
          [input]: {
            ...prevState.loginForm[input],
            touched: true
          }
        }
      };
    });
  };

  render() {
    return (
      
      <Fragment>
        <style dangerouslySetInnerHTML={{__html: `
           body { background-color:#eee; }
        `}} />
        <div className={styles.containerFluid}>
          <div className={styles.container}>
           <hr></hr>
          </div>
          <div className={btStyles.row}>
            <div className={btStyles["col-md-5"]}>
              <form onSubmit={e => this.props.onSignup(e, this.state)}>
                <fieldset>
                  <p className={` ${btStyles["text-uppercase"]} ${btStyles["pull-center"]} `}> SIGN UP.</p>	
                  <div className={btStyles["form-group"]}>
                    <Input
                      class="form-control input-lg"
                      id="name"
                      placeholder="username"
                      type="text"
                      control="input"
                      onChange={this.inputChangeHandlerS}
                      onBlur={this.inputBlurHandlerS.bind(this, 'name')}
                      value={this.state.signupForm['name'].value}
                      valid={this.state.signupForm['name'].valid}
                      touched={this.state.signupForm['name'].touched}
                    />
                  </div>
                  <div className={btStyles["form-group"]}>
                    <Input
                      class="form-control input-lg"
                      id="email"
                      placeholder="Email Address"
                      type="email"
                      control="input"
                      onChange={this.inputChangeHandlerS}
                      onBlur={this.inputBlurHandlerS.bind(this, 'email')}
                      value={this.state.signupForm['email'].value}
                      valid={this.state.signupForm['email'].valid}
                      touched={this.state.signupForm['email'].touched}
                    />
                  </div>
                  <div className={btStyles["form-group"]}>
                    <Input
                      class="form-control input-lg"
                      id="password"
                      placeholder="Password"
                      type="password"
                      control="input"
                      onChange={this.inputChangeHandlerS}
                      onBlur={this.inputBlurHandlerS.bind(this, 'password')}
                      value={this.state.signupForm['password'].value}
                      valid={this.state.signupForm['password'].valid}
                      touched={this.state.signupForm['password'].touched}
                    />
                  </div>
                  <div>
                    {/* <Button design="raised" type="submit" loading={this.props.loading}>
                      Signup
                    </Button> */}
                    <input type="submit" className={` ${btStyles.btn} ${btStyles["btn-lg"]} ${btStyles["btn-primary"]} `} value="Register"></input>
                  </div>
                </fieldset>
              </form>
            </div>

            <div className={btStyles["col-md-2"]}>
            </div>

            {/* <div className={btStyles["col-md-5"]}>
              <form onSubmit={e => this.props.onLogin(e, {
                    email: this.state.loginForm.email.value,
                    password: this.state.loginForm.password.value
                  }) } 
              >
                <fieldset>
                  <p className={btStyles["text-uppercase"]}> Login using your account: </p>
                  <div className={btStyles["form-group"]}>
                    <Input
                      class="form-control input-lg"
                      id="email"
                      placeholder="Email Address"
                      type="email"
                      control="input"
                      onChange={this.inputChangeHandlerL}
                      onBlur={this.inputBlurHandlerL.bind(this, 'email')}
                      value={this.state.loginForm['email'].value}
                      valid={this.state.loginForm['email'].valid}
                      touched={this.state.loginForm['email'].touched}
                    />
                  </div>
                  <div className={btStyles["form-group"]}>
                    <Input
                      class="form-control input-lg"
                      id="password"
                      placeholder="Password"
                      type="password"
                      control="input"
                      onChange={this.inputChangeHandlerL}
                      onBlur={this.inputBlurHandlerL.bind(this, 'password')}
                      value={this.state.loginForm['password'].value}
                      valid={this.state.loginForm['password'].valid}
                      touched={this.state.loginForm['password'].touched}
                    />
                  </div>
                  <div>
                    <input type="submit" className={` ${btStyles.btn} ${btStyles["btn-md"]} `} value="Sign In" />
                  </div>
                </fieldset>
              </form>
            </div> */}

          </div>
        </div>
      </Fragment>
    );
  }
}

export default Signup;
