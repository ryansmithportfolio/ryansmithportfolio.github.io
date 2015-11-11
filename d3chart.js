// var d3data = {
//       title: 'projection1',
//       priority: 10,
//       img: './assets/wheel',
//       children: [
//         {
//           title: 'immedia',
//           url: 'https://www.immedia.xyz',
//           description: 'your real-time encyclopedia',
//           priority: 1,
//         },
//         {
//           title: 'koupler',
//           url: 'https://www.immedia.xyz',
//           description: 'a meeting site for couples', 
//           priority: 1.5,
//         },
//         {
//           title: 'deep space',
//           url: 'https://mtcrushmore.github.io',
//           description: 'solar system creator', 
//           priority: 2.5,
//         },
//         {
//           title: 'fudwize',
//           url: 'https://fudwize.herokuapp.xyz',
//           description: 'connecting foodbanks and restaurants', 
//           priority: 1.5,
//         },
//         {
//           title: 'gram',
//           url: 'https://github.com/mtcrushmore/gram',
//           description: 'real-time whiteboard and chat', 
//           priority: 2.5,
//         },
//       ]
// };

/* The data represents each section of the page, with different priorities
given to more important sections (priorities will help determine node radius size
later) */
var d3data = {
      title: 'projection1',
      priority: 6,
      img: './assets/background2.jpg',
      children: [
        {
          title: 'about',
          img: './assets/background2.jpg',
          priority: 10,
          children: [
            {
              title: 'about',
              img: './assets/background2.jpg',
              priority: 2,
            }
          ]
        },
        {
          title: 'contact',
          img: './assets/background2.jpg',
          priority: 10,
          children: [
            {
              title: 'contact',
              img: './assets/background2.jpg',
              priority: 1.4,
            }
          ]
        },
        {
          title: 'projects',
          img: './assets/background2.jpg',
          priority: 10,
          children: [
            {
              title: 'projects',
              img: './assets/background2.jpg',
              priority: 1.2,
            }
          ]
        },
        // {
        //   title: 'blog',
        //   img: './assets/background2.jpg',
        //   priority: 10,
        //   children: [
        //     {
        //       title: 'blog',
        //       img: './assets/background2.jpg',
        //       priority: 1.5,
        //     }
        //   ]
        // },
        // {
        //   title: 'blog',
        //   img: './assets/background2.jpg',
        //   priority: 10,
        //   children: [
        //     {
        //       title: 'blog',
        //       img: './assets/background2.jpg',
        //       priority: 1.5,
        //     }
        //   ]
        // },
        // {
        //   title: 'blog',
        //   img: './assets/background2.jpg',
        //   priority: 10,
        //   children: [
        //     {
        //       title: 'blog',
        //       img: './assets/background2.jpg',
        //       priority: 1.5,
        //     }
        //   ]
        // },
      ]
};

var root = d3data;
var width = window.innerWidth;
var height = window.innerHeight;

var centerX = width/2;
var centerY = height/3;

var rotation = 180;

var update = function(root, rotation) {

  d3.select('svg').remove();

  var cluster = d3.layout.cluster()
    .size([width/4, height/3])
    // .sort(null)

  var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x/rotation * Math.PI]; })

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
      .outerRadius(centerY)
      .startAngle(0)
      .endAngle(2 * Math.PI)
      )

  var defs = svg.append('svg:defs');
  var nodes = cluster.nodes(d3data);
  var link = svg.selectAll('path.link')
    .data(cluster.links(nodes))
    .enter().append('svg:path')
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
    .on('click', function(d) {
      console.log('clicked!')
      console.log(d)
      toggle(d);
    })

  node.append('svg:circle')
    .attr('r', function(d) { return 1e-6; })

  var nodeUpdate = node.transition()
    .duration(1500)
    // .attr('transform', function (d) {
    //   return 'translate(' + d.y + ',' + d.x + ')';
    // })
    .attr('transform', function(d) { return 'rotate(' + (d.x - rotation) + ')translate(' + d.y + ')'; })
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
          x: 0,
          y: -50,
          width: 400,
          height: 400,
        })
        return 'url(#tile-img' + d.title + ')'
    })

  // var nodeExit = node.exit().transition()
  //   .duration(500)
  //   .attr('transform', function(d) {
  //     return 'translate(' + d.parent.y + ',' + d.parent.x + ')';
  //   })
}

update(root, rotation);

function toggle(d) {
  // if (d.children) {
  //   d._children = d.children;
  //   d.children = null;
  // }
  // if (d._children) {
  //   d.children = d._children;
  //   d._children = null;
  // }
  rotation = rotation - 90
  update(root, rotation);
}

