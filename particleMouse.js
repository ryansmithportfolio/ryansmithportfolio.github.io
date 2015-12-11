var width = Math.max(960, innerWidth),
    height = Math.max(500, innerHeight);

var i = 0;

var svg = d3.select("#effect").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .on("ontouchstart" in document ? "touchmove" : "mousemove", particle);

function particle() {
  var m = d3.mouse(this);

  svg.insert("circle", "rect")
      .attr("cx", m[0])
      .attr("cy", m[1])
      .attr("r", 1e-6)
      .style("stroke", d3.hsl((i = (i + 1) % 360), 1, .5))
      .style("stroke-opacity", 1)
    .transition()
      .duration(4000)
      .ease('quad')
      .attr("r", 100)
      .style("stroke-opacity", 1e-6)
      .remove();

  d3.event.preventDefault();
}

// var nodes = [
//   {
//     id: 'a',
//     title: 'about',
//     priority: 2,
//   },
//   {
//     id: 'b',
//     title: 'projects',
//     priority: 1,
//   },
//   {
//     id: 'c',
//     title: 'contact',
//     priority: 2,
//   },
// ]

var links = [
  {source: 'about', target: 'projects'}, 
  {source: 'projects', target: 'contact'}, 
  {source: 'contact', target: 'about'},
  // {source: 'blog', target: 'about'},
  // {source: 'blog', target: 'contact'},
  // {source: 'blog', target: 'projects'},
  // {source: 'skills', target: 'about'},
  // {source: 'skills', target: 'contact'},
  // {source: 'skills', target: 'projects'},
  // {source: 'skills', target: 'blog'},
  // {source: 'interests', target: 'about'},
  // {source: 'interests', target: 'contact'},
  // {source: 'interests', target: 'projects'},
  // {source: 'interests', target: 'blog'},
  // {source: 'interests', target: 'skills'},
  // {source: 'interests', target: 'about'},
  // {source: 'interests', target: 'contact'},
  // {source: 'interests', target: 'projects'},
  // {source: 'interests', target: 'blog'},
  // {source: 'interests', target: 'skills'}
  ]

// var links = [
//   {source: "Microsoft", target: "Amazon", type: "licensing"},
//   {source: "Microsoft", target: "HTC", type: "licensing"},
//   {source: "Samsung", target: "Apple", type: "suit"},
//   {source: "Motorola", target: "Apple", type: "suit"},
//   {source: "Nokia", target: "Apple", type: "resolved"},
//   {source: "HTC", target: "Apple", type: "suit"},
//   {source: "Kodak", target: "Apple", type: "suit"},
//   {source: "Microsoft", target: "Barnes & Noble", type: "suit"},
//   {source: "Microsoft", target: "Foxconn", type: "suit"},
//   {source: "Oracle", target: "Google", type: "suit"},
//   {source: "Apple", target: "HTC", type: "suit"},
//   {source: "Microsoft", target: "Inventec", type: "suit"},
//   {source: "Samsung", target: "Kodak", type: "resolved"},
//   {source: "LG", target: "Kodak", type: "resolved"},
//   {source: "RIM", target: "Kodak", type: "suit"},
//   {source: "Sony", target: "LG", type: "suit"},
//   {source: "Kodak", target: "LG", type: "resolved"},
//   {source: "Apple", target: "Nokia", type: "resolved"},
//   {source: "Qualcomm", target: "Nokia", type: "resolved"},
//   {source: "Apple", target: "Motorola", type: "suit"},
//   {source: "Microsoft", target: "Motorola", type: "suit"},
//   {source: "Motorola", target: "Microsoft", type: "suit"},
//   {source: "Huawei", target: "ZTE", type: "suit"},
//   {source: "Ericsson", target: "ZTE", type: "suit"},
//   {source: "Kodak", target: "Samsung", type: "resolved"},
//   {source: "Apple", target: "Samsung", type: "suit"},
//   {source: "Kodak", target: "RIM", type: "suit"},
//   {source: "Nokia", target: "Qualcomm", type: "suit"}
// ];

var nodes = {};

// Compute the distinct nodes from the links.
links.forEach(function(link) {
  link.source = nodes[link.source] || (nodes[link.source] = {title: link.source});
  link.target = nodes[link.target] || (nodes[link.target] = {title: link.target});
});

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(300)
    .charge(-1)
    .on("tick", tick)
    .start();

var defs = svg.append('svg:defs');
// var nodes = svg.append("g")
//      .attr("class", "nodes")
//      .selectAll("circle")
//      .data(dataset)
//      .enter()
//      // Add one g element for each data node here.
//      .append("g")
//      // Position the g element like the circle element used to be.
//      .attr("transform", function(d, i) {
//        // Set d.x and d.y here so that other elements can use it. d is 
//        // expected to be an object here.
//        d.x = i * 150 + 100,
//        d.y = 200 + 100*d.priority;
//        return "translate(" + d.x + "," + d.y + ")"; 
//      })
     // .call(force.drag)

 // Add a circle element to the previously added g element.
 // nodes.append("circle")
 //       .attr("class", "node")
 //       .attr("r", function(d) {
 //        return 80/d.priority;
 //       })
 //       // .style('fill', 'rgba(30,30,30,0.8)')
 //       // .style('fill', function(d) {
 //       //    defs.append('svg:pattern')
 //       //   .attr('id', 'tile-img' + d.title)
 //       //   .attr('width', '20')
 //       //   .attr('height', '20')
 //       //   .append('svg:image')
 //       //   .attr('xlink:href', './assets/background2.jpg')
 //       //   .attr({
 //       //     x: -100,
 //       //     y: -100,
 //       //     width: 300,
 //       //     height: 300,
 //       //   })
 //       //   return 'url(#tile-img' + d.title + ')'
 //       // })
 //      .style('fill', d3.hsl((i = (i + 1) % 360), 1, .5))

 // // Add a text element to the previously added g element.
 // nodes.append("text")
 //      .attr("text-anchor", "middle")
 //      .style('fill', 'white')
 //      .text(function(d) {
 //        return d.title;
 //       });

/* Assign mouse events. I was experimenting with drawing lines on mouseover to
a description of the section. Work in progress. */
// svg.selectAll('.node')
//   .on('mouseover', function(d) {
//     d3.select(this)
//       .transition()
//       .duration(400)
//       .attr('opacity', 0.6)
//     // d3.select(this).select('text')
//     //   .transition()
//     //   .duration(400)
//     //   .attr('stroke', 'white')
//     //   .attr('opacity', 1)
//   })
//   .on('mouseout', function(d) {
//     d3.selectAll('path').remove();
//     d3.select(this)
//       .transition()
//       .duration(400)
//       .attr('opacity', 1)
//     d3.select(this).select('text')
//       .transition()
//       .duration(400)
//       .attr('stroke', 'teal')
//   })
//   /* A click event will bring the user to the appropriate section on the page. */
//   .on('click', function(d) {
//       $('html, body').animate({
//         scrollTop: $('#' + d.title).offset().top
//       }, 2000);
//   })
var link = svg.selectAll(".link")
    .data(force.links())
  .enter().append("line")
    .attr("class", "link");

var node = svg.selectAll(".node")
    .data(force.nodes())
  .enter().append("g")
    .attr("class", "node")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .call(force.drag);

node.append("circle")
    .attr("r", function(d) {
        if (d.title === 'projects' || d.title === 'about' || d.title === 'contact') return 40;
        return 10;
    })
    .style('fill', 'lightsteelblue')
    // .style('fill', function(d) {
    //   defs.append('svg:pattern')
    //     .attr('id', 'tile-img')
    //     .attr('width', '20')
    //     .attr('height', '20')
    //     .append('svg:image')
    //     .attr('xlink:href', './assets/background2.jpg')
    //     .attr({
    //       x: -100,
    //       y: -100,
    //       width: 300,
    //       height: 300,
    //     })
    //     return 'url(#tile-img)'
    // })

node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .attr('text-anchor', 'middle')
    .text(function(d) { 
      if (d.title === 'projects' || d.title === 'about' || d.title === 'contact') return d.title;
    });

  function tick() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  }

  function mouseover() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", function(d) {
          if (d.title === 'projects' || d.title === 'about' || d.title === 'contact') return 90;
          return 50;
        });
  }

  function mouseout() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", function(d) {
          if (d.title === 'projects' || d.title === 'about' || d.title === 'contact') return 80;
          return 40;
        });
  }





