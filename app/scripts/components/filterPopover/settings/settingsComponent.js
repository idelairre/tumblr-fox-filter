module.exports = (function settings() {
  Tumblr.Fox = Tumblr.Fox || {};

  const $ = Backbone.$;
  const { defer } = _;
  const { get, SettingsPopoverComponent, Popover } = Tumblr.Fox;
  const PopoverComponent = get('PopoverComponent');
  const SearchFilters = get('SearchFilters');

  const settingsPopoverTemplate = `
    <script id="settingsPopoverTemplate" type="text/template">
      <i class="icon_search toggle-search nav_icon"></i>
    </script>`;

  let Settings = PopoverComponent.extend({
    className: 'search-settings',
    defaults: {
      state: {
        likes: !1,
        dashboard: !1,
        user: !0
      }
    },
    popoverOptions: [{
      listItems: [
        { icon: 'none', name: 'Search likes', checked: false },
        { icon: 'none', name: 'Search by user', checked: true },
        { icon: 'none', name: 'Search dashboard', checked: false }
      ]
    }],
    template: $(settingsPopoverTemplate).html(),
    initialize(e) {
      return this.options = Object.assign(e, {});
    },
    render() {
      return this.$el.html(this.template);
    },
    events: {
      'click .toggle-search': 'togglePopover'
    },
    togglePopover() {
      this.popover || (this.popover = new Popover({
        pinnedTarget: this.$el,
        pinnedSide: 'bottom',
        class: 'popover--settings-popover',
        selection: 'checkmark',
        multipleSelection: false,
        items: this.popoverOptions,
        onSelect: this.onSelect
      }),
      this.popover.render(),
      this.listenTo(this.popover, 'close', this.onPopoverClose));
    },
    hidePopover() {
      this.popover && this.popover.hide();
    },
    onPopoverClose() {
      defer(() => {
        this.popover = null;
      });
    },
    onSelect(setting) {
      setting = setting.split(' ');
      setting = setting[setting.length - 1];
      if (this.initialized) {
        Tumblr.Fox.Posts.set('tagSearch', setting);
        Tumblr.Events.trigger('fox:setSearchState', setting);
      }
    }
  });

  Tumblr.Fox.Settings = Settings;

  return Tumblr;
});
