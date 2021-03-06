function render_table(url) {
    if (!url) {
        url = "/data?limit=5000";
    }
    console.log(url)

    d3.json(url).then(data => {
        table_data = data.map(props => {
            row = [props.Artist, props.Title, props.Year, props.Winner, props.Acousticness, props.Danceability, props.Energy, props.Explicit, props.Instrumentalness, props.Mode, props['Time Signature'] ,props.Liveness, props.Loudness, props.Popularity, props.Speechiness, props.Tempo, props.Valence];
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
                        { title: "Artist", width: "10%"},
                        { title: "Title", width: "15%" },
                        { title: "Year", width: "5%" },
                        { title: "Winner", width: "5%"},
                        { title: "Acousticness", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},
                        { title: "Danceability", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},
                        { title: "Energy", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},
                        { title: "Explicit", width: "5%" },
                        { title: "Instrumentalness", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},                        { title: "Mode", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},
                        { title: "Time Signature", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},
                        { title: "Liveness", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},
                        { title: "Loudness", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},
                        { title: "Popularity", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},
                        { title: "Speechiness", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},
                        { title: "Tempo", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)},
                        { title: "Valence", width: "5%", render: $.fn.dataTable.render.number( ',', '.', 2)}
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

    url = "/titles"
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

// load_dropdowns();
render_table();
