	var lastelement="";
	function processData(data) {
		const graphContainer = document.querySelector('#graph');
		const titles = d3.keys(data[0]);
		var dimens = titles;
		lastelement = titles[titles.length-1];
		console.log('last');
		console.log(lastelement);
		dimens.pop();
		var arr = [];
		for( var i = 0; i < dimens.length; i++){
		   arr.push(dimens[i]);
		}
		const colorFinder = function(d){ return d[lastelement.toString()]; };
		const dimensions =arr;//dimensions used for RadViz.
		const dimensionAnchor = Array.apply(null, {length: dimensions.length}).map(Number.call, Number).map(x=>x*2*Math.PI/(dimensions.length));
		plotGraph(graphContainer, titles, colorFinder, dimensions, dimensionAnchor, data)
	}

	function plotGraph(graphContainer, titles, colorFinder, dimensions, dimensionAnchor, data) {

		function RV() {
			let	radiusDA = 5,
				radiusDT = 3;
			let nodecolor = d3.scaleOrdinal(d3.schemeCategory10);  //coloring scheme
			const formatnumber = d3.format(',d');
			let margin = {top:50, right:300, bottom:50, left:180},
				width = 860,
				height = 600;
			let circleRadius = Math.min((height-margin.top-margin.bottom) , (width-margin.left-margin.right))/2;
			// Adding index
			titles.unshift('index');
			// rewrite the data
			var normalized_dimens = dimensions.map(function(d) { return d + "_norm"; }),
				DN = dimensions.length,
				DA = dimensionAnchor.slice(),
				instance = data.slice();
			//instance, include more attributes.
			instance.forEach(function(d,i){
				d.index = i;
				d.id = i;
				d.color = nodecolor(colorFinder(d));
			});
			instance = addNormalizedValues(instance);
			instance = nodePositionCalculator(instance, normalized_dimens, DA); // nodePositionCalculator. need update when DAs move.

			// prepare the DA data
			let anchorData = dimensions.map(function(d, i) {
				return {
					theta: DA[i], //[0, 2*PI]
					x: Math.cos(DA[i])*circleRadius+circleRadius,
					y: Math.sin(DA[i])*circleRadius+circleRadius,
					fixed: true,
					name: d
				};
			});
			// legend data
			let colorspace = [], colorclass = [];
			instance.forEach(function(d, i){
				if(colorspace.indexOf(d.color)<0) {
					colorspace.push(d.color);
					colorclass.push(d[lastelement.toString()]); }
			});

			// define DOM components
			const radviz = d3.select(graphContainer);
			let svg = radviz.append('svg').attr('id', 'radviz')
				.attr('width', width)
				.attr('height', height);
			svg.append('rect').attr('fill', 'transparent')
				.attr('width', width)
				.attr('height', height);
			// transform a distance.(can treat as margin)
			let center = svg.append('g').attr('class', 'center').attr('transform', `translate(${margin.left},${margin.top})`);
			// prepare the DA tips components
			svg.append('rect').attr('class', 'infoTtip-rect');
			let DAtipContainer = svg.append('g').attr('x', 0).attr('y', 0);
			let infoTtip = DAtipContainer.append('g')
				.attr('class', 'infoTtip')
				.attr('transform', `translate(${margin.left},${margin.top})`)
				.attr('display', 'none');
			infoTtip.append('rect');
			infoTtip.append('text').attr('width', 150).attr('height', 25)
				.attr('x', 0).attr('y', 25)
				.text(':').attr('text-anchor', 'start').attr('dominat-baseline', 'middle');
			// prepare DT tooltip components
			svg.append('rect').attr('class', 'tip-rect')
				.attr('width', 80).attr('height', 200)
				.attr('fill', 'transparent')
				.attr('backgroundColor', d3.rgb(100,100,100));
			let ttContainer = svg.append('g')
				.attr('class', 'tip')
				.attr('transform', `translate(${margin.left},${margin.top})`)
				.attr('display', 'none');

			//Render the radviz
			const RVRadviz	= d3.select(graphContainer).data([radvizMain()]);

			// Rendering
			RVRadviz.each(render);
			function render(method) {
				d3.select(this).call(method);
			}

			// Function for display radviz
			function radvizMain(){
				function drawChart(div) {
					div.each(function() {
						drawPanel(circleRadius);
						drawDA();
						drawDALabel();
						let tooltip = ttContainer.selectAll('text').data(titles)
							.enter().append('g').attr('x', 0).attr('y',function(d,i){return 25*i;});
						tooltip.append('rect').attr('width', 150).attr('height', 25).attr('x', 0).attr('y',function(d,i){return 25*i;})
							.attr('fill', d3.rgb(200,200,200));
						tooltip.append('text').attr('width', 150).attr('height', 25).attr('x', 5).attr('y',function(d,i){return 25*(i+0.5);})
							.text(d=>d + ':').attr('text-anchor', 'start').attr('dominat-baseline', 'hanging');
						drawDT();
						sliderFunction();
						drawLegend();
						function drawPanel(a) {
							let panel = center.append('circle')
								.attr('class', 'big-circle')
								.attr('stroke', d3.rgb(0,0,0))
								.attr('stroke-width', 3)
								.attr('fill', 'transparent')
								.attr('r', a)
								.attr('cx', a)
								.attr('cy', a);
						}

						function drawDA(){
							center.selectAll('circle.DA-node').remove();
							let DANodes = center.selectAll('circle.DA-node')
								.data(anchorData)
								.enter().append('circle').attr('class', 'DA-node')
								.attr('fill', d3.rgb(120,120,120))
								.attr('stroke', d3.rgb(120,120,120))
								.attr('stroke-width', 1)
								.attr('r', radiusDA)
								.attr('cx', d => d.x)
								.attr('cy', d => d.y)
								.on('mouseenter', function(d){
									let damouse = d3.mouse(this); // get current mouse position
									svg.select('g.infoTtip').select('text').text('(' + formatnumber((d.theta/Math.PI)*180) + ')').attr('fill', 'darkorange').attr('font-size', '18pt');
									svg.select('g.infoTtip').attr('transform',  `translate(${margin.left + damouse[0] +0},${margin.top+damouse[1] - 50})`);
									svg.select('g.infoTtip').attr('display', 'block');
								})
								.on('mouseout', function(d){
									svg.select('g.infoTtip').attr('display', 'none');
								})
								.call(d3.drag()
									.on('start', dragstarted)
									.on('drag', dragged)
									.on('end', dragended)
								);
						}

						function dragstarted(d){
							d3.select(this).raise().classed('active', true);
						}

						function dragended(d){
							d3.select(this).classed('active', false);
							d3.select(this).attr('stroke-width', 0);
						}

						function dragged(d, i) {
							d3.select(this).raise().classed('active', true);
							let tempx = d3.event.x - circleRadius;
							let tempy = d3.event.y - circleRadius;
							let newAngle = Math.atan2( tempy , tempx ) ;
							newAngle = newAngle<0? 2*Math.PI + newAngle : newAngle;
							d.theta = newAngle;
							d.x = circleRadius + Math.cos(newAngle) * circleRadius;
							d.y = circleRadius + Math.sin(newAngle) * circleRadius;
							d3.select(this).attr('cx', d.x).attr('cy', d.y);
							// redraw the dimensional anchor and the label
							drawDA();
							drawDALabel();
							//update data points
							DA[i] = newAngle;
							nodePositionCalculator(instance, normalized_dimens, DA);
							drawDT();
						}

						function drawDALabel() {
							center.selectAll('text.DA-label').remove();
							let DANodesLabel = center.selectAll('text.DA-label')
								.data(anchorData).enter().append('text').attr('class', 'DA-label')
								.attr('x', d => d.x).attr('y', d => d.y)
								.attr('text-anchor', d=>Math.cos(d.theta)>0?'start':'end')
								.attr('dominat-baseline', d=>Math.sin(d.theta)<0?'baseline':'hanging')
								.attr('dx', d => Math.cos(d.theta) * 15)
								.attr('dy', d=>Math.sin(d.theta)<0?Math.sin(d.theta)*(15):Math.sin(d.theta)*(15)+ 10)
								.text(d => d.name)
								.attr('font-size', '10pt');
						}

						function drawDT(){
							center.selectAll('.circle-data').remove();
							let DTNodes = center.selectAll('.circle-data')
								.data(instance).enter().append('circle').attr('class', 'circle-data')
								.attr('id', d=>d.index)
								.attr('r', radiusDT)
								.attr('fill', d=>d.color)
								.attr('stroke', 'black')
								.attr('stroke-width', 0.5)
								.attr('cx', d => d.x0*circleRadius + circleRadius)
								.attr('cy', d => d.y0*circleRadius + circleRadius)
								.on('mouseenter', function(d) {
									let mouse = d3.mouse(this); //get current mouse position.
									let tip = svg.select('g.tip').selectAll('text').text(function(k, i){
										return k + ': ' + d[k];
									}); // edit tips text
									console.log('hoveringlabel');
									console.log(lastelement.toString());
									var clusterid=d[lastelement.toString()];
									var colorMode= $('.btn-group > .btn.active').text();
									axios.get('http://localhost:5000/correlationMatrix?clusterid='+clusterid+'&mode='+colorMode.toString())
									.then(response => {
									  $("#heatmap").html("");
									  console.log('response.data');
									  var d = response.data.data
									  console.log(d);
									  Plotly.newPlot('heatmap', d);

								  	})
								  	.catch(error => {
										console.log(error);
								 	 });
									svg.select('g.tip').attr('transform',  `translate(${margin.left + mouse[0] +20},${margin.top+mouse[1] - 120})`);
									svg.select('g.tip').attr('display', 'block');
									d3.select(this).raise().transition().attr('r', radiusDT*2).attr('stroke-width', 3);
								})
								.on('mouseout', function(d) {
									svg.select('g.tip').attr('display', 'none');
									d3.select(this).transition().attr('r', radiusDT).attr('stroke-width', 0.5);
								});
						}

						//function for slider
						function sliderFunction() {
							d3.select("#range1").on("input", function () {
								center.selectAll('.circle-data')
									.transition()
									.duration(500)
									.ease(d3.easeLinear)
									.style("opacity", d3.select("#range1").property("value")/100)
									.call(d3.drag()
										.on('start', dragstarted)
										.on('drag', dragged)
										.on('end', dragended)
									);

							});
						}
						//function for legend
						function drawLegend() {
							let heightLegend = 25, xLegend = margin.left+circleRadius*2, yLegend = 25;
							let legendcircle = center.selectAll('circle.legend').data(colorspace)
								.enter().append('circle').attr('class', 'legend')
								.attr('r', radiusDT)
								.attr('cx', xLegend)
								.attr('cy', (d, i) => i*yLegend)
								.attr('fill', d=>d);
							let legendtexts = center.selectAll('text.legend').data(colorclass)
								.enter().append('text').attr('class', 'legend')
								.attr('x', xLegend + 2 * radiusDT)
								.attr('y', (d, i) => i*yLegend+5)
								.text(d => d).attr('font-size', '16pt').attr('dominat-baseline', 'middle')
								.on('mouseover', function(d){
									//when mouse hover, other classes will be discolored.
									let tempa = d3.select(graphContainer).selectAll('.circle-data');
									tempa.nodes().forEach((element) => {
										let tempb = element.getAttribute('id');
										if (instance[tempb].quality != d) {
											d3.select(element).attr('fill-opacity', 0.2).attr('stroke-width', 0);
										}
									});
								})
								.on('mouseout', function(d) {
									//when mouse move out, display normally.
									d3.select(graphContainer).selectAll('.circle-data')
										.attr('fill-opacity', 1).attr('stroke-width', 0.5);
								});
						}
					});
				}
				return drawChart;
			}


			function nodePositionCalculator(instance, normalizedDimenNames, DA) {
				instance.forEach(function(d) {
					let dsum = d.dsum, dx = 0, dy = 0;
					normalizedDimenNames.forEach(function (k, i){
						dx += Math.cos(DA[i])*d[k];
						dy += Math.sin(DA[i])*d[k]; }); // dx & dy
					d.x0 = dx/dsum;
					d.y0 = dy/dsum;
					d.dist 	= Math.sqrt(Math.pow(dx/dsum, 2) + Math.pow(dy/dsum, 2)); // calculate r
					d.distH = Math.sqrt(Math.pow(dx/dsum, 2) + Math.pow(dy/dsum, 2)); // calculate r
					d.theta = Math.atan2(dy/dsum, dx/dsum) * 180 / Math.PI;
				});
				return instance;
			}

			function addNormalizedValues(data) {
				data.forEach(function(d) {
					dimensions.forEach(function(dimension) {
						d[dimension] = +d[dimension];
					});
				});
				var norm_Scales = {};
				dimensions.forEach(function(dimension) {
					norm_Scales[dimension] = d3.scaleLinear().domain(d3.extent(data.map(function(d, i) {
						return d[dimension];
					}))).range([0, 1]);
				});
				data.forEach(function(d) {
					dimensions.forEach(function(dimension) {
						d[dimension + '_norm'] = norm_Scales[dimension](d[dimension]);
					});
				});
				data.forEach(function(d) {
					let dsum = 0;
					normalized_dimens.forEach(function (k){ dsum += d[k]; }); // sum
					d.dsum = dsum;
				});
				return data;
			}
		}
		RV().call();
	}