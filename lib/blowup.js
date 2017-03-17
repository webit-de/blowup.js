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
    var lens;
    var $body = $("body");

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
    var $IMAGE_WIDTH  = $element.width();
    var $IMAGE_HEIGHT = $element.height();
    var NATIVE_IMG    = new Image();
    NATIVE_IMG.src    = $element.attr("src");

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
        "visibility"        : "hidden",
        "pointer-events"    : "none",
        "zIndex"            : $options.zIndex,
        "width"             : $options.width,
        "height"            : $options.height,
        "border"            : $options.border,
        "background"        : $options.background,
        "border-radius"     : $options.round ? "50%" : "none",
        "box-shadow"        : $options.shadow,
        "background-repeat" : "no-repeat",
      });
    }

    function bindEvents() {
      // Suppress context mnu on long tab
      $element.on('contextmenu', function (event) {
        event.preventDefault();
        event.stopPropagation();
      });

      // Show magnification lens
      $element.on('mouseenter touchstart', function (event) {
        event.preventDefault();
        moveLense(event);
        $blowupLens.css("visibility", "visible");
      });

      // Hide magnification lens
      $element.on('mouseleave touchend', function () {
        $blowupLens.css("visibility", "hidden");
      });

      $element.on('mousemove touchmove', function (event) {
        event.preventDefault();
        moveLense(event);
      });
    }

    function moveLense(event) {
      var page_position = getPagePosition(event);
      // Lens position coordinates
      var lensX = page_position.x - $options.width / 2;
      var lensY = page_position.y - $options.height / 2;

      // Relative coordinates of image
      var relX = page_position.x - $element.offset().left;
      var relY = page_position.y - $element.offset().top;

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

    function getPagePosition(event) {
      var page_position = {};
      var is_touch = false;

      switch (event.originalEvent.type) {
        case 'touchmove':
        case 'touchstart':
          is_touch = true;
          break;
      }

      if (is_touch) {
        page_position.x = event.originalEvent.changedTouches[0].pageX;
        page_position.y = event.originalEvent.changedTouches[0].pageY;
      } else {
        page_position.x = event.pageX;
        page_position.y = event.pageY;
      }

      return page_position;
    }

    setupLens();
    bindEvents();

    return $element;
  };
});
