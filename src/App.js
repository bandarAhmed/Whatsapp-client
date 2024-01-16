import React, { Component } from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import AppRoute from './AppRoute';
import { Chat, NotFound, Register, Login, Password} from '../src/views';
import Auth from './Auth';

class App extends Component {
    render() {
        return (
           <div id="main-container" className="container-fluid">
               <Router>
                   <Switch>
                       <AppRoute path='/' exact component={Chat} can={Auth.auth} redirect='/login' />
                       <AppRoute path='/password' component={Password} can={Auth.auth} redirect='/login' />
                       <AppRoute path='/password' component={Password} can={Auth.auth} redirect='/login' />
                       <AppRoute path='/register' component={Register} can={Auth.guest} redirect='/' />
                       <AppRoute path='/login' component={Login} redirect='/' />
                       <AppRoute component={NotFound} />
                   </Switch>
               </Router>
           </div>
        );
    }
}

export default App;
