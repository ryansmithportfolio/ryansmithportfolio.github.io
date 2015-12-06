$(document).ready(function() {
  
  new WOW().init();

  $('.bxslider').bxSlider({
    mode: 'fade',
    captions: true
  });


  $('.open').on('click', function(event){
    $(this).addClass('opened');
    event.stopPropagation();
  })
  $('body').on('click', function(event) {
    $('.open').removeClass('opened');
  })
  $('.cls').on('click', function(event){
    $('.open').removeClass('opened');
    event.stopPropagation();
  });

})
  





