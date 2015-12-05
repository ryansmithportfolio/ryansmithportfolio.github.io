$(document).ready(function() {
  
  new WOW().init();

  $('.bxslider').bxSlider({
    mode: 'fade',
    // adaptiveHeight: true,
    // slideWidth: '500',
    captions: true
  });

  $('.img-thumbnail').hover(function() {
    $(this).css('opacity', 0.4);
  }, function() {
    $(this).css('opacity', 1);
  });


})
  





