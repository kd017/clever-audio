function render_table(url) {
    if (!url) {
        url = "/data?limit=1000";
    }

    d3.json(url).then(data => {
        table_data = data.map(feature => {
            props = feature.properties;
            row = [props.ARTIST, props.TITLE, props.YEAR, props.ACOUSTICNESS, props.DANCEABILITY, props.ENERGY, props.EXPLICIT, props.INSTRUMENTALNESS, props.KEY, props.LIVENESS, props.LOUDNESS, props.MODE, props.POPULARITY, props.SPEECHINESS, props.TEMPO, props.VALENCE];
            return row
        })

        tcontainer = d3.select('#table-container');
        tcontainer.html('');
        tcontainer.append('table').attr('id', 'data-table').attr('width', '100%').classed('display compact table-responsive-xl', true)

        $(document).ready(function () {
            table = $('#data-table')
            if (table && (typeof table.DataTable === 'function')) {
                table.DataTable({
                    data: table_data,
                    autoWidth: false,
                    responsive: true,
                    columns: [
                        { title: "Artist", width: "8%" },
                        { title: "Title", width: "15%" },
                        { title: "Year", width: "23%" },
                        { title: "Acousticness", width: "9%" },
                        { title: "Danceability", width: "8%" },
                        { title: "Energy", width: "8%" },
                        { title: "Explicit", width: "9%" },
                        { title: "Instrumentalness", width: "5%" },
                        { title: "Key", width: "5%" },
                        { title: "Liveness", width: "5%" },
                        { title: "Loudness", width: "5%" },
                        { title: "Mode", width: "5%" },
                        { title: "Popularity", width: "5%" },
                        { title: "Speechiness", width: "5%" },
                        { title: "Tempo", width: "5%" },
                        { title: "Valence", width: "5%" }
                    ],
                    "paging": true,
                    stateSave: true
                });
            }
        });
    });
}

function load_dropdowns() {
    url = "/artists"
    d3.json(url).then(artist => {
        artist_dd = d3.select('#artist')
        artist_dd.selectAll('option')
            .data(states)
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);
    });

    url = "/title"
    d3.json(url).then(title => {
        
        title_dd = d3.select('#date')
        title_dd.selectAll('option')
            .data(states)
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);
    });

    button = d3.select('#filter-btn')
    button.on('click', function () {
        d3.event.preventDefault();
        // console.log('SUBMIT CLICKED')
        artistvalue = d3.select('#artist').property('value');
        titlevalue = d3.select('#title').property('value');

        url = "/data";
        sep = '?';
        if (datevalue) {
            url += `${sep}start=${datevalue}`;
            sep = '&';
        }
        if (statevalue) {
            url += `${sep}state=${statevalue}`;
            sep = '&';
        }
        if (sid) {
            url += `${sep}station=${sid}`;
            sep = '&';
        }
        if (sname) {
            url += `${sep}name=${sname}`;
            sep = '&';
        }
        url += `${sep}limit=1000`;
        console.log(url)
        render_table(url);
    });

    button = d3.select('#reset-btn')
    button.on('click', function () {
        d3.event.preventDefault();
        // console.log('RESET CLICKED')
        d3.select('#artist').property('value', '');
        d3.select('#title').property('value', '');
        render_table();
    });
}

load_dropdowns();
render_table();
