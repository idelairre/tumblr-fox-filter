module.exports = (function filterMenuComponent(Tumblr, Backbone, _) {
  const { $, View } = Backbone;

  const FilterMenuComponent = View.extend({
    defaults: {
      disabled: false
    },
    className: 'popover--filter-select-dropdown',
    template: $('#filterMenuTemplate').html(),
    initialize() {
      this.state = Tumblr.Fox.state;
      this.disabled = this.defaults.disabled;
    },
    render() {
      const querySlug = {
        loggingData: {
          post_type: 'ANY'
        }
      };
      this.$el.html(this.template);
      Tumblr.Events.trigger('fox:setFilter', querySlug);
      this.resetChecks();
      this.$('i[data-check="any"]').show();
      this.rendered = true;
      this.trigger('rendered', this);
    },
    events: {
      'click [data-js-menu-item]': 'toggleSelection'
    },
    bindEvents() {
      this.listenTo(Tumblr.Events, 'peepr-open-request', this.set('disabled', true));
      this.listenTo(Tumblr.Events, 'peepr:close', this.set('disabled', false));
    },
    resetChecks() {
      this.$('i[data-check]').hide();
    },
    toggleSelection(e) { // NOTE: make sure to put this back while the states are half-functional
      e.preventDefault();
      if (this.disabled) {
        return;
      }
      const type = $(e.target).data('js-menu-item-link');
      this.resetChecks();
      this.$(`i[data-check="${type}"]`).show();
      if (this.state.get('dashboard')) {
        this.filterAndFetchPosts(type);
      } else {
        this.selectFilter(type);
      }
    },
    selectFilter(type) {
      const querySlug = {
        loggingData: {
          post_type: type.toUpperCase()
        }
      };
      Tumblr.Events.trigger('fox:setFilter', querySlug);
    },
    filterAndFetchPosts(type) {
      Tumblr.Events.trigger('fox:apiFetch:initial', type);
      Tumblr.Events.trigger('fox:autopaginator:start');
    }
  });

  Tumblr.Fox.FilterMenuComponent = FilterMenuComponent;
});
