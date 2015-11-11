
/* The data represents each section of the page, with different priorities
given to more important sections (priorities will help determine node radius size
later) */
var d3data = {
      title: 'javascript',
      priority: 6,
      img: './assets/background2.jpg',
      children: [
      {
        title: 'D3',
        img: './assets/background2.jpg',
        priority: 20,
        children: [
          {
            title: 'bootstrap',
            img: './assets/background2.jpg',
            priority: 15,
          }
        ]
      },
        {
          title: 'node',
          img: './assets/background2.jpg',
          priority: 20,
          children: [
            {
              title: 'about',
              img: './assets/background2.jpg',
              priority: 2,
              click: true,
            }
          ]
        },
        {
          title: 'express',
          img: './assets/background2.jpg',
          priority: 20,
          children: [
            {
              title: 'gulp',
              img: './assets/background2.jpg',
              priority: 15,
            }
          ]
        },
        {
          title: 'mysql',
          img: './assets/background2.jpg',
          priority: 20,
          children: [
            {
              title: 'react',
              img: './assets/background2.jpg',
              priority: 15,
            }
          ]
        },
        {
          title: 'angular',
          img: './assets/background2.jpg',
          priority: 20,
          children: [
            {
              title: 'contact',
              img: './assets/background2.jpg',
              priority: 1.4,
              click: true,
            }
          ]
        },
        {
          title: 'css',
          img: './assets/background2.jpg',
          priority: 20,
          children: [
            {
              title: 'html5',
              img: './assets/background2.jpg',
              priority: 15,
            }
          ]
        },
        {
          title: 'mongoDB',
          img: './assets/background2.jpg',
          priority: 20,
          children: [
            {
              title: 'mocha',
              img: './assets/background2.jpg',
              priority: 15,
            }
          ]
        },
        {
          title: 'git',
          img: './assets/background2.jpg',
          priority: 20,
          children: [
            {
              title: 'projects',
              img: './assets/background2.jpg',
              priority: 1.2,
              click: true,
            }
          ]
        },
        {
          title: 'socket.io',
          img: './assets/background2.jpg',
          priority: 20,
          children: [
            {
              title: 'jquery',
              img: './assets/background2.jpg',
              priority: 15,
            }
          ]
        },
      ]
};

var root = d3data;
var width = window.innerWidth;
var height = window.innerHeight;

var centerX = width/2.8;
var centerY = height/2.5;

var rotation = -270;

var update = function(root, rotation) {

  d3.select('svg').remove();

  var cluster = d3.layout.cluster()
    .size([width/(width/250), height/(height/250)])
    // .sort(null)

  var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x/180 * Math.PI]; })

  var svg = d3.select('#d3chart').append('svg:svg')
    .attr({
      width: width,
      height: height
    })
    .append('svg:g')
      .attr('transform', 'translate(' + centerX + ',' + centerY + ')')

  svg.append('svg:path')
    .attr('class', 'arc')
    .attr('d', d3.svg.arc()
      .innerRadius(centerY)
      .outerRadius(centerY + 1)
      .startAngle(0)
      .endAngle(2 * Math.PI)
      )

  var defs = svg.append('svg:defs');
  var nodes = cluster.nodes(d3data);
  var link = svg.selectAll('path.link')
    .data(cluster.links(nodes))
    .enter().append('svg:path')
    .transition()
    .duration(2000)
    .attr({
      class: 'link',
      d: diagonal,
    })


  var node = svg.selectAll('g.node')
    .data(nodes)
    .enter().append('svg:g')
    .attr({
      class: 'node',
      // transform: function(d) { return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')'; }
    })

  node.append('svg:circle')
    .attr('r', function(d) { return 1e-6; })

  var nodeUpdate = node.transition()
    .duration(2500)
    .delay(500)
    .attr('transform', function(d) { return 'rotate(' + (d.x - rotation) + ')translate(' + (d.y + 20) + ')'; })
    .select('circle')
    .attr('r', function(d) { 
      if (d._children) { return 200; }
      return 100/d.priority; 
    })
    .style('fill', function(d) {
      defs.append('svg:pattern')
        .attr('id', 'tile-img' + d.title)
        .attr('width', '20')
        .attr('height', '20')
        .append('svg:image')
        .attr('xlink:href', function() {
          if (d.img) { return d.img; }
        })
        .attr({
          x: -20,
          y: -50,
          width: 300,
          height: 300,
        })
        return 'url(#tile-img' + d.title + ')'
    })

    node.append('text')
      .attr({
        class: 'text',
        class: 'nodeText'
      })
      .attr({
        x: function(d) { 
          return -20 
        },
        y: function(d) { return + (100/d.priority) + 20 }, 
        stroke: 'white',
        opacity: function(d) { if (!d.click) return 0; },
        strokeWidth: '2px',
        transform: function(d) {
          if (d.click) return 'rotate(' + (-d.x + rotation) + ')'
        }
      })
      .text(function(d) { return d.title })

    /* Assign mouse events. I was experimenting with drawing lines on mouseover to
    a description of the section. Work in progress. */
    svg.selectAll('.node')
      .on('mouseover', function(d) {
        d3.select(this)
          .transition()
          .duration(400)
          .attr('opacity', 0.6)
        d3.select(this).select('text')
          .transition()
          .duration(400)
          .attr('stroke', 'white')
          .attr('opacity', 1)
      })
      .on('mouseout', function(d) {
        d3.selectAll('path').remove();
        d3.select(this)
          .transition()
          .duration(400)
          .attr('opacity', 1)
        d3.select(this).select('text')
          .transition()
          .duration(400)
          .attr('stroke', 'teal')
      })
      /* A click event will bring the user to the appropriate section on the page. */
      .on('click', function(d) {
        if (d.click) {
          element = document.getElementById(d.title)
          alignWithTop = true;
          element.scrollIntoView(alignWithTop);
        } else {
          toggle(d);
        }
      })

  // var nodeExit = node.exit().transition()
  //   .duration(500)
  //   .attr('transform', function(d) {
  //     return 'translate(' + d.parent.y + ',' + d.parent.x + ')';
  //   })
}

update(root, rotation);

function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  }
  if (d._children) {
    d.children = d._children;
    d._children = null;
  }
  rotation = rotation - 90
  update(root, rotation);
}

