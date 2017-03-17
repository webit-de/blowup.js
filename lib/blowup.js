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
    var $html = $("html");
    var $body = $html.find("body");

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
      lens_src   : $element.attr("src")
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

    /**
     * Generates element that will work as the lens and appends it to the body element.
     * @function setupLens
     * @private
     */
    function setupLens() {
      // Modify target image
      // $element.on('dragstart', function (e) { e.preventDefault(); });
      $element.css("cursor", $options.cursor ? "crosshair" : "none");

      // Create magnification lens element
      lens = document.createElement("div");
      lens.id = "BlowupLens";

      // Attack the element to the body
      $body.append(lens);

      // Updates styles
      $blowupLens = $("#BlowupLens");

      $blowupLens.css({
        "position"          : "absolute",
        "pointer-events"    : "none",
        "zIndex"            : $options.zIndex,
        "width"             : $options.width,
        "height"            : $options.height,
        "border"            : $options.border,
        "background"        : $options.background,
        "border-radius"     : $options.round ? "50%" : "none",
        "box-shadow"        : $options.shadow,
        "background-repeat" : "no-repeat",
        "display"           : "none"
      });
    }

    /**
     * Binds all events to jQuery DOM objects.
     * @function bindEvents
     * @private
     */
    function bindEvents() {
      // Suppress context menu on long tab
      $element.on('contextmenu', function (event) {
        event.preventDefault();
        event.stopPropagation();
      });

      // Show magnification lens
      $element.on('mouseenter touchstart', function (event) {
        showLens(event);
      });

      // Hide magnification lens
      $element.on('mouseleave touchend', function () {
        hideLens();
      });

      $element.on('mousemove touchmove', function (event) {
        event.preventDefault();
        if (mouseOverImage(event)) { // needed for touch to prevent endless lens dragging outside of the element
          moveLense(event);
        }
      });
    }

    /**
     * Moves the lens to the ncurrent event position and shows it. Also hides body overflow
     * @function showLens
     * @private
     * @param {object} event - default JavaScript event object
     */
    function showLens(event) {
      event.preventDefault();
      moveLense(event);
      $blowupLens.css({
        "display": "block"
      });

      $body.data('old-overflow-x', $body.css('overflow-x')).css('overflow-x', 'hidden');
    }

    /**
     * Hides the lens and removes overflow: hidden from body
     * @function hideLens
     * @private
     * @param {object} event - default JavaScript event object
     */
    function hideLens() {
      $blowupLens.css({
        "display": "none"
      });

      $body.css('overflow-x', $body.data('old-overflow-x'));
    }

    /**
     * Moves the lens to the ncurrent event position
     * @function moveLens
     * @private
     * @param {object} event - default JavaScript event object
     */
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

    /**
     * Determines current mouse or touch position
     * @function getMousePosition
     * @private
     * @param {object} event - default JavaScript event object
     * @returns {object} - .x and .y for coordinates of touch or mouse event in pixel
     */
    function getMousePosition(event) {
      var x = 0;
      var y = 0;
      var is_touch = false;

      switch (event.originalEvent.type) {
        case 'touchmove':
        case 'touchstart':
          is_touch = true;
          break;
      }

      if (is_touch) {
        x = event.originalEvent.changedTouches[0].pageX;
        y = event.originalEvent.changedTouches[0].pageY;
      } else {
        x = event.pageX;
        y = event.pageY;
      }

      return {
        x : x,
        y : y
      };
    }

    /**
     * Determines the position of the provides element
     * @function getElementPosition
     * @private
     * @param {object} element - html node of the element whose position should be apportieren
     * @param {object} relative_to - [optional] html node of the position should be determined to relatively
     * @returns {object} - .x and .y for coordinates of provided element
     */
    function getElementPosition(element, relative_to) {
      var x = 0;
      var y = 0;

      while (element != relative_to) {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
      }

      return {
        x : x,
        y : y
      };
    }

    /**
     * Determines if mouse or touch happens over our main element
     * @function mouseOverImage
     * @private
     * @param {object} event - default JavaScript event object
     * @returns {bool} - true or false depending on if the mouse/touch happened over the element
     */
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
