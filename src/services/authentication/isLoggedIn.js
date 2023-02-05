function isLoggedIn() {
    return (localStorage.getItem('access_token') !== null
           && localStorage.getItem('refresh_token') !== null);
}

export default isLoggedIn;