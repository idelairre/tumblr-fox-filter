module.exports = {
  initialize() {
    this.bindEvents();
  },
  camelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) {
        return '';
      } // or if (/\s+/.test(match)) for white spaces
      return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
  },
  listenTo(eventName, callback) {
    let eventSlug = this.camelCase(eventName.split(':').splice(1).join(' '));
    window.addEventListener(eventName, e => {
      let req = {};
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
    let req;
    if (payload) {
      req = new CustomEvent(eventName, {
        detail: payload
      });
    } else {
      req = new Event(eventName);
    }
    window.dispatchEvent(req);
  },
  bindEvents() {
    // NOTE: maybe wrap the callback in the trigger and automatically create and remove the listener?
    // this way the api will resemble a normal request
    this.listenTo('chrome:fetch:posts', response => {
      console.log(response);
      this.trigger('chrome:response:posts', response);
    });
    this.listenTo('chrome:fetch:blogPosts', response => {
      console.log(response);
      this.trigger('chrome:response:posts', response);
    });
    this.listenTo('chrome:fetch:likes', response => {
      console.log(response);
      this.trigger('chrome:response:posts', response);
    });
    this.listenTo('chrome:search:likes', response => {
      console.log(response);
      this.trigger('chrome:response:likes', response);
    });
    this.listenTo('chrome:fetch:followers', response => {
      console.log('[RESPONSE]', response);
      this.trigger('chrome:response:followers', response);
    });
    window.addEventListener('chrome:fetch:tags', () => {
      this.fetchLikeTags(tags => {
        this.trigger('chrome:response:tags', tags);
      });
    });
    this.listenTo('chrome:update:likes');
  },
  fetchLikeTags(callback) {
    chrome.storage.local.get({ tags: [] }, items => {
      callback(items.tags);
    });
  }
}
