import * as actionTypes from '../actions/actionTypes';

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
                ...state,
                isAuth: true,
                authLoading: false
                // token: something,
                // userId: something
            };
        case actionTypes.LOGOUT_HANDLE:
            return {
                ...state,
                isAuth: false,
                token: null
            };
        case actionTypes.SIGNUP_HANDLE:
            return {
                ...state,
                isAuth: false,
                authLoading: false
            };
        case actionTypes.BACKDROP_SHOW:
            return {
                ...state,
                showBackdrop: false, 
                showMobileNav: false, 
                error: null
            };
        case actionTypes.MOBILE_NAV:
            return {
                ...state
                // showMobileNav: isOpen, 
                // showBackdrop: isOpen
            };
        case actionTypes.ERROR:
            return{
                ...state,
                error: null
            };
        default:
            return state;
    }
};

export default AppReducer;