import React, { Component, Fragment } from 'react';

import styles from './ChatUsers.module.css';

class ChatUsers extends Component {

    getClass = (itemId) => {
        let number = 0;
        let nameClass = '';
        let check = false;
        if(this.props.user && this.props.user._id === itemId ){
            nameClass = 'viewWrapItemFocused';
        }else{
            
        }

    };

    render() {

        return (
          <Fragment>
              {/* <p>{this.props.user.name}</p> */}
              <div className={styles.viewWrapItem}>
                {this.props.user.name}
              </div>
          </Fragment>
        )
    };
    
}

export default ChatUsers;