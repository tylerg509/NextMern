import cookie from 'js-cookie'
import Router from 'next/router'

//set cookie
export const setCookie = (key, value) => {
    if(process.browser) {
        cookie.set(key, value, {
            expires: 1,
        })
    }
}

//remove from cookie
export const removeCookie = (key, value) => {
    if(process.browser) {
        cookie.remove(key)
    }
}

//get from cookie storad token
// when we need to requeset to server with auth token
export const getCookie = (key, req) => {
    // if(process.browser) {
    //     return cookie.get(key)
    // }
    return process.browser ? getCookieFromBrowser(key) : getCookieFromServer(key, req);
}

export const getCookieFromBrowser = (key) => {
    return cookie.get(key)
}

export const getCookieFromServer = (key, req) => {
    if(!req.headers.cookie) {
        return undefined
    }

    let token = req.headers.cookie.split(';').find(c => c.trim().startsWith(`${key}=`))
    if(!token) {
        return undefined
    } 
    let tokenValue = token.split('=')[1]
    console.log('getCookieFromServer', tokenValue)
    return tokenValue
}

// set to localstorage
export const setLocalStorage = (key, value) => {
    if(process.browser) {
        localStorage.setItem(key, JSON.stringify(value))
    }
}

//remove from localstorage
export const removeLocalStorage = (key) => {
    if(process.browser) {
        localStorage.removeItem(key)
    }
}

// auth user by passing data to cookie and localstorage during signin
export const authenticate = (response, next) => {
    setCookie('token', response.data.token)
    setLocalStorage('user', response.data.user)
    next()
}

// access user info from localstorage 
export const isAuth = () => {
    if(process.browser) {
        const cookieChecked = getCookie('token')
        if(cookieChecked) {
            if(localStorage.getItem('user')){
                return JSON.parse(localStorage.getItem('user'))
            } else {
                return false
            }
        }
    }
}

export const logout = () => {
    removeCookie('token')
    removeLocalStorage('user')
    Router.push('/login')
}