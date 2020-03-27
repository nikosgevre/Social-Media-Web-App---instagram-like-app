import React, {Component, Fragment} from 'react';

import Button from '../../../Button/Button';
import styles from './PostOptions.module.css';

// post's options
class PostOptions extends Component {

    render() {
        let buttons = (
            <div >
                <Button mode="flat" link={`${this.props.id}`}>
                View
                </Button>
            </div>
        );
        if(this.props.creator._id === localStorage.getItem("userId")) {
            buttons = (
              <div>
                <div className={styles.btn}>
                  <Button mode="flat" link={`${this.props.id}`}>
                    View
                  </Button>
                </div>
                <hr></hr>
                {this.props.caller!=='profile' ? 
                <div>
                  <div>
                  {/* onClick={this.props.onStartEdit} */}
                    <Button mode="flat" image={this.props.image} onClick={() => { this.props.onStartEdit(); this.props.optionsModalClosed();}} >
                      Edit
                    </Button>
                  </div>
                  <hr></hr>
                </div>
                : null}
                <div>
                  <Button mode="flat" onClick={this.props.onDelete}>
                    Delete
                  </Button>
                </div>
                <hr></hr>
              </div>
            )
        };
        return (
            <Fragment>
                {buttons}
            </Fragment>
        );
    }
}

export default PostOptions;