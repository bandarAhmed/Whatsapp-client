import React from "react";
import Avatar from "../Avatar";
import moment from 'moment';
import { Badge } from "reactstrap";
/**
 * Contact Item.
 */
const Contact = props => (
    <div className="contact">
        <div onClick={props.toggle}>
            <Avatar scr={props.contact.avatar} />

        </div>
    <div>
        {props.contact.status === true ? <i className='fa fa-circle online' /> : ''}
    </div>

    <div className="w-50">
        <div className="name">{props.contact.name}</div>
        <div className="small last-message">
            {props.message ? props.message.content : 'انقر هنا لبدء المحادثة' }
        </div>
    </div>
    <div className="flex-grow-1 text-left">
        <div className="small text-muted">
            {props.message ? moment(props.message.date).format("hh:mm a") : ''}
        </div>
        { props.unseen > 0 ? <Badge color="success">{props.unseen}</Badge> : ''}
    </div>
</div>
);

export default Contact;