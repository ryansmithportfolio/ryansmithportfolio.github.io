particlesJS.load('particles-js', './assets/particles.json', function () {
  console.log('callback - particles.js config loaded');
});

$(document).ready(function () {
  // Initialize modal
  const projectModal = new ProjectModal();

  /*Initialize WoW.js, allowing for smooth element transition 
  effects when added to the class of that element*/
  new WOW().init();

  /* When a link is clicked, a smooth scroll to a particular element (param 1)
  will take place with a specified duration (param 2) */
  var smoothScrollTo = function (elem, duration) {
    $('html, body').animate(
      {
        scrollTop: $(elem).offset().top,
      },
      duration
    );
  };

  /* Define link classes as well as destination element and duration of smooth scroll */
  $('.link-welcome').on('click', function () {
    smoothScrollTo('body', 500);
  });

  $('.link-portfolio, #down-to-projects').on('click', function () {
    smoothScrollTo('#content', 500);
  });

  // Handle project image clicks
  $('.project').on('click', '.project-main-image', function () {
    const project = $(this).closest('.project');
    const slides = [];

    // Get all slides from the project's hidden slides container
    project.find('.project-slides .slide').each(function () {
      const slide = $(this);
      slides.push({
        image: slide.data('image'),
        title: slide.data('title'),
      });
    });

    // Open modal with project data
    projectModal.open({
      title: project.find('.project-title').text(),
      description: project.find('.project-description').text(),
      slides: slides,
    });
  });

  // $('.link-contact').on('click', function() {
  //   smoothScrollTo('#about', 1000);
  // });

  /* Activate the slider used to showcase individual projects */
  $('.bxslider').bxSlider({
    mode: 'fade',
    captions: true,
  });

  /* Defines classes of nav-bar elements during click events */
  $('.open').on('click', function (event) {
    $(this).addClass('opened');
    event.stopPropagation();
  });
  $('body').on('click', function (event) {
    $('.open').removeClass('opened');
  });
  $('.cls').on('click', function (event) {
    $('.open').removeClass('opened');
    event.stopPropagation();
  });
});
