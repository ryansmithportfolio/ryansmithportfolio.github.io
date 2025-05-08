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

  // Function to open project modal
  function openProjectModal(projectId) {
    const project = $(`#${projectId}`);
    if (project.length) {
      const slides = [];
      project.find('.project-slides .slide').each(function () {
        const slide = $(this);
        const videoElem = slide.find('video');
        if (videoElem.length) {
          slides.push({
            video: videoElem.prop('outerHTML'),
            title: slide.data('title') || '',
          });
        } else {
          slides.push({
            image: slide.data('image'),
            title: slide.data('title'),
          });
        }
      });

      // Get project links if they exist
      const links = project.find('.project-links').html();

      projectModal.open({
        title: project.find('.project-title').text(),
        description: project.find('.project-description').text(),
        links: links,
        slides: slides,
      });

      // Scroll to the project
      smoothScrollTo(project, 500);
    }
  }

  // Check URL hash on page load
  const hash = window.location.hash.substring(1);
  if (hash) {
    openProjectModal(hash);
  }

  // Handle project image clicks
  $('.project').on('click', '.project-main-image', function () {
    const project = $(this).closest('.project');
    const projectId = project.attr('id');

    // Update URL without page reload
    history.pushState(null, '', `#${projectId}`);

    const slides = [];
    project.find('.project-slides .slide').each(function () {
      const slide = $(this);
      const videoElem = slide.find('video');
      if (videoElem.length) {
        slides.push({
          video: videoElem.prop('outerHTML'),
          title: slide.data('title') || '',
        });
      } else {
        slides.push({
          image: slide.data('image'),
          title: slide.data('title'),
        });
      }
    });

    // Get project links if they exist
    const links = project.find('.project-links').html();

    projectModal.open({
      title: project.find('.project-title').text(),
      description: project.find('.project-description').text(),
      links: links,
      slides: slides,
    });
  });

  // Handle hash changes
  $(window).on('hashchange', function () {
    const hash = window.location.hash.substring(1);
    if (hash) {
      openProjectModal(hash);
    } else {
      projectModal.close();
    }
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

  // Trifecta landing page video hover logic
  const trifectaContainer = document.querySelector(
    '#trifecta .project-main-image-container'
  );
  if (trifectaContainer) {
    const img = trifectaContainer.querySelector('.project-main-image');
    const video = trifectaContainer.querySelector(
      '.project-main-video-preview'
    );
    let videoStarted = false;

    trifectaContainer.addEventListener('mouseenter', () => {
      if (img) img.style.opacity = '0';
      if (video) {
        video.style.opacity = '1';
        if (!videoStarted) {
          video.currentTime = 0;
          videoStarted = true;
        }
        video.play();
      }
    });
    trifectaContainer.addEventListener('mouseleave', () => {
      if (img) img.style.opacity = '1';
      if (video) {
        video.pause();
        video.style.opacity = '0';
      }
    });
  }
});
