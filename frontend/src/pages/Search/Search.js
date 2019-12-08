import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import './Search.css';

class Search extends Component {
  state = {
    searchResults: []
  };

  componentDidMount() {
    fetch('http://localhost:8080/user/search?username=' + this.props.match.params.username, {
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
          searchResults: resData.users.map(user => {
            return{...user};
          })
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        {this.state.searchResults.map(user => (
            <article> 
              <NavLink to={'/profile/' + user._id}>{user.name}</NavLink>
            </article>
          ))}
        {/* <h1>{this.state.searchResults}</h1> */}
      </section>
    );
  }
}

export default Search;
