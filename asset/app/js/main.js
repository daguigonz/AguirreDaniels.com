'use strict';
 
$(document).foundation({
  offcanvas : {
    // Sets method in which offcanvas opens.
    // [ move | overlap_single | overlap ]
    open_method: 'move', 
    // Should the menu close when a menu link is clicked?
    // [ true | false ]
    close_on_click : false
  }
});

  var brick = new brickwork("#brickwork");
  brick.reset({
    selector: '.my-item-post',
    animate: true,
    cellW: 200,
    cellH: 'auto',
    onResize: function() {
      brick.fitWidth();
    }
  });
  
  var images = brick.container.find('.my-item-post');
  var length = images.length;
  images.css({visibility: 'hidden'});
  images.find('img')
  .error(function() {
    -- length;
  })
  .load(function() {
    -- length;
    if (!length) {
      setTimeout(function() {
        images.css({visibility: 'visible'});
        brick.fitWidth();
      }, 505);
    }
  });
 