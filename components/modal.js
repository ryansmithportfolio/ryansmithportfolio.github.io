class ProjectModal {
  constructor() {
    this.createModalElement();
    this.bindEvents();
  }

  createModalElement() {
    const modalHtml = `
      <div id="project-modal" class="modal">
        <div class="modal-content">
          <span class="modal-close">&times;</span>
          <h3 class="modal-title"></h3>
          <div class="modal-description"></div>
          <div class="modal-carousel"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    this.modal = document.getElementById('project-modal');
    this.modalTitle = this.modal.querySelector('.modal-title');
    this.modalDescription = this.modal.querySelector('.modal-description');
    this.modalCarousel = this.modal.querySelector('.modal-carousel');
    this.closeBtn = this.modal.querySelector('.modal-close');
  }

  bindEvents() {
    this.closeBtn.onclick = () => this.close();
    window.onclick = (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    };

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display === 'block') {
        this.close();
      }
    });
  }

  open(projectData) {
    this.modalTitle.textContent = projectData.title;
    this.modalDescription.textContent = projectData.description;

    // Create carousel
    const carouselId = 'projectCarousel';
    const carousel = document.createElement('div');
    carousel.id = carouselId;
    carousel.className = 'carousel slide';
    carousel.setAttribute('data-bs-ride', 'false');

    // Create carousel indicators
    const indicators = document.createElement('div');
    indicators.className = 'carousel-indicators';

    // Create carousel inner for slides
    const inner = document.createElement('div');
    inner.className = 'carousel-inner';

    // Add slides
    projectData.slides.forEach((slide, index) => {
      // Add indicator button
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-bs-target', `#${carouselId}`);
      button.setAttribute('data-bs-slide-to', index.toString());
      if (index === 0) button.className = 'active';
      indicators.appendChild(button);

      // Add slide
      const slideDiv = document.createElement('div');
      slideDiv.className = `carousel-item ${index === 0 ? 'active' : ''}`;

      // Add image
      const img = document.createElement('img');
      img.src = slide.image;
      img.className = 'd-block w-100';
      slideDiv.appendChild(img);

      // Add caption if exists
      if (slide.title) {
        const caption = document.createElement('div');
        caption.className = 'image-caption';
        caption.textContent = slide.title;
        slideDiv.appendChild(caption);
      }

      inner.appendChild(slideDiv);
    });

    // Add navigation controls
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-control-prev';
    prevButton.type = 'button';
    prevButton.setAttribute('data-bs-target', `#${carouselId}`);
    prevButton.setAttribute('data-bs-slide', 'prev');
    prevButton.innerHTML = `
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    `;

    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-control-next';
    nextButton.type = 'button';
    nextButton.setAttribute('data-bs-target', `#${carouselId}`);
    nextButton.setAttribute('data-bs-slide', 'next');
    nextButton.innerHTML = `
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    `;

    // Assemble carousel
    carousel.appendChild(indicators);
    carousel.appendChild(inner);
    carousel.appendChild(prevButton);
    carousel.appendChild(nextButton);

    // Add to modal
    this.modalCarousel.innerHTML = '';
    this.modalCarousel.appendChild(carousel);

    // Show modal with animation
    this.modal.style.display = 'block';
    requestAnimationFrame(() => {
      this.modal.classList.add('show');
    });

    document.body.style.overflow = 'hidden'; // Prevent body scrolling

    // Initialize Bootstrap carousel
    new bootstrap.Carousel(carousel, {
      interval: false, // Don't auto-advance
      keyboard: true, // Allow keyboard navigation
      touch: true, // Allow swipe on touch devices
    });
  }

  close() {
    this.modal.classList.remove('show');
    setTimeout(() => {
      this.modal.style.display = 'none';
      document.body.style.overflow = ''; // Restore body scrolling
    }, 300); // Match animation duration
  }
}

// Initialize for use in main app
window.ProjectModal = ProjectModal;
