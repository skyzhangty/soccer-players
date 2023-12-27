# How to Run
You need to have docker installed and run ```docker-compose up```.
This will start both the api and ui at the same time.
Then you can go to http://localhost:8080/ to see the page.

# Implementation

## Overview
The api is built by flask and the ui is built by D3 with valina Javascript.
Both api and ui have their own ```Dockerfile``` and there's one ```docker-compose.yml``` to start the whole application.

## API
The api is straight forward and built by flask. It reads from the data source file ```soccer_small.json```
and create four endpoints as required. It uses flask-cors to bypass the CORS error.

## UI
The UI uses D3 and valina Javascript to build a table of the soccer players. It uses two endpoints from the api, ```/attributes/``` and ```/players/```.
It uses ```displayedAttributes``` for the columns to be displayed. After fetching all the attributes from the api,
it checks if the attribute is in ```displayedAttributes``` and if that's the case, the attribute will be used as the table column.

### UI Adding a Column
Any attributes that are not in ```displayedAttributes``` will be put into ```availableAttributes``` and listed as options in the dropdown.
When the attribute is selected in the dropdown, it will be removed from ```availableAttributes``` and be put into ```displayedAttributes```.
The attribute will not be in the dropdown options anymore.
Then the table will redraw itself for the updated columns and data.

### UI Removing a Column
I added a red cross (x) next to the column name in the table. When clicking on the x, the column will be removed. The attribute will be put back into ```availableAttributes``` so that it will be shown as an option in the dropdown.
The attribute will be removed from ```displayedAttributes``` and the table will redraw itself.

### UI Sorting the table
I use a global variable ```sortedColumn``` to indicate the current sorted column.
If the same column is clicked, it's going to toggle the sort order between asc and desc.
If another column is clicked, the starting sorting order by default is asc. I used the default d3 sort method to sort the column.

## Visualization
I used bar chart and dot plot. When the row of the table is clicked, the row will be highlighted as light blue.
It's going to draw the two visualization SVGs for the data in the row.
I used ```skillAttributes``` to list all the numeric skill related attributes. The code will check if the ```displayedAttribute``` of this row has these skilled attributes 
and show the data only for the skilled attributes in the row.

I also added a unique id for each row in the table. Since there's no player id in the json data, I have to use the player's name and join it with ```_```.
By doing this I can keep track of the highlighted row and keep it highlighted when the table is sorted.


