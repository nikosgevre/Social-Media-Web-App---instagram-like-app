import React, { Component, Fragment } from 'react';
import Suggestions from './Suggestions/Suggestions';
// import SearchBar from 'react-native-dynamic-search-bar';

import './Search.css';

class Search extends Component {
  state = {
    query: '',
    results: []
  }

  fetchSearchResults = () => {
    console.log(this.state.query);
    fetch('http://localhost:8080/user/search?username=' + this.state.query.toString() + '&limit=7', {
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
          results: resData.users.map(user => {
            return{...user};
          })
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleInputChange = () => {
    this.setState({
      query: this.search.value
    }, () => {
      if (this.state.query && this.state.query.length > 1) {
        if (this.state.query.length % 2 === 0) {
          this.fetchSearchResults();
        }
      } else if (!this.state.query) {
      }
    })
  }

  submitHandler = () => {
    // if(this.state.results)
    // this.props.history.push('/search?username=' + this.state.query.toString());
  }

  render() {
    return (
      <Fragment>

        {this.props.isAuth && (
          <Fragment>
          
            <form className="search" onSubmit={this.submitHandler()}>
              <input
                id="myInput"
                type="text"
                placeholder="Search..."
                ref={input => this.search = input}
                onChange={this.handleInputChange}
                
              />
            
            </form>
            <Suggestions results={this.state.results} />
          </Fragment>
        )}
        
      </Fragment>
    )
  }
}

export default Search

