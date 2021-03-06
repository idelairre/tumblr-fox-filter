import $ from 'jquery';
import { template, invoke, noop } from 'lodash';
import { View } from 'backbone';
import constants from '../../application/constants';
import testTemplate from './testTemplate.html';
import '../../tests/jasmine/jasmine.css';

const Test = View.extend({
  template: template(testTemplate),
  tagName: 'li',
  className: 'post_container test_container',
  events: {
    'click [data-post-action="remove"]': 'dismiss'
  },
  initialize() {
    this.initialized = false;
  },
  render() {
    this.$el.html(this.template);
    this.$el.attr('data-pageable', 'post_0');
    $('.post_container').first().after(this.$el);
    this.initialized = true;
    Tumblr.Events.off();
    this.removePosts().then(() => {
      const testsReady = new Event('testsReady');
      window.dispatchEvent(testsReady);
      return this;
    });
  },
  removePosts() {
    const deferred = $.Deferred();
    Tumblr.AutoPaginator.stop();
    $('li[data-pageable]').not('.test_container').fadeOut(300).promise().then(() => {
      invoke(Tumblr.Posts, 'remove');
      Tumblr.postsView.collection.reset();
      $('li[data-pageable]').not('.test_container').remove();
      $('.standalone-ad-container').remove();
      deferred.resolve();
    });
    return deferred.promise();
  },
  dismiss() {
    this.$el.fadeOut(300).promise().then(this.remove);
  }
});

module.exports = Test;
