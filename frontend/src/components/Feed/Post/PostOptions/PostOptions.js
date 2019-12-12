import React, {Component, Fragment} from 'react';
// import { NavLink } from 'react-router-dom';

import Button from '../../../Button/Button';
import './PostOptions.css';

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
              <div >
                <Button mode="flat" link={`${this.props.id}`}>
                  View
                </Button>
                {/* <Button mode="flat" image={this.state.image} onClick={this.props.onStartEdit}>
                  Edit
                </Button> */}
                <Button mode="flat" design="danger" onClick={this.props.onDelete}>
                  Delete
                </Button>
              </div>
            )
        };
      
        if(this.props.profile) {
            if(this.props.creator._id === this.props.trueUserId){
                buttons = (
                <div >
                    <Button mode="flat" link={`${this.props.id}`}>
                    View
                    </Button>
                    <Button mode="flat" design="danger" onClick={this.props.onDelete}>
                    Delete
                    </Button>
                </div>
                );
            }
        };
        return (
            <Fragment>
                {buttons}
            </Fragment>
        );
    }
}

export default PostOptions;