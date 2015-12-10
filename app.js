$(document).ready(function() {
  
  new WOW().init();

  $('.link-portfolio').on('click', function() {
    smoothScrollTo('#projects');
  });

  $('.link-contact').on('click', function() {
    smoothScrollTo('#about');
  });

  $('.bxslider').bxSlider({
    mode: 'fade',
    captions: true
  });

  particlesJS.load('particles-js', './assets/particles.json', function() {
    console.log('callback - particles.js config loaded');
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
  
var smoothScrollTo = function(elem) {
  $('html, body').animate({
    scrollTop: $(elem).offset().top
  }, 1000);
};




