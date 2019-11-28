import React, { Component } from 'react';
import SearchField from "react-search-field";

// import classes from './Search.css';

class Search extends Component {

    searchHandler = () => {
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

    render () {
        return (

            this.props.isAuth && (
                <SearchField
                    placeholder="Search..."
                    onChange={this.searchHandler}
                    // searchText="Search"
                    classNames="test-class"
                />
            )  

        );
    }
}


export default Search;