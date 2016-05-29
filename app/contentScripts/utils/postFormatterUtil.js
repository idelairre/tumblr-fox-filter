module.exports = (function postFormatter(Tumblr, Backbone, _) {
  const $ = Backbone.$;
  const { escape, unescape } = _;

  const escapeQuotes = string => {
    return string.replace(/"/g, '\\"');
  }

  const unescapeQuotes = string => {
    return string.replace(/\\"/g, '"');
  }

  const formatType = postData => {
    if (postData.type === 'text') {
      return 'regular';
    } else if (postData.type === 'answer') {
      return 'note';
    } else if (postData.type === 'chat') {
      return 'conversation';
    } else {
      return postData.type;
    }
  }

  const formatFooter = postDiv => {
    const postFooter = postDiv.find('.post_footer');
    postFooter.addClass('clearfix').attr('data-subview', 'footer').find('.post_notes').attr('data-subview', 'notes').find('.post_notes').wrapInner('<div class="post_notes_inner"></div>');
    const postControls = postFooter.find('.post_controls');
    postControls.attr('role', 'toolbar').attr('data-subview', 'controls').wrapInner('<div class="post_controls_inner"></div>');
    postFooter.find('.note_link_current').replaceWith(function () {
      const notes = $(this);
      if (notes.data('count') !== 0) {
        return $(`<span class="note_link_current" title="${notes.attr('title')}" data-less="${notes.attr('data-less')}" data-count="${notes.attr('data-count')}" data-more="${notes.attr('data-more')}">${notes.text()}</span>`);
      } else {
        return $(`<span class="note_link_current" title="${notes.attr('title')}" data-less="${notes.attr('data-less')}" data-count="${notes.attr('data-count')}" data-more="${notes.attr('data-more')}"></span>`);
      }
    });
    const postReply = postControls.find('.reply');
    postControls.find('.reply_container').replaceWith(postReply);
  }

  const formatPostHeader = (postData, postView, postDiv) => {
    const postHeader = $(postView.$el).find('.post_header');
    postHeader.attr('class', 'post_header').wrapInner('<div class="post_info"><div class="post_info_fence"></div></div>');
    const postInfoLink = `<a class="post_info_link" href="http://${postData.blog.uuid}" data-tumblog-popover="${escape(JSON.stringify(postData.blog))}">${postData.blog.name}</a>`;
    const reblogFollowButton = postHeader.find('.reblog_follow_button').detach();
    postHeader.find('.post_info_fence').prepend(postInfoLink);
    if (postHeader.find('.reblog_info').length) {
      postHeader.find('.reblog_info').wrap('<span class="reblog_source"></span>');
      if (postInfoLink) {
        postHeader.find('.post_info_fence').addClass('has_follow_button').after(reblogFollowButton);
      }
    } else {
      postDiv.find('.post_info').append(reblogFollowButton);
    }
  }

  const createAvatar = postData => {
    const avatar =  `
      <div class="post_avatar  show_user_menu">
        <div class="post_avatar_wrapper">
          <a class="post_avatar_link"
            href="${postData.blog.url}"
            target="_blank"
            title="${postData.blog.title}"
            id="post_avatar${postData.id}"
            style="background-image:url('${postData.blog.avatar[1].url}')"
            data-user-avatar-url="${postData.blog.avatar[1].url}"
            data-avatar-url="${postData.blog.avatar[1].url}"
            data-blog-url="${postData.blog.url}"
            data-tumblelog-name="${postData.blog.name}"
            data-use-channel-avatar="1"
            data-use-sub-avatar=""></a>
        </div>
      </div>`;
      return avatar;
  }

  const createPostWrapper = postData => {
    // NOTE: pt is probably premium_tracked, don't need to set that
    const wrapper = `
      <div id="post_${postData.id}" class="post post_full with_permalink pt reblog_ui_refresh is_${postData.type}
        ${Tumblr.Prima.currentUser().attributes.name === postData.blog.name ? 'is_mine' : 'not_mine'}
        ${postData.reblogged_from_id ? 'is_reblog' : 'is_original'}
        ${postData.source_title ? 'has_source' : 'no_source'}
        ${postData.post_html.includes('View On') ? 'app_source' : 'generic_source'}
        ${postData.notes.count === 0 ? 'no_notes' : ''}"
        ${postData.can_reply ? 'data-can_reply="1"' : ''}
        data-id="${postData.id}"
        data-type="${postData.type}"
        data-reblog_source="POST_CONTEXT_UNKOWN"
        data-reblog_key="${postData.reblog_key}"
        data-reblog-key="${postData.reblog_key}"
        data-root_id="${postData.root_id}"
        data-tumblelog="${postData.blog.name}"
        data-is-reblog="${postData.reblogged_from_id ? 1 : 0}"
        data-tumblog-key="${postData.blog.key}">`;
      return wrapper;
  }

  const PostFormatter = {
    formatDashboardPost(postData) {
      postData.type = formatType(postData);
      postData.share_popover_data.show_reporting_link = false;
      const postAvatar = createAvatar(postData);
      const postWrapper = createPostWrapper(postData);
      const postModel = new Tumblr.Prima.Models.Post(postData);
      const postView = new Tumblr.IndashBlog.PostView({
        model: postModel
      });
      postView.render();

      const postDiv = $(postView.$el).find('.post_chrome');
      postDiv.attr('class', 'post_wrapper').removeAttr('data-post-id').find('.post_content').wrapInner('<div class="post_content_inner clearfix"></div>').addClass('clearfix');

      if (postData.type === 'note') {
        const askButton = `<a class="post_tag ask post_ask_me_link" href="http://${postData.blog.name}.tumblr.com/ask" data-tumblelog-name="${postData.blog.name}">Ask ${postData.blog.name} a question</a>`;
        if (!postDiv.find('.post_tags_inner').length && postDiv.find('.note_wrapper').length < 2) {
          postDiv.find('.post_content').after(`<div class="post_tags"><div class="post_tags_inner">${askButton}</div></div>`);
        } else {
          postDiv.find('.post_tags_inner').prepend(askButton);
        }
      }

      formatPostHeader(postData, postView, postDiv);
      formatFooter(postDiv);

      const postElement = $(`${postWrapper}${postAvatar}${postView.$el.html()}</div>`).attr('data-json', JSON.stringify(postData));
      const postContainer = $(`<li class="post_container" data-pageable="post_${postModel.id}"></li>`).append(postElement);
      postView.remove();
      return { postContainer, postElement, postModel };
    },
    renderPostFromHtml(post) {
      if (typeof $.parseHTML(post.html) !== 'undefined') {
        const escapedHtml = unescapeQuotes(unescapeQuotes(post.html)); // NOTE: make it so you don't have to run this twice
        const postElement = $($.parseHTML(escapedHtml));
        const postModel = new Tumblr.Prima.Models.Post($(postElement).data('json'));
        const postContainer = $(`<li class="post_container" data-pageable="post_${postModel.get('id')}"></li>`).append(postElement);
        Tumblr.Fox.constants.attachNode.before(postContainer);
        Tumblr.Fox.Utils.PostFormatter.createPostView(postElement, postModel);
        Tumblr.Posts.add(postModel);
      }
    },
    createPostView(postElement, postModel) {
      const postView = new Tumblr.PostView({
        el: postElement,
        model: postModel
      });
      postElement.attr('data-likeable-view-exists', true);
      if (postView.$el.find('.reblog-list').length) {
        postView.$reblog_list = postView.$el.find('.reblog-list');
      }
      Tumblr.postsView.postViews.push(postView);
      Tumblr.Events.trigger('postsView:createPost', postView);
      Tumblr.Events.trigger('DOMEventor:updateRect');
    },
    renderPosts(response) {
      if (!response) {
        return;
      }
      const posts = response.posts || response;
      for (let i = 0; posts.length > i; i += 1) { // NOTE: posts do not come out in order due to different formatting times
        Tumblr.Fox.Utils.PostFormatter.renderPost(posts[i]);
      }
    },
    renderPost(post) {
      const { postContainer, postElement, postModel } = Tumblr.Fox.Utils.PostFormatter.formatDashboardPost(post);
      Tumblr.Fox.constants.attachNode.before(postContainer);
      Tumblr.Fox.Utils.PostFormatter.createPostView(postElement, postModel);
      Tumblr.Posts.add(postModel);
    }
  }

  Tumblr.Fox.Utils.PostFormatter = PostFormatter;
});