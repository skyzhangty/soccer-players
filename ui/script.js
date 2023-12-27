const baseUrl = 'http://localhost:5000';
let displayedAttributes = [
  'Name',
  'Nationality',
  'National_Position',
  'Club',
  'Height',
  'Preferred_Foot',
  'Speed',
  'Stamina',
  'Crossing',
];
const skillAttributes = [
  "Weak_foot",
  "Skill_Moves",
  "Ball_Control",
  "Dribbling",
  "Marking",
  "Sliding_Tackle",
  "Standing_Tackle",
  "Aggression",
  "Reactions",
  "Attacking_Position",
  "Interceptions",
  "Vision",
  "Composure",
  "Crossing",
  "Short_Pass",
  "Long_Pass",
  "Acceleration",
  "Speed",
  "Stamina",
  "Strength",
  "Balance",
  "Agility",
  "Jumping",
  "Heading",
  "Shot_Power",
  "Finishing",
  "Long_Shots",
  "Curve",
  "Freekick_Accuracy",
  "Penalties",
  "Volleys",
  "GK_Positioning",
  "GK_Diving",
  "GK_Kicking",
  "GK_Handling",
  "GK_Reflexes"
]
let availableAttributes = [];
let currentPlayers = [];
const defaultOption = 'Select an attribute';
let sortAscending = true;
let sortedColumn = null;
d3.json(`${baseUrl}/attributes`)
    .then((allAttributes) => {
      availableAttributes = allAttributes.filter(
          (attr) => !displayedAttributes.includes(attr),
      );
      populateDropdown();
      updateTableHeaders();
      fetchAndDisplayPlayers();
    })
    .catch((error) => console.error('Error fetching attributes: ', error));

function fetchAndDisplayPlayers() {
  d3.json(`${baseUrl}/players`)
      .then((players) => {
        currentPlayers = players; // Store the fetched data
        updateTableRows(currentPlayers);
      })
      .catch((error) => console.error('Error fetching players: ', error));
}

function populateDropdown() {
  const dropdown = d3.select('#attribute-dropdown');
  dropdown.selectAll('option').remove(); // Clear existing options
  // Add a default prompt option
  dropdown
      .append('option')
      .text(defaultOption)
      .attr('disabled', true)
      .attr('selected', true);

  // Add the rest of the options
  dropdown
      .selectAll('option')
      .data(availableAttributes, (d) => d)
      .enter()
      .append('option')
      .text((d) => d);

  dropdown.on('change', function () {
    const selectedAttribute = d3.select(this).property('value');
    addColumnToTable(selectedAttribute);
    d3.select("#bar-chart").selectAll('*').remove();
  });
}

function updateTableHeaders() {
  const thead = d3.select('#players-table thead tr');
  const up = '&#9650;';
  const down = '&#9660;';
  thead.selectAll('th').remove(); // Clear existing headers

  thead
      .selectAll('th')
      .data(displayedAttributes)
      .enter()
      .append('th')
      .html((d) => {
        let sortIndicator = '';
        if (d === sortedColumn) {
          sortIndicator = sortAscending ? up : down;
        }
        return d + sortIndicator;
      })
      .style('cursor', 'pointer')
      .on('click', function (event, attribute) {
        sortTable(attribute);
      })
      .append('span')
      .text('x')
      .style('cursor', 'pointer')
      .on('click', function (event, attribute) {
        event.stopPropagation();
        removeColumn(attribute);
      });
}

function sortTable(attribute) {
  const isCurrentColumn = attribute === sortedColumn;
  sortAscending = isCurrentColumn ? !sortAscending : true; // Toggle if the same column, default to ascending otherwise
  sortedColumn = attribute;
  if (sortAscending) {
    currentPlayers.sort((a, b) => d3.ascending(a[attribute], b[attribute]));
  } else {
    currentPlayers.sort((a, b) => d3.descending(a[attribute], b[attribute]));
  }

  updateTableHeaders();
  updateTableRows(currentPlayers);
}

function updateTableRows(players) {
  const tbody = d3.select('#players-table tbody');
  tbody.selectAll('tr').remove(); // Clear existing rows
  const rows = tbody.selectAll('tr').data(players).enter().append('tr')
      .on("click", function (event, d) {
        d3.selectAll("#players-table tr").classed("selected-row", false); // Remove highlight from all rows
        d3.select(this).classed("selected-row", true); // Highlight selected row
        updateVisualizations(d); // Update visualizations with selected player's data
      });

  displayedAttributes.forEach((attr) => {
    rows.append('td').text((d) => d[attr]);
  });
}

function addColumnToTable(attribute) {
  if (!displayedAttributes.includes(attribute) && attribute !== defaultOption) {
    displayedAttributes.push(attribute);
    const index = availableAttributes.indexOf(attribute);
    if (index > -1) {
      availableAttributes.splice(index, 1);
    }
    populateDropdown();
    updateTableHeaders();
    updateTableRows(currentPlayers);
  }
}

function removeColumn(attribute) {
  // Remove attribute from displayed attributes
  const index = displayedAttributes.indexOf(attribute);
  if (index > -1) {
    displayedAttributes.splice(index, 1);
    availableAttributes.unshift(attribute); // Add it back to available attributes
  }

  populateDropdown(); // Update the dropdown
  updateTableHeaders(); // Re-create the table headers
  updateTableRows(currentPlayers);
}

function updateVisualizations(playerData) {
  const playerName = playerData.Name;
  const numericData = skillAttributes.filter(skillAttr => displayedAttributes.includes(skillAttr))
      .map(skillAttr => ({attribute: skillAttr, value: playerData[skillAttr]}));

  updateBarChart(playerName, numericData);
  drawDotPlot(playerName, numericData);
}

function updateBarChart(playerName, numericData) {
  const {svgWidth, svgHeight, margin, width, height} = getSvgSize();

  const {svg, x, y} = setUpSvg('bar-chart', svgWidth, svgHeight, numericData, margin, width, height, playerName);

  const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  chart.selectAll(".bar")
      .data(numericData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.attribute))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth()) // Dynamic width based on number of data points
      .attr("height", d => height - y(d.value));

  // Add the x Axis
  chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

  // Add the y Axis
  chart.append("g")
      .call(d3.axisLeft(y));

}

function drawDotPlot(playerName, numericData) {
  const {svgWidth, svgHeight, margin, width, height} = getSvgSize();

  const {svg, x, y} = setUpSvg('dot-plot', svgWidth, svgHeight, numericData, margin, width, height, playerName);
  // Draw dots
  svg.append("g")
      .selectAll("circle")
      .data(numericData)
      .enter().append("circle")
      .attr("class", "circle")
      .attr("cx", d => x(d.attribute) + x.bandwidth() / 2) // Center dots in the band
      .attr("cy", d => y(d.value))
      .attr("r", 5);

  // Add the x Axis
  svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

  // Add the y Axis
  svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
}

function getSvgSize() {
  const svgWidth = 600, svgHeight = 400;
  const margin = {top: 60, right: 20, bottom: 30, left: 40};
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  return {svgWidth, svgHeight, margin, width, height};
}

function setUpSvg(id, svgWidth, svgHeight, numericData, margin, width, height, playerName) {
  const svg = d3.select(`#${id}`)
      .attr("width", svgWidth)
      .attr("height", svgHeight);

  // Clear any previous SVG content
  svg.selectAll("*").remove();
  // Create a scale for your attributes
  const x = d3.scaleBand()
      .domain(numericData.map(d => d.attribute))
      .range([margin.left, width - margin.right])
      .padding(0.1);

  const y = d3.scaleLinear()
      .domain([0, d3.max(numericData, d => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top]);

  addPlayerName(svg, playerName, width, margin);

  return {svg, x, y};
}

function addPlayerName(svg, playerName, width, margin) {
  // Add the player's name as a title to the chart
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .text(playerName);
}