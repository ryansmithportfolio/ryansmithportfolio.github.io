/* The data represents each section of the page, with different priorities
given to more important sections (priorities will help determine node radius size
later) */
var d3data = {
      title: 'projection1',
      priority: 10,
      img: 'https://www.ibiblio.org/wm/paint/auth/kandinsky/kandinsky.comp-8.jpg',
      children: [
        {
          title: 'about',
          img: './assets/background2.jpg',
          priority: 2,
        },
        {
          title: 'contact',
          img: './assets/background2.jpg',
          priority: 1.5,
        },
        {
          title: 'projects',
          img: './assets/background2.jpg',
          priority: 1,
        },
      ]
};

/* To make the canvas responsive, the browser window's inner width and height will
determine the canvas's width and height, respectively. */
var width = window.innerWidth;
var height = window.innerHeight;

/* The pack layout will provide us with appropriately sized and place bubble nodes. */
var bubble = d3.layout.pack()
  .sort(null)
  .size([width/1.2, height])

var svg = d3.select('#d3bubbleChart').append('svg')
  .attr({
    height: height,
    width: width,
    class: 'bubble'
  })

update(d3data);

function update(data) {
  var defs = svg.append('svg:defs');

  /* Define nodes */
  var node = svg.selectAll('.node')
    .data(bubble.nodes(classes(d3data))
      .filter(function(d) { return !d.children; }))
    .enter().append('g')
    .attr({
      class: 'node',
      transform: function(d) { return 'translate(' + d.x + ',' + d.y + ')'; }
    })

  /* Append nodes as circles filled with an image (SVG's use defs and patterns to 
    incorporate images in the canvas) */
  node.append('circle')
    .attr('r', function(d) { return 120/d.value; })
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
          x: 0,
          y: -50,
          width: 400,
          height: 400,
        })
        return 'url(#tile-img' + d.title + ')'
    })

  /* Assign mouse events. I was experimenting with drawing lines on mouseover to
  a description of the section. Work in progress. */
  svg.selectAll('.node')
    .on('mouseover', function(d) {
      // var lineMovement = [
      //   { 'x' : d.x, 'y' : d.y }, 
      //   { 'x' : d.x + 100, 'y' : d.y - (150/d.value) - 10 }, 
      //   // { 'x' : d.x + 250, 'y' : d.y - (150/d.value) - 10 }
      // ]
      // var line = d3.svg.line()
      //   .x(function(d) { return d.x})
      //   .y(function(d) { return d.y})
      //   .interpolate('linear')
      // svg.append('path')
      //   .transition()
      //   .duration(500)
      //   // .delay(200)
      //   .attr('d', line(lineMovement))
      //   .attr('stroke', 'white')
      //   .attr('stroke-width', 2)
      //   .style('stroke-dasharray', ('3, 3'))
      // // d3.select(this).select('circle')
      // var lineMovement = [
      //   // { 'x' : d.x, 'y' : d.y }, 
      //   { 'x' : d.x + 100, 'y' : d.y - (150/d.value) - 10 }, 
      //   { 'x' : d.x + 250, 'y' : d.y - (150/d.value) - 10 }
      // ]
      // var line = d3.svg.line()
      //   .x(function(d) { return d.x})
      //   .y(function(d) { return d.y})
      //   .interpolate('linear')
      // svg.append('path')
      //   .transition()
      //   .duration(500)
      //   // .delay(200)
      //   .attr('d', line(lineMovement))
      //   .attr('stroke', 'white')
      //   .attr('stroke-width', 2)
      //   .style('stroke-dasharray', ('3, 3'))
      //   .style({
      //     'stroke': 'steelblue',
      //     'stroke-width': '2px',
      //   })
      d3.select(this)
        .transition()
        .duration(400)
        .attr('opacity', 0.6)
      d3.select(this).select('text')
        .transition()
        .duration(400)
        .attr('stroke', 'white')
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
      element = document.getElementById(d.title)
      alignWithTop = true;
      element.scrollIntoView(alignWithTop);
    })
    
  /* Append the title of each node underneath the node itself. */
  node.append('text')
    .attr({
      class: 'text',
      class: 'nodeText'
    })
    .attr({
      x: function(d) { return -20 },
      y: function(d) { return + (150/d.value) + 20 }, 
      stroke: 'teal',
    })
    .text(function(d) { return d.title })
}

/* This recursive function finds all nodes and child nodes and puts them
into an array that the nodes use as their data sources. */
function classes(root) {
  var classes = [];
  function recurse(name, node) {
    if (node.children) { 
      node.children.forEach(function(child) { 
        recurse(node.title, child);
      }
    )} else {
        classes.push({
          title: node.title, 
          url: node.url,
          description: node.description,
          img: node.img, 
          value: node.priority,
      })
    }
  }
  recurse (null, root);
  return {children: classes};
}










