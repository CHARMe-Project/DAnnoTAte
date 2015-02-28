

var width = 960,
    height = 500;

var color = d3.scale.category10();

var nodes = [],
    links = [];

var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .charge(-400)
    .linkDistance(120)
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var node = svg.selectAll(".node"),
    link = svg.selectAll(".link");

//  Add some nodes and links.

//var jsondata = [{id: "a", to: ["b", "c"]}, {id: "a", to: ["d", "e"]}, {id: "a", to: ["a"]}];

var a = {id: "a"}, b = {id: "b"}, c = {id: "c"}, d = {id: "d"};
nodes.push(a, b, c, d);
links.push({source: a, target: b}, {source: a, target: c}, {source: b, target: c}, {source: c, target: d});
//start();


function start() {
  link = link.data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });
  link.enter().insert("line", ".node").attr("class", "link");
  link.exit().remove();

  node = node.data(force.nodes(), function(d) { return d.id;});
  node.enter().append("circle").attr("class", function(d) { return "node " + d.id; }).attr("r", 8);
  node.exit().remove();

  force.start();
}


function tick() {
  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })

  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
}