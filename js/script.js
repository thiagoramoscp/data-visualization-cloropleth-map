//  d3.geoPath (cria svg paths a partir de geojson data)

const WIDTH = 1200;
const HEIGHT = 850;
const PADDING_TOP = 105;
const PADDING_BOTTOM = 105;
const PADDING_LEFT = 125;
const PADDING_RIGHT = 105;

const INNER_WIDTH = WIDTH - (PADDING_LEFT + PADDING_RIGHT);
const INNER_HEIGHT = HEIGHT - (PADDING_TOP + PADDING_BOTTOM);

const tooltipXOffset = -40;
const tooltipYOffset = 70;

const svg = d3.select('svg');

svg.attr('width', WIDTH).
attr('height', HEIGHT).
attr('font-family', '"Lato", sans-serif');

svg.append('text').
attr('id', 'title').
text('United States Educational Attainment').
attr('x', WIDTH / 2).
attr('text-anchor', 'middle').
attr('y', PADDING_TOP - 60).
attr('font-size', '2.3em').
attr('fill', "#222");

svg.append('text').
attr('id', 'description').
text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)").
attr('x', WIDTH / 2).
attr('text-anchor', 'middle').
attr('y', PADDING_TOP - 25).
attr('font-size', '1.5em').
attr('fill', "#222");

svg.append('text').
attr('x', WIDTH - PADDING_RIGHT).
attr('text-anchor', 'end').
attr('y', HEIGHT - PADDING_BOTTOM + 35).
attr('font-size', '1.2em').
attr('fill', "#222").
text("Source: ").
append('a').
attr('href', 'https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx').
append('tspan').
text("USDA Economic Research Service");



Promise.all([
d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'),
d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')]).

then(([topoJSONData, eduData]) => {

  let eduDataParsed = {};
  eduData.forEach(obj => {
    eduDataParsed[obj.fips] = { state: obj.state, area_name: obj.area_name, bachelorsOrHigher: obj.bachelorsOrHigher };
  });

  const county = topojson.feature(topoJSONData, topoJSONData.objects.counties).features;

  const colorScale = d3.scaleQuantize().
  domain(d3.extent(eduData, d => d.bachelorsOrHigher)).
  range(['#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']);

  const mapG = svg.append('g').
  attr('class', 'map').
  attr('transform', `translate(${PADDING_LEFT}, ${PADDING_TOP})`).
  attr('transform-anchor', 'middle');

  mapG.selectAll('path').
  data(county).
  enter().
  append('path').
  attr('class', 'county').
  attr('data-fips', d => d.id).
  attr('data-education', d => eduDataParsed[d.id].bachelorsOrHigher).
  attr('d', d3.geoPath()).
  attr('fill', d => colorScale(eduDataParsed[d.id].bachelorsOrHigher)).
  on('mouseover', d => {
    tooltip.attr('data-education', eduDataParsed[d.id].bachelorsOrHigher);
    tooltip.style('visibility', 'visible').
    append('text').
    attr('font-size', '1.5em').
    attr('font-weight', '600').
    attr('transform', `translate(0, 0)`).
    text(`${eduDataParsed[d.id].area_name}, ${eduDataParsed[d.id].state}: ${eduDataParsed[d.id].bachelorsOrHigher}`);
  }).
  on('mouseout', d => {
    tooltip.style('visibility', 'hidden').
    attr('data-education', '');
    tooltip.select('rect');
    tooltip.select('text').remove();
  }).
  on('mousemove', d => {
    let mousePosition = d3.mouse(d3.event.currentTarget);
    let xPosition = mousePosition[0];
    let yPosition = mousePosition[1];
    tooltip.attr('transform', `translate(${xPosition + tooltipXOffset}, ${yPosition + tooltipYOffset})`);
  });

  let tooltip = svg.append('g').
  attr('id', 'tooltip').
  attr('data-education', '');

  tooltip.append('rect').
  attr('class', 'tooltip').
  attr('width', '0').
  attr('height', '0').
  attr('rx', '.5em');

  tooltip.style('visibility', 'hidden');


  //   /* --LEGEND-- */
  const legendValues = [9, 18, 27, 36, 45, 54, 63, 72];

  const legendG = svg.append('g').
  attr('id', 'legend').
  attr('font-size', '.9em').
  attr('fill', '#444');

  const legendXScale = d3.scaleLinear().
  domain(d3.extent(eduData, d => d.bachelorsOrHigher)).
  range([PADDING_LEFT, legendValues.length * 40 + PADDING_LEFT]);

  legendG.selectAll('rect').
  data(legendValues).
  enter().
  append('rect').
  attr('x', d => legendXScale(d)).
  attr('y', HEIGHT - PADDING_BOTTOM + 35).
  attr('width', '40').
  attr('height', '15').
  attr('fill', d => colorScale(d));

  const colorAxis = d3.axisBottom(legendXScale).
  tickValues(legendValues).
  tickFormat(d => `${d - 6}%`);

  legendG.append('g').
  attr('id', 'color-axis').
  attr('transform', `translate(40, ${HEIGHT - PADDING_BOTTOM + 50})`).
  call(colorAxis);


}).
catch(() => {
  const svg = d3.select('svg');

  svg.attr('width', '300').
  attr('height', '50').
  attr('font-family', '"Lato", sans-serif').
  append('text').
  attr('x', '150').
  attr('text-anchor', 'middle').
  attr('y', '30').
  text('Unable to load data. Sorry =/');
});