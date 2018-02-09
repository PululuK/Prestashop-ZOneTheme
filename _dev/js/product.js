import $ from 'jquery';

$(document).ready(function () {
  createProductSpin();
  createInputFile();
  zoomImage();
  lightboxImage();
  coverImage();
  imageScrollBox();
  moveProductAttributes();
  addAccordionActiveClass();

  $('body').on('click', '.product-refresh', function (event, extraParameters) {
    if (typeof extraParameters === 'undefined' || extraParameters.eventType != 'updatedProductQuantity') {
      togglePendingRefreshIcon('in');
    }    
  });

  prestashop.on('updatedProduct', function (event) {
    createInputFile();
    zoomImage();
    coverImage();
    imageScrollBox();
    moveProductAttributes();

    if (event && event.product_minimal_quantity) {
      const minimalProductQuantity = parseInt(event.product_minimal_quantity, 10);
      const quantityInputSelector = '#quantity_wanted';
      let quantityInput = $(quantityInputSelector);

      quantityInput.trigger('touchspin.updatesettings', {min: minimalProductQuantity});
    }
    
    $('#js_mfp_gallery').replaceWith(event.product_images_modal);
    lightboxImage();
    togglePendingRefreshIcon('out');
  });

  $('body.js-custom-action-add-to-cart').off('click', '[data-button-action="add-to-cart"]');
  $('body.js-custom-action-add-to-cart').on('click', '[data-button-action="add-to-cart"]', function (event) {
    event.preventDefault();
    var $btn = $(this);

    if ($('#quantity_wanted').val() > $('[data-stock]').data('stock') && $('[data-allow-oosp]').data('allow-oosp').length === 0) {
      $btn.attr('disabled', 'disabled');
    } else {
      var _ret = (function () {
        var $form = $(event.target).closest('form');
        var query = $form.serialize() + '&add=1&action=update';
        var actionURL = $form.attr('action');

        var isQuantityInputValid = function isQuantityInputValid($input) {
          var validInput = true;

          $input.each(function (index, input) {
            var $input = $(input);
            var minimalValue = parseInt($input.attr('min'), 10);
            if (minimalValue && $input.val() < minimalValue) {
              onInvalidQuantity($input);
              validInput = false;
            }
          });

          return validInput;
        };

        var onInvalidQuantity = function onInvalidQuantity($input) {
          $input.parents('.product-add-to-cart').first().find('.product-minimal-quantity').addClass('error');
          $input.parent().find('label').addClass('error');
        };

        var $quantityInput = $form.find('input[min]');
        if (!isQuantityInputValid($quantityInput)) {
          onInvalidQuantity($quantityInput);

          return {
            v: undefined
          };
        }

        $btn.removeClass('added').addClass('disabled');

        $.post(actionURL, query, null, 'json').then(function (resp) {
          prestashop.emit('updateCart', {
            reason: {
              idProduct: resp.id_product,
              idProductAttribute: resp.id_product_attribute,
              linkAction: 'add-to-cart',
              cart: resp.cart
            },
            resp: resp
          });

          if (resp.success) {
            $btn.addClass('added');
          }
          if (resp.hasError) {
            $('.js-modal-message-text').text(resp.errors[0]);
            $('.js-modal-message').modal('show');
          }
        }).fail(function (resp) {
          prestashop.emit('handleError', { eventType: 'addProductToCart', resp: resp });
        });
      })();

      if (typeof _ret === 'object') return _ret.v;
    }
  });
});
$(window).resize(function() {
  showHideScrollBoxArrows();
});

function togglePendingRefreshIcon(fade_status) {
  if (fade_status == 'in') {
    $('body.js-enable-product-pending-refresh-icon .js-product-refresh-pending-query').fadeIn();
  } else {
    $('body.js-enable-product-pending-refresh-icon .js-product-refresh-pending-query').fadeOut();
  }
}

function zoomImage() {
  $('.zoomWrapper .js-main-zoom').unwrap();
  $('.zoomContainer').remove();

  $('.js-enable-zoom-image .js-main-zoom').elevateZoom({
    zoomType: 'inner',
    gallery: 'js-zoom-gallery',
    galleryActiveClass: 'selected',
    imageCrossfade: true,
    cursor: 'crosshair',
    easing: true,
    easingDuration: 500,
    zoomWindowFadeIn: 500,
    zoomWindowFadeOut: 300,
  });
}

