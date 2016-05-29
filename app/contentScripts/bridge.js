/* global chrome:true */
/* global window:true */
/* global CustomEvent:true */
/* global Event:true */
/* eslint no-undef: "error" */

import { camelCase } from 'lodash';

const Bridge = {
  initialize() {
    this.bindEvents();
  },
  listenTo(eventName, callback) {
    console.log('[BRIDGE LISTEN]', eventName);
    const eventSlug = camelCase(eventName.split(':').splice(1).join(' '));
    window.addEventListener(eventName, e => {
      const req = {};
      if (e.detail) {
        req.payload = e.detail;
      }
      req.type = eventSlug;
      chrome.runtime.sendMessage(req, response => {
        return callback ? callback(response) : null;
      });
    });
  },
  trigger(eventName, payload) {
    // console.log('[EVENT NAME]: ', eventName, '[PAYLOAD]: ', payload);
    let req = {};
    if (typeof payload !== 'undefined') {
      req = new CustomEvent(eventName, {
        detail: payload
      });
    } else {
      req = new Event(eventName);
    }
    window.dispatchEvent(req);
  },
  bindEvents() {
    // NOTE: the trigger event must resemble the list to event! eg. chrome:search:likesByTag MUST have the response chrome:response:likesByTag
    // find a way to automatically generate these events
    this.listenTo('chrome:fetch:posts', response => {
      this.trigger('chrome:response:posts', response);
    });
    this.listenTo('chrome:fetch:likes', response => {
      this.trigger('chrome:response:posts', response);
    });
    this.listenTo('chrome:search:likesByTag', response => {
      this.trigger('chrome:response:likesByTag', response);
    });
    this.listenTo('chrome:search:likesByTerm', response => {
      this.trigger('chrome:response:likesByTerm', response);
    });
    this.listenTo('chrome:fetch:following', response => {
      this.trigger('chrome:response:following', response);
    });
    this.listenTo('chrome:fetch:tags', response => {
      this.trigger('chrome:response:tags', response);
    });
    this.listenTo('chrome:fetch:constants', response => {
      this.trigger('chrome:response:constants', response);
    });
    this.listenTo('chrome:fetch:keys', response => {
      this.trigger('chrome:response:keys', response);
    });
    this.listenTo('chrome:refresh:following');
    this.listenTo('chrome:update:following');
    this.listenTo('chrome:update:likes');
    this.listenTo('chrome:sync:likes');
    this.listenTo('chrome:initialize');
    this.listenTo('chrome:search:setBlog');
  }
}

export default Bridge;