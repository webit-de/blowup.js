/**
 * blowup.js
 * Paul Krishnamurthy 2016
 *
 * https://paulkr.com
 * paul@paulkr.com
 */

$(function ($) {
  $.fn.blowup = function (attributes) {
    var $element = this;
    var element = $element.get(0);
    var lens;
    var $parent;

    // Default attributes
    var defaults = {
      round      : true,
      width      : 200,
      height     : 200,
      background : "#FFF",
      shadow     : "0 8px 17px 0 rgba(0, 0, 0, 0.2)",
      border     : "6px solid #FFF",
      cursor     : true,
      zIndex     : 999999,
      scale      : 1,
      lens_src   : $element.attr("src"),
      append_to  : 'body'
    };

    // Update defaults with custom attributes
    var $options = $.extend(defaults, attributes);

    // If the target element is not an image
    if (!$element.is("img")) {
      console.log("%c Blowup.js Error: " + "%cTarget element is not an image.",
        "background: #FCEBB6; color: #F07818; font-size: 17px; font-weight: bold;",
        "background: #FCEBB6; color: #F07818; font-size: 17px;");
      return;
    }

    // Constants
    var $IMAGE_URL    = $options.lens_src;
    var NATIVE_IMG    = new Image();
    NATIVE_IMG.src    = $IMAGE_URL;

    $parent = $($options.append_to);

    function setupLens() {
      // Modify target image
      // $element.on('dragstart', function (e) { e.preventDefault(); });
      $element.css("cursor", $options.cursor ? "crosshair" : "none");

      // Create magnification lens element
      lens = document.createElement("div");
      lens.id = "BlowupLens";

      // Attach the element to the specified parent element
      $parent.append(lens);

      // Updates styles
      $blowupLens = $(lens);

      $blowupLens.css({
        "zIndex"            : $options.zIndex,
        "width"             : $options.width,
        "height"            : $options.height,
        "border"            : $options.border,
        "background"        : $options.background,
        "border-radius"     : $options.round ? "50%" : "none",
        "box-shadow"        : $options.shadow,
      });
    }

    function bindEvents() {
      // Suppress context menu on long tab
      $element.on('contextmenu', function (event) {
        event.preventDefault();
        event.stopPropagation();
      });

      // Show magnification lens
      $element.on('mouseenter touchstart', function (event) {
        showLense(event);
      });

      // Hide magnification lens
      $element.on('mouseleave touchend', function () {
        hideLense();
      });

      $element.on('mousemove touchmove', function (event) {
        event.preventDefault();
        if (mouseOverImage(event)) { // needed for touch to prevent endless lens dragging outside of the element
          moveLense(event);
        }
      });
    }

    function showLense(event) {
      event.preventDefault();
      moveLense(event);
      $blowupLens.css({
        "display": "block"
      });

      $parent.data('old-overflow-x', $parent.css('overflow-x')).css('overflow-x', 'hidden');
    }

    function hideLense() {
      $blowupLens.css({
        "display": "none"
      });

      $parent.css('overflow-x', $parent.data('old-overflow-x'));
    }

    function moveLense(event) {
      var mouse_position = getMousePosition(event);

      // Lens position coordinates
      var lensX = mouse_position.x - $options.width / 2;
      var lensY = mouse_position.y - $options.height / 2;

      // Relative coordinates of image
      var relX = mouse_position.x - $element.offset().left;
      var relY = mouse_position.y - $element.offset().top;

      // Zoomed image coordinates
      var zoomX = -Math.floor(relX / $element.width() * (NATIVE_IMG.width * $options.scale) - $options.width / 2);
      var zoomY = -Math.floor(relY / $element.height() * (NATIVE_IMG.height * $options.scale) - $options.height / 2);

      var backPos = zoomX + "px " + zoomY + "px";
      var backgroundSize = NATIVE_IMG.width * $options.scale + "px " + NATIVE_IMG.height * $options.scale + "px";

      // Apply styles to lens
      $blowupLens.css({
        left                  : lensX,
        top                   : lensY,
        "background-image"    : "url(" + $IMAGE_URL + ")",
        "background-size"     : backgroundSize,
        "background-position" : backPos
      });
    }

    function getMousePosition(event) {
      var mouse_position = {};
      var is_touch = false;

      switch (event.originalEvent.type) {
        case 'touchmove':
        case 'touchstart':
          is_touch = true;
          break;
      }

      if (is_touch) {
        mouse_position.x = event.originalEvent.changedTouches[0].pageX;
        mouse_position.y = event.originalEvent.changedTouches[0].pageY;
      } else {
        mouse_position.x = event.pageX;
        mouse_position.y = event.pageY;
      }

      return mouse_position;
    }

    function getElementPosition(element, relative_to) {
      var x = 0;
      var y = 0;

      while (element != relative_to && element !== null) {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
      }

      return {
        x : x,
        y : y
      };
    }

    function mouseOverImage(event) {
      var mouse_over_image = false;

      var mouse_position = getMousePosition(event);
      var element_position = getElementPosition(element);

      var element_min_x = element_position.x;
      var element_max_x = element_min_x + element.offsetWidth;
      var element_min_y = element_position.y;
      var element_max_y = element_min_y + element.offsetHeight;

      if (
        (mouse_position.x >= element_min_x && mouse_position.x <= element_max_x) && // horizzontal
        (mouse_position.y >= element_min_y && mouse_position.y <= element_max_y) // vertical
      ) {
        mouse_over_image = true;
      }

      return mouse_over_image;
    }

    setupLens();
    bindEvents();

    return $element;
  };
});
