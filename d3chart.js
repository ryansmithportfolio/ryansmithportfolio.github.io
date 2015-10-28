var d3data = {
      title: 'projection1',
      priority: 10,
      img: './assets/wheel',
      children: [
        {
          title: 'immedia',
          url: 'https://www.immedia.xyz',
          description: 'your real-time encyclopedia',
          priority: 1,
        },
        {
          title: 'koupler',
          url: 'https://www.immedia.xyz',
          description: 'a meeting site for couples', 
          priority: 1.5,
        },
        {
          title: 'deep space',
          url: 'https://mtcrushmore.github.io',
          description: 'solar system creator', 
          priority: 2.5,
        },
        {
          title: 'fudwize',
          url: 'https://fudwize.herokuapp.xyz',
          description: 'connecting foodbanks and restaurants', 
          priority: 1.5,
        },
        {
          title: 'gram',
          url: 'https://github.com/mtcrushmore/gram',
          description: 'real-time whiteboard and chat', 
          priority: 2.5,
        },
      ]
};
var root = d3data;
var width = 1200;
var height = 800;

var centerX = width/2;
var centerY = 300;

var update = function(root) {

  var cluster = d3.layout.cluster()
    .size([360, centerY - 120])
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
      transform: function(d) { return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')'; }
    })
    .on('click', function(d) {
      toggle;
    })

  node.append('svg:circle')
    .attr('r', function(d) { return 1e-6; })

  var nodeUpdate = node.transition()
    .duration(500)
    .attr('transform', function (d) {
      return 'translate(' + d.y + ',' + d.x + ')';
    })
    .select('circle')
    .attr('r', function(d) { 
      if (d._children) { return 200; }
      return 100/d.priority; 
    })
    .style('fill', function(d) {
      defs.append('svg:pattern')
        .attr('id', 'tile-img' + d.title)
        .append('svg:image')
        .attr('xlink:href', function() {
          return d.img;
        })
        .attr({
          x: 0,
          y: 0,
          width: 50,
          height: 50,
        })
        return 'url(/#tile-img' + d.title + ')'
    })

  var nodeExit = node.exit().transition()
    .duration(500)
    .attr('transform', function(d) {
      return 'translate(' + d.parent.y + ',' + d.parent.x + ')';
    })
}

update(root);

function toggle(d) {
  console.log('click!')
  if (d.children) {
    d._children = d.children;
    d.children = null;
  }
  if (d._children) {
    d.children = d._children;
    d._children = null;
  }
  update(root);
}

