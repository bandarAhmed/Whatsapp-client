import React from 'react';
import { Row, Spinner } from 'reactstrap';
import { ContactHeader, Contacts, ChatHeader, Messages, MessageForm, UserProfile, EditProfile} from '../components';
import socketIO from 'socket.io-client';
import Auth from '../Auth';

class Chat extends React.Component {

    state = {
        contacts: [],
        contact: {},
        userProfile: false,
        profile: false,
    };

    componentDidMount() {
        // Initialize socket.io connection.
        this.initSocketConnection();
    }


    logout = () => {
        this.state.socket.disconnect();
        Auth.logout();
        this.props.history.push('/');
    };

    // Socket.IO Events --------------------------------------------------------//
    /**
     * Initialize socket.io connection
     */
    initSocketConnection = () => {
        // Connect to server and send user token.
        let socket = socketIO('ws://localhost:4000', {
            query: 'token=' + Auth.getToken()
        });
        // Handle user connected event.
        socket.on('connect', () => this.setState({ connected: true }));
        // Handle user disconnected event.
        socket.on('disconnect', () => this.setState({ connected: false }));
        // Handle user data event (after connection).
        socket.on('data', (user, contacts, messages, users) => {
            let contact = contacts[0] || {};
            this.setState({ messages, contacts, user, contact}, () => {
                this.updateUsersState(users)
            });
        });
        socket.on('new_user', this.onNewUser);
        // Handle update user event.
        socket.on('update_user', this.onUpdateUser);
        // Handle incoming message event.
        socket.on('message', this.onNewMessage);
        // Handle changes for user presence.
        socket.on('user_status', this.updateUsersState);
        // Handle typing or composing event.
        socket.on('typing', this.onTypingMessage);
        // Handle socket.io errors.
        socket.on('error', this.onSocketError);
        // Set user socket as state variable.
        this.setState({socket});
    };

    onUpdateUser = user => {
        // Add updated user is the current user then update local storage data.
        if (this.state.user._id === user._id) {
            this.setState({user});
            Auth.setUser(user);
            return;
        }
        // Update contact data.
        let contacts = this.state.contacts;
        contacts.forEach((element, index) => {
            if(element._id === user._id) {
                contacts[index] = user;
                contacts[index].status = element.status;
            }
        });
        this.setState({contacts});
        if (this.state.contact._id === user._id) this.setState({contact: user});
    };


    onTypingMessage = sender => {
        if (this.state.contact._id !== sender) return;
        this.setState({ typing: sender });
        clearTimeout(this.state.timeout);
        const timeout = setTimeout(this.typingTimeout, 3000);
        this.setState({ timeout });
    };

    typingTimeout = () => this.setState({ typing: false })

    userProfileToggle = () => this.setState({ userProfile: !this.state.userProfile });


    profileToggle = () => this.setState({ profile: !this.state.profile });

    onNewUser = user => {
        // Add user to contacts list.
        let contacts = this.state.contacts.concat(user);
        this.setState({ contacts });
    };

    sendMessage = message => {
        if (!this.state.contact._id) return;
        message.receiver = this.state.contact._id;
        let messages = this.state.messages.concat(message);
        this.setState({ messages });
        this.state.socket.emit('message', message);
    };

    onNewMessage = message => {
        if (message.sender === this.state.contact._id) {
            this.setState({ typing: false })
            this.state.socket.emit('seen', this.state.contact._id);
            message.seen = true;
        }
        if (message.sender === this.state.user._id) return;
        let messages = this.state.messages.concat(message);
        this.setState({ messages });
    }

    sendType = () => this.state.socket.emit('typing', this.state.contact._id);

    updateUsersState = users => {
        let contacts = this.state.contacts;
        contacts.forEach((element, index) => {
            if (users[element._id]) contacts[index].status = users[element._id]

        });

        this.setState({ contacts });
        let contact = this.state.contact;
        if (users[contact._id]) contact.status = users[contact._id]
        this.setState({ contact })
    }

    onChatNavigate = contact => {
        this.setState({ contact });
        this.state.socket.emit('seen', contact._id);
        let messages = this.state.messages;
        messages.forEach((element, index) => {
            if (element.sender === contact._id) messages[index].seen = true;
        })
        this.setState({ messages })
    }

    /**
     * Render chat page
     */
    render() {
        // If socket.io client not connected show loading spinner.
        if (!this.state.connected || !this.state.contacts || !this.state.messages) {
            return <Spinner id="loader" color="success" />
        }
        return (
            <Row className="h-100">
                <div id="contacts-section" className="col-6 col-md-4" >
                    <ContactHeader 
                    user={this.state.user}
                    toggle={this.profileToggle}
                    />
                    <Contacts 
                    contacts={this.state.contacts}
                    messages={this.state.messages}
                    onChatNavigate={this.onChatNavigate} />

                    <UserProfile
                        contact={this.state.contact}
                        toggle={this.userProfileToggle}
                        open={this.state.userProfile} />

                    <EditProfile
                    user={this.state.user}
                    toggle={this.profileToggle}
                    open={this.state.profile}
                    />
                </div>
                <div id="messages-section" className="col-6 col-md-8">
                    <ChatHeader
                        contact={this.state.contact}
                        typing={this.state.typing}
                        toggle={this.userProfileToggle}
                        logout={this.logout} />
                    {this.renderChat()}
                    <MessageForm sender={this.sendMessage} sendType={this.sendType} />
                </div>
            </Row>
        );
    }

    /**
     * Render messages component.
     */
    renderChat = () => {
        const { contact, user } = this.state;
        if (!contact) return;
        // Show only related messages.
        let messages = this.state.messages.filter(e => e.sender === contact._id || e.receiver === contact._id);
        return <Messages user={user} messages={messages} />
    };
};



export default Chat;