import React, { Component, Fragment } from 'react';
import Suggestions from './Suggestions/Suggestions';

// import styles from './Search.module.css';


class SearchUI extends Component {

  state = {
    query: '',
    results: [],
    users: [],
    filtered: []
  }

  fetchUsers = () => {
    // console.log(this.props.token);
    if(this.props.token){
      fetch('http://localhost:8080/user/getUsers', {
        headers: {
          Authorization: 'Bearer ' + this.props.token
        }
      })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch users.');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({ 
          users: resData.users.map(user => {
            return {
              ...user
            };
          })
        });
        
      })
      .catch(this.catchError);
    }
  };

  componentDidMount() {
    this.setState({
      filtered: []
    });
  }

  // componentWillReceiveProps(nextProps) {
  //   this.setState({
  //     filtered: []
  //   });
  // }
	
	handleChange(e) {
		// Variable to hold the original version of the list
    let currentList = [];
		// Variable to hold the filtered list before putting into state
    let newList = [];

    this.setState({ value: e.target.value });
		
		// If the search bar isn't empty
    if (e.target.value !== "") {
			// Assign the original list to currentList
      currentList = this.state.users;
			
			// Use .filter() to determine which items should be displayed
			// based on the search terms
      newList = currentList.filter(item => {
				// change current item to lowercase
        const lc = item.name.toString().toLowerCase();
				// change search term to lowercase
        const filter = e.target.value.toLowerCase();
				// check to see if the current list item includes the search term
				// If it does, it will be added to newList. Using lowercase eliminates
				// issues with capitalization in search terms and search content
        return lc.includes(filter);
      });
      // console.log(newList);
    } else {
			// If the search bar is empty, set newList to original task list
      newList = [];
    }
		// Set the filtered state based on what our rules added to newList
    this.setState({
      filtered: newList
    });

  }

  clearFiltered = () => {
    this.setState({ filtered: [], value: '' });
  }
	
	render() {
    if(this.state.users.length === 0){
      this.fetchUsers();
    }
    // console.log(this.state.users);
    // console.log(this.state.filtered);
		return (
			<div>
				<input type="text" className="input" onChange={this.handleChange.bind(this)} placeholder="Search..." value={this.state.value} />
        {/* <ul>
          {this.state.filtered.map(item => (
            <li key={item._id}>
              {item} &nbsp;
              <span
                className="delete"
                onClick={() => this.props.delete(item)}
                />
            </li>
          ))}
        </ul> */}
        <Suggestions results={this.state.filtered} clear={this.clearFiltered} />
				</div>
		)
	}

}

export default SearchUI

