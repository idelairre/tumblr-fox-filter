import View from '../view/view';
import template from 'lodash.template';
import authenticationTemplate from './authentication.html';

const Authentication = View.extend({
  defaults: {
    props: {
      consumerKey: '',
      consumerSecret: '',
      userName: '',
      defaultKeys: true,
      setUser: false
    }
  },
  template: template(authenticationTemplate),
  className: 'authentication options',
  tagName: 'section',
  render() {
    this.$el.html(this.template(this.props.attributes));
  }
});

export default Authentication;
