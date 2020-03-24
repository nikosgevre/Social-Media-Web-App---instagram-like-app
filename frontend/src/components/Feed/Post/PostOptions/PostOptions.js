import React, {Component, Fragment} from 'react';
// import { NavLink } from 'react-router-dom';

// import OptionsBackdrop from '../../../Backdrop/OptionsBackdrop/OptionsBackdrop';

import Button from '../../../Button/Button';
import styles from './PostOptions.module.css';

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
      
        // if(this.props.profile) {
        //     if(this.props.creator._id === this.props.trueUserId){
        //         buttons = (
        //         <div >
        //             <Button mode="flat" link={`${this.props.id}`}>
        //             View
        //             </Button>
        //             <Button mode="flat" design="danger" onClick={this.props.onDelete}>
        //             Delete
        //             </Button>
        //         </div>
        //         );
        //     }
        // };
        return (
            <Fragment>
              {/* <OptionsBackdrop show={this.props.show} clicked={this.props.optionsModalClosed} /> */}
                {buttons}
            </Fragment>
        );
    }
}

export default PostOptions;