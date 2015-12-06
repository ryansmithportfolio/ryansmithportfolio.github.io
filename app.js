$(document).ready(function() {
  
  new WOW().init();

  $('.bxslider').bxSlider({
    mode: 'fade',
    // adaptiveHeight: true,
    // slideWidth: '500',
    captions: true
  });

  // $('.open').on('click', function() {
  //   // var el = document.getElementsByClassName('open');
  //   // el.className = el.className + ' opened';
  //   $('.open').addClass('opened');
  //   console.log('clicked on open')
  //   // console.log('clicked')
  // });

  // $('body').on('click', function() {
  //   $('.open').removeClass('opened');
  // });

  // $('.cls').on('click', function() {
  //   $('.open').removeClass('opened');
  // });

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
  





