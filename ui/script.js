const baseUrl = 'http://localhost:5000';
let displayedAttributes = [
  'Name',
  'Nationality',
  'National_Position',
  'Club',
  'Height',
  'Preferred_Foot',
  'Age',
  'Rating'
];
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

function populateDropdown(attributes) {
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
  const rows = tbody.selectAll('tr').data(players).enter().append('tr');

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
