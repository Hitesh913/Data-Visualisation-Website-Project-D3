
Caring Personnel World Data

COS30045 Data Visualisation — Assignment 3 website project built with HTML, CSS, JavaScript and D3.js.

The project visualises OECD Caring Personnel data across countries and years. The current website provides separate vertical and horizontal bar-chart views so users can compare caring personnel using different measurement units.

Team members
- Truong Nguyen
- Hitesh Kumar
- Isuri Ihalagamage

Current visualisations

Vertical bar chart — Persons

The vertical bar chart displays the number of practising caring personnel by country using the Persons metric.

Current features include

- country comparison using vertical bars
- year selection using a dropdown
- automatic selection of a recent year with sufficient country data
- top-country filtering to keep the chart readable
- descending sorting by number of caring personnel
- responsive SVG layout
- hover tooltip with country, year, metric, status and value
- large-number formatting on the y-axis

This component is Isuri Ihalagamage's current chart contribution.

Horizontal bar chart — Per 1,000 inhabitants

The horizontal bar chart compares caring personnel relative to population using the Per 1 000 inhabitants metric.

Current features include

- year selection
- country selection using checkboxes
- comparison of selected countries
- option to show all countries
- horizontal D3.js bar-chart presentation

This component is Hitesh Kumar's current chart contribution.

Dataset

The project uses an OECD Caring Personnel CSV dataset stored in the dataset folder.

Current dataset fields used by the visualisations include

- Reference area — country
- TIME_PERIOD — year
- Unit of measure — measurement type
- Health profession activity status — workforce activity status
- Health profession — caring personnel category
- OBS_VALUE — numerical observation value
The current CSV contains the following measurement units
- Persons
- Per 1 000 inhabitants

The current dataset contains years from 2015 to 2025, although data availability varies by country and year.

At this stage, the current CSV contains the activity-status value Practicing. User-facing text uses the British English spelling Practising where appropriate.

Project structure

Data-Visualisation-Website-Project-D3-main/
├── index.html
├── healthbackground.jpg
├── README.md
├── css/
│   └── A3Styles.css
├── js/
│   ├── horizontalBarChartPer1000.js
│   ├── verticalBarChartPersons.js
│   └── script.js
└── dataset/
    └── OECD.ELS.HD,DSD_HEALTH_REAC_EMP@DF_CARE,+.......P..csv

Technologies
- HTML5
- CSS3
- JavaScript
- D3.js v6
- OECD Caring Personnel data

How to run the website

Because the charts load the CSV using d3.csv(), run the project through a local web server instead of opening index.html directly with file://.

Option 1 — VS Code Live Server

1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension if required.
3. Right-click index.html.
4. Select Open with Live Server.

Option 2 — Python local server

Open a terminal in the project folder and run
python -m http.server
Then open the local address shown in the terminal, usually
http://localhost:8000
Using the website

1. Open the website through a local server.
2. Select Vertical bar charts to view the Persons visualisation.
3. Use the year dropdown to change the displayed year.
4. Hover over vertical bars to inspect exact values.
5. Select Horizontal bar charts to view the Per 1 000 inhabitants visualisation.
6. Choose a year and optionally select countries for comparison.

Current project status

The current version focuses on getting the core D3.js charts working correctly. Further development may include stronger integration between the visualisations, additional metric switching and other interactive features as the Assignment 3 website is refined.

Data note

Countries do not always have observations for the same years. The charts therefore filter the available data by year and handle differing country coverage rather than assuming every country has a value for every year.