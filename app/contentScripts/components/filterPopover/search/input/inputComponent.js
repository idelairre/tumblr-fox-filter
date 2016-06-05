module.exports = (function (Tumblr, Backbone, _) {
  const { debounce, isEmpty } = _;
  const { get, TagSearchAutocompleteModel, TextSearchAutocompleteModel } = Tumblr.Fox;

  const Input = {
    tagSearchAutocompleteModel: TagSearchAutocompleteModel,
    textSearchAutocompleteModel: TextSearchAutocompleteModel,
    events: {
      'blur .blog-search-input': 'inputBlurHandler',
      'focus .blog-search-input': 'inputFocusHandler',
      'keyup .blog-search-input': 'inputKeyUpHandler',
      'keydown .blog-search-input': 'inputKeyDownHandler'
    },
    bindEvents() {
      this.listenTo(this.model, 'change:blogname', this.flushTags);
      this.listenTo(this.model, 'change:term', this.onTermChange);
      this.listenTo(this.model, 'reset', this.onModelReset);
      this.listenTo(Tumblr.Fox.state, 'change:state', ::this.updateSearchSettings);
      this.listenTo(Tumblr.Fox.searchOptions, 'change:state', ::this.delegateInputEvents);
    },
    delegateInputEvents(state) { // NOTE: turns off tag popover while backend is being sorted out
      // console.log('[DELEGATE INPUT EVENTS]', state, this);
      switch(state) {
        case 'tag':
          this.blogSearchAutocompleteHelper.delegateEvents();
          this.blogSearchAutocompleteHelper.bindEvents();
          this.blogSearchAutocompleteModel.bindEvents();
          break;
        case 'text':
          this.blogSearchAutocompleteHelper.undelegateEvents();
          this.blogSearchAutocompleteHelper.stopListening();
          this.blogSearchAutocompleteModel.stopListening();
          break;
      }
    },
    inputKeyDownHandler(e) {
      if (e.keyCode === 13) {
        this.model.set('term', this.getTerm());
        this.blogSearchAutocompleteModel.set('matchTerm', this.getTerm());
        console.log('[SEARCH ON ENTER]', this.model);
        Tumblr.Events.trigger('peeprsearch:change:term', this.model.attributes);
      }
    },
    flushTags() {
      const blogname = this.model.get('blogname');
      this.blogSearchAutocompleteHelper.model.set('blogname', blogname);
      this.blogSearchAutocompleteHelper.model.getItems();
    },
    updateSearchSettings(state) {
      // console.log(state);
      switch (state) {
        case 'dashboard':
          this.blogSearchAutocompleteHelper.model = (Tumblr.Fox.searchOptions.get('tag') ? this.tagSearchAutocompleteModel : this.textSearchAutocompleteModel);
          this.$el.find('input').attr('placeholder', `Search ${state}`);
          break;
        case 'likes':
          this.blogSearchAutocompleteHelper.model = (Tumblr.Fox.searchOptions.get('tag') ? this.tagSearchAutocompleteModel : this.textSearchAutocompleteModel);
          this.$el.find('input').attr('placeholder', `Search ${state}`);
          break;
        case 'user':
          this.blogSearchAutocompleteHelper.model = this.blogSearchAutocompleteModel;
          this.$el.find('input').attr('placeholder', `Search ${this.model.get('blogname')}`);
          break;
      }
      this.blogSearchAutocompleteHelper.model.getItems();
    },
    fetchResults(query) {
      console.log(this.conversations);
      return this.conversations.fetch({
        data: {
          q: query,
          limit: 5
        }
      });
    },
    _search(e) {
      this.fetchResults(e);
    },
    _debouncedSearch(query) {
      return debounce(this._search, 250).call(this, query);
     },
    _onTextInputChange(e) {
      this._debouncedSearch(this.$(e.target).val());
    },
    _onTextInputBlur(e) {
      this._debouncedSearch(this.$(e.target).val());
    }
  }

  Tumblr.Fox.Input = Input;
})
