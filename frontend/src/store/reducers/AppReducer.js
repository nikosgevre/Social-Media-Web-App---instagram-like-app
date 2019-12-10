import * as actionTypes from '../actions/AppActions';

const initialState = {
    showBackdrop: false,
    showMobileNav: false,
    isAuth: false,
    token: null,
    userId: null,
    authLoading: false,
    error: null
};

const AppReducer = (state = initialState, action) => {
    switch(action.type) {
        case actionTypes.LOGIN_HANDLE:
            return {

            };
        case actionTypes.LOGOUT_HANDLE:
            return {

            };
        case actionTypes.SIGNUP_HANDLE:
            return {
                
            };
        case actionTypes.BACKDROP_SHOW:
            return {
                
            };
        case actionTypes.MOBILE_NAV:
            return {
                
            };
        default:
            return state;
    }
};

export default AppReducer;