import React from 'react';
import ReactDOM from 'react-dom'
import videojs from 'video.js';
import document from 'global/document';
import window from 'global/window';
import EventBoxMaker from './box.js';
import EventItem from './events-item.js';

const EventBox = EventBoxMaker(EventItem);

export default function(player) {
  const events = window.MediaEvents = videojs.getTech('Html5').Events;

  ReactDOM.render(
    <EventBox name="Event" value="Times Fired" data={events} player={player}/>,
    document.querySelector('.media-events')
  );
};
