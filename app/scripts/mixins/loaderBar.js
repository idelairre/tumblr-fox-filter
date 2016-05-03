module.exports = (function loaderMixin() {
  Tumblr.Fox = Tumblr.Fox || {};

  const $ = Backbone.$;
  const { get } = Tumblr.Fox;
  const Mixin = get('mixin');
  const Loader = get('Loader');

  let loader = new Mixin({
    toggleLoader(e) {
      // console.log('[TOGGLE LOADER]', e);
      e === !0 ? this.loader ? this.loader.set('loading', !0) : this.loader = new Loader({ // I hate this
          $container: this.$el,
          type: 'bar',
          classModifiers: 'top',
          loading: !0
      }) : this.loader.set('loading', !1)
    }
  })

  Tumblr.Fox.loaderMixin = loader;

  return Tumblr;
})