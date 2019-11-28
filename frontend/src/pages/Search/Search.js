import React, { Component } from 'react';

import './Search.css';

class Search extends Component {
  state = {
    username: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  componentDidMount() {
    fetch('http://localhost:8080/feed/search', {
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
          username: resData.searchResults.name
          // author: resData.post.creator.name,
          // image: 'http://localhost:8080/' + resData.post.imageUrl,
          // date: new Date(resData.post.createdAt).toLocaleDateString('en-US'),
          // content: resData.post.content
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.username}</h1>
        
      </section>
    );
  }
}

export default Search;