function lightboxImage() {
  var $gallery = $('#js_mfp_gallery');
  if ($gallery.length) {
    var zClose = $gallery.data('text-close'),
        zPrev = $gallery.data('text-prev'),
        zNext = $gallery.data('text-next');

    $('.js_mfp_gallery_item').magnificPopup({
      type: 'image',
      tClose: zClose,
      tLoading: '<div class="uil-spin-css"><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div>',
      removalDelay: 500,
      mainClass: 'mfp-fade',
      closeOnBgClick: true,
      gallery: {
        enabled: true,
        tPrev: zPrev,
        tNext: zNext,
        tCounter: '%curr% / %total%',
      },
      image: {
        verticalFit: false,
      }
    });

    $('.js-mfp-button').bind('click', function() {
      var imageId = $('#js-zoom-gallery .js-thumb.selected').data('id-image');
      $('.js_mfp_gallery_item').filter('[data-id-image="' + imageId + '"]').trigger('click');
    });
  }
}

function coverImage() {
  $('.js-cover-image .js-qv-product-images .js-thumb').on(
    'click',
    (event) => {
      $('.js-qv-product-images .js-thumb.selected').removeClass('selected');
      $(event.currentTarget).addClass('selected');
      $('.js-qv-product-cover').prop('src', $(event.currentTarget).data('image'));
    }
  );
}

function imageScrollBox() {
  $('.js-qv-mask').addClass('scroll');
  $('.js-qv-mask').scrollbox({
    direction: 'h',
    distance: 'auto',
    autoPlay: false,
    infiniteLoop: false,
    onMouseOverPause: false,
  });
  $('.scroll-box-arrows .left').click(function () {
    $('.js-qv-mask').trigger('backward');
  });
  $('.scroll-box-arrows .right').click(function () {
    $('.js-qv-mask').trigger('forward');
  });

  showHideScrollBoxArrows();
}
function showHideScrollBoxArrows() {
  var thumbsWidth = 0;
  $('.js-qv-product-images .js-thumb-container').each(function() {
    thumbsWidth = thumbsWidth + $(this).outerWidth();
  });

  if (($('.js-qv-product-images').width() + 5) < thumbsWidth) {
    $('.scroll-box-arrows').addClass('scroll');
  } else {
    $('.scroll-box-arrows').removeClass('scroll');
  }
}

function createInputFile()
{
  $('.js-file-input').on('change', (event) => {
    let target, file;

    if ((target = $(event.currentTarget)[0]) && (file = target.files[0])) {
      $(target).prev().text(file.name);
    }
  });
}

function createProductSpin() {
  let quantityInput = $('#quantity_wanted');
  quantityInput.TouchSpin({
    verticalbuttons: true,
    verticalupclass: 'material-icons touchspin-up',
    verticaldownclass: 'material-icons touchspin-down',
    buttondown_class: 'btn btn-touchspin js-touchspin',
    buttonup_class: 'btn btn-touchspin js-touchspin',
    min: parseInt(quantityInput.attr('min'), 10),
    max: 1000000
  });

  var quantity = quantityInput.val();
  quantityInput.on('keyup change', function (event) {
    const newQuantity = $(this).val();
    if (newQuantity !== quantity) {
      quantity = newQuantity;
      let $productRefresh = $('.product-refresh');
      $(event.currentTarget).trigger('touchspin.stopspin');
      $productRefresh.trigger('click', {eventType: 'updatedProductQuantity'});
    }
    event.preventDefault();

    return false;
  });
}

function moveProductAttributes() {
  var $src = $('.js-product-attributes-source'),
      $dest = $('.js-product-attributes-destination'),
      $src2 = $('.js-product-availability-source'),
      $dest2 = $('.js-product-availability-destination');
  if ($src.length) {
    $dest.html($src.html());
    $src.remove();
  } else {
    $dest.empty();
  }
  if ($src2.length) {
    $dest2.html($src2.html());
    $src2.remove();
  } else {
    $dest2.empty();
  }
}

function addAccordionActiveClass() {
  $('.js-product-accordions [data-toggle="collapse"]').click(function() {
    $(this).closest('.panel').toggleClass('active');
  });
}
