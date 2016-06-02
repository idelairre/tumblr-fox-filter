/* global Blob:true */
/* global chrome:true */
/* global document:true */
/* global FileReader:true */
/* global URL:true */
/* eslint no-undef: "error" */

import $ from 'jquery';
import Backbone from 'backbone';
import { camelCase, capitalize } from 'lodash';
import Authentication from './authentication/authentication';
import Buttons from './buttons/buttons';
import Cache from './cache/cache';
import Debug from './debug/debug';
import Experimental from './experimental/experimental';
import ProgressBar from './progressBar/progressBar';
import Settings from './settings/settings';
import View from './view/view';
import events from './events';
import Modal from './modal/modal';
import './tipped.less';
import './options.less';

const Options = Backbone.View.extend({
  defaults: {
    initialized: false
  },
  subviews: {
    authentication: {
      constructor: Authentication
    },
    buttons: {
      constructor: Buttons
    },
    cache: {
      constructor: Cache
    },
    debug: {
      constructor: Debug
    },
    experimental: {
      constructor: Experimental
    },
    progressBar: {
      constructor: ProgressBar
    },
    settings: {
      constructor: Settings
    }
  },
  initialize() {
    // TODO: bind defaults
    this.props = new Backbone.Model();
    this.bindEvents();
    this.initializePort();
  },
  initializePort() {
    this.port = chrome.runtime.connect({
      name: 'options'
    });
    this.port.postMessage({
      type: 'fetchConstants'
    });
    this.port.onMessage.addListener(events);
  },
  renderSubviews() {
    this._subviews = Array.prototype.slice.call(this.$('[data-subview]'));
    this._subviews.map(el => {
      const subviewName = $(el).data('subview');
      const subview = new this.subviews[subviewName].constructor();
      const view = new subview.constructor(this.props.attributes);
      view.render();
      this.$(`[data-subview="${subviewName}"]`).replaceWith(view.$el);
      return view;
    });
    this.initialized = true;
  },
  bindEvents() {
    this.listenTo(Backbone.Events, 'INITIALIZED', ::this.restoreOptions);
    this.listenTo(Backbone.Events, 'CHANGE_PROPS', ::this.setProps);
    this.listenTo(Backbone.Events, 'CACHE_LIKES', ::this.postMessage);
    this.listenTo(Backbone.Events, 'CACHE_FOLLOWING', ::this.postMessage);
    this.listenTo(Backbone.Events, 'DOWNLOAD_CACHE', ::this.postMessage);
    this.listenTo(Backbone.Events, 'RESTORE_CACHE', ::this.postMessage);
    this.listenTo(Backbone.Events, 'RESET_CACHE', ::this.postMessage);
    this.listenTo(Backbone.Events, 'SAVE_CACHE', ::this.postMessage);
    this.listenTo(Backbone.Events, 'SHOW_ERROR', ::this.showError);
    this.listenTo(Backbone.Events, 'DONE', ::this.showDone);
  },
  showError(response) {
    this.$errorModal = new Modal({
      parent: $('.container'),
      header: `${capitalize(response.type)}`,
      message: `${response.payload.message}`
    });
    this.$errorModal.render();
    this.$el.append(this.$errorModal.$el);
  },
  showDone(response) {
    console.log(response);
    this.$doneModal = new Modal({
      parent: $('.container'),
      header: 'Done',
      message: `${response.payload.message}`
    });
    Backbone.Events.trigger('CHANGE_PROPS', response.payload.constants);
    this.$doneModal.render();
    this.$el.append(this.$doneModal.$el);
  },
  setCacheLikesButton() {
    this.$('button#cacheLikes').prop('disabled', !this.props.get('canFetchApiLikes') && !this.props.get('clientCaching'));
  },
  setProps(newProps) {
    this.postMessage({
      type: 'updateSettings',
      payload: newProps
    });
  },
  postMessage(slug) { // signature: action: {String}, payload: {Object}
    this.port.postMessage(slug);
  },
  restoreOptions(response) {
    const { payload } = response;
    this.props.set(payload);
    console.log('[CONTROLLER INITIALIZED]', this.initialized);
    if (!this.initialized) {
      console.log('[RENDERING SUBVIEWS...]');
      this.renderSubviews();
    }
  }
});

new Options({
  el: $('.container')
});
