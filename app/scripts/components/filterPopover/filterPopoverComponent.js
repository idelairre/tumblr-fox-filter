module.exports = (function filterPopoverComponent() {
  Tumblr.Fox = Tumblr.Fox || {};

  const $ = Backbone.$;
  const { each } = _;
  const { get, FilterMenuComponent, SearchComponent } = Tumblr.Fox;
  const transition = get('animation').transition;
  const popover = get('PopoverMixin');
  const PopoverComponent = get('PopoverComponent');
  const ClickHandler = get('ClickHandler');
  const { Tumblelog } = Tumblr.Prima.Models;
  const { currentUser } = Tumblr.Prima;

  // NOTE: teardown is not consistently resetting the original peepr-search component

  const filterPopoverTemplate = `
    <script id="filterPopoverTemplate" type="text/template">
      <div id="filterPopoverMenu" class="popover popover_menu popover_gradient" style="display: block; width: 240px; margin-top: -4px;">
        <div class="popover_inner">
          <ul class="popover_inner_list">
            <div class="filter-menu" data-subview="filterMenu"></div>
            <div data-subview="searchFilter"></div>
          </ul>
        </div>
      </div>
    </script>`;

  const FilterPopoverComponent = PopoverComponent.extend({
    className: 'popover--filter-popover',
    defaults: {
      preventInteraction: !0,
      state: {
        likes: !1,
        dashboard: !1,
        user: !0
      }
    },
    mixins: [popover],
    template: $(filterPopoverTemplate).html(),
    subviews: {
      filterMenu: {
        constructor: FilterMenuComponent
      },
      searchFilter: {
        constructor: SearchComponent,
        options: {
          blogname: currentUser().id,
          blog: Tumblelog.collection.models[0]
        }
      }
    },
    initialize(e) {
      this.options = Object.assign({}, this.defaults, e);
      this.state = this.defaults.state;
      this.listenTo(Tumblr.Events, 'fox:setSearchState', ::this.setState);
      this.listenTo(Tumblr.Events, 'fox:apiFetch:initial', ::this.hide);
      // this.listenTo(this, 'all', console.log.bind(console, '[FILTER POPOVER]'));
    },
    render() {
      this.$el.html(this.template);
      this.$pinned.addClass('active');
      this.$filterPopoverMenu = this.$('.popover_menu');
      this.$searchBar = this.$('.filter-search');
      setTimeout(() => {
        this.$filterPopoverMenu.addClass('popover--active');
        this.bindClickOutside();
      }, 1);
    },
    afterRenderSubviews() {
      setTimeout(() => {
        this.setState('user');
      }, 1);
    },
    bindClickOutside() {
      const options = {
        preventInteraction: !0,
        ignoreSelectors: ['.popover', '.popover_inner', '.popover_content_wrapper', '.popover_inner_list', '.popover_menu_list', '.tumblelog_popover', '.ui_peepr_glass', '.drawer']
      };
      this.clickOutside = new ClickHandler(this.el, options);
      this.clickOutside.on('click:outside', this.hide, this);
      this.listenTo(Tumblr.Events, 'DOMEventor:keyup:escape', this.hide);
    },
    beforeTeardown() {
      this.remove();
      this.$pinned.removeClass('active');
    },
    unbindClickOutside() {
      this.clickOutside.remove();
      this.clickOutside = null;
      this.stopListening(Tumblr.Events, 'DOMEventor:keyup:escape');
    },
    setState(state) { // NOTE: this is terrible, maybe make a mixin to manage state?
      // console.log('[SET STATE]', state);
      try {
        for (const key in this.state) {
          this.state[key] = !1;
          if (key.includes(state)) {
            this.state[key] = !0;
          }
        }
        each(this._subviews, subview => {
          // console.log('[CHANGE STATE?]', subview.state !== this.state);
          if (subview.state !== this.state) {
            subview.state = this.state;
            if (subview._subviews) {
              // console.log('[SUBVIEW]', subview);
              this.setState.call(subview, state);
            }
            if (subview.model) {
              subview.model.set('state', this.state);
            }
          }
        });
      } catch (e) {
        console.error(e);
      }
    },
    hide() {
      Tumblr.Events.trigger('popover:close', this);
      this.unbindClickOutside();
      this.searchFilter.unbindEvents();
      this.$pinned.removeClass('active');
      this.$filterPopoverMenu.removeClass('popover--active');
      transition(this.$el, ::this.afterHide);
    },
    afterHide() {
      this.$el.css({ display: 'none' });
    },
    show() {
      // console.log('[FILTER COMPONENT]', this),
      Tumblr.Events.trigger('popover:open', this);
      this.bindClickOutside();
      this.$pinned.addClass('active');
      this.$el.css({ display: 'block' });
      setTimeout(() => {
        this.$filterPopoverMenu.addClass('popover--active');
      }, 1);
    }
  });

  Tumblr.Fox.FilterPopoverComponent = FilterPopoverComponent;

  return Tumblr.Fox.FilterPopoverComponent;
});
