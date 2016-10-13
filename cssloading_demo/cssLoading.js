/*
 *  CSS3 Loading indicator.
 *    
 *    Usage:
 *      jQueryElement.cssLoading('show');
 *      jQueryElement.cssLoading('show', 'small');
 *      jQueryElement.cssLoading('show', 'large');
 *      jQueryElement.cssLoading('hide');
 *      jQueryElement.cssLoading('showMask'); // without loading animation
 *      jQueryElement.cssLoading('hideMask'); 
 * 
 *    Caution:
 *      jQueryElement's position property of style is set 'relative'.
 *    
 *    refer to
 *      http://www.alessioatzeni.com/wp-content/tutorials/html-css/CSS3-loading-animation-loop/index.html
*/
'use strict';
(function($) {
  var methods = {
    init: function($el, size) {
      $el.css('position', 'relative');
      var d = {
        $loading: $("<div/>").addClass('cssloading').appendTo($el),
        $mask: $("<div/>").addClass('cssloading_mask').appendTo($el)
      };
      
      if (size) {
        if (size.toLowerCase() === 'small') {
          d.$loading.addClass('cssloading_small')
        } else if (size.toLowerCase() === 'large') {
          d.$loading.addClass('cssloading_large')
        }
      }
      
      $el.data('cssLoading', d);
      
      return $el;
    },
    show: function(size) {
      var d = this.data('cssLoading');
      if (!d) {
        methods.init(this, size);
        d = this.data('cssLoading');
      }
      if (d) {
        d.$loading.show();
        d.$mask.show();
      }
      return this;
    },
    hide: function() {
      var d = this.data('cssLoading');
      if (!d) {
        var $el = methods.init(this);
        d = $el.data('cssLoading');
      }
      if (d) {
        d.$loading.hide();
        d.$mask.hide();
      }
      return this;
    },
    showMask: function() {
      var d = this.data('cssLoading');
      if (!d) {
        methods.init(this);
        d = this.data('cssLoading');
      }
      if (d) {
        d.$loading.hide();
        d.$mask.show();
      }
      return this;
    },
    hideMask: function() {
      var d = this.data('cssLoading');
      if (!d) {
        var $el = methods.init(this);
        d = $el.data('cssLoading');
      }
      if (d) {
        d.$loading.hide();
        d.$mask.hide();
      }
      return this;
    },
  };
  
  $.fn.cssLoading = function(method, size) {
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments ); // Default to "init"
    } else {
      $.error( 'Method ' +  method + ' does not exist. ');
    }
  };
})(jQuery);
