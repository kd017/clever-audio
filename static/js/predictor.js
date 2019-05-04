// We need a case insensitive search tool, so we'll add this to jQuery.
// (Shamelessly ripped from the internet.)
jQuery.expr[':'].caseInsensitiveContains = function(a, i, m) {
    return jQuery(a).text().toUpperCase()
        .indexOf(m[3].toUpperCase()) >= 0;
};


// Selection Variables
var selectedArtist = "";
var selectedSong = "";

$(document).ready(function() {
    // =====================================
    // Artist and Song selection panels
    // =====================================
    var artistPanel = $("#artist-panel");
    var artistTab = $("#artist-tab");
    var artistBg = $("#artist-bg");

    var songPanel = $("#song-panel");
    var songTab = $("#song-tab");
    var songBg = $("#song-bg");


    artistTab.click(function() {
        // Only toggle which panel is in front if 
        // the artist panel is in the back.
        if (artistPanel.hasClass("front") === false) {
            artistPanel.toggleClass("front");
            artistTab.toggleClass("artist-tab-active artist-tab-inactive");
            artistBg.toggleClass("artist-bg-active artist-bg-inactive");
            
            songPanel.toggleClass("front");
            songTab.toggleClass("song-tab-active song-tab-inactive");
            songBg.toggleClass("song-bg-active song-bg-inactive");
        }
    })

    songTab.click(function() {
        // Only toggle which panel is in front if 
        // the song panel is in the back.
        if (songPanel.hasClass("front") === false) {
            artistPanel.toggleClass("front");
            artistTab.toggleClass("artist-tab-active artist-tab-inactive");
            artistBg.toggleClass("artist-bg-active artist-bg-inactive");
            
            songPanel.toggleClass("front");
            songTab.toggleClass("song-tab-active song-tab-inactive");
            songBg.toggleClass("song-bg-active song-bg-inactive");
        }
    });

    // =====================================
    // List selector variables
    // =====================================
    var artistInput = $("#artist-input");
    var artistList = $("#artist-list");
    var artistDisplay = $(".artist-display");

    var songInput = $("#song-input");
    var songList = $("#song-list");
    var songDisplay = $(".song-display");

    var resultDisplay = $("#result-display");
    var songPreview = $("#song-preview");

    var predictButton = $("#predict-button");





    // =====================================
    // List appenders
    // =====================================
    var number = 0;
    var artists = [];
    $.getJSON("/tracks", function(data) {
        $.each(data, function(key, value) {
            // if (number < 11) {
                // number += 1;
                var artist = "";
                $.each(value, function(key, value) {
                    if (key === "Artist") {
                        if (artists.includes(value) === false) {
                            artists.push(value);
                            artistList.append(`<li artist="${value}">${value}</li>`);
                            artist = value;
                        }
                        else {
                            artist = value;
                        }
                    }
                    if (key === "Title") {
                        songList.append(`<li artist="${artist}">${value}</li>`);
                    }
                });
            // }
        });


    
        var allArtistItems = $("#artist-list li");
        var allSongItems = $("#song-list li");

        allArtistItems.hide();
        allSongItems.hide();

        resultDisplay.text("Pending song selection...");


        // =====================================
        // Input events
        // =====================================
        var artistInputSubmit = $("#artist-input-submit");
        var artistInputForm = $("#artist-input-form");
        artistInputForm.submit(function(event) {
            event.preventDefault();
            if (artistInput.val() > "") {
                allArtistItems.hide();
                $(`#artist-list li:caseInsensitiveContains("${artistInput.val()}")`).show();
            }
            else {
                allArtistItems.hide();
            }
        });

        var songInputForm = $("#song-input-form");
        songInputForm.submit(function(event) {
            event.preventDefault();
            if (songInput.val() > "") {
                allSongItems.hide();
                $(`#song-list li:caseInsensitiveContains("${songInput.val()}")`).show();
            }
            else {
                allSongItems.hide();
            }
        });


        // =====================================
        // List selectors
        // =====================================
        artistList.on("click", "li", function() {
            // Check to see if the artist is already selected.
            // If yes, clear the selection.  If no, select new artist.

            // Currently selected artist is selected
            if ($(this).hasClass("selected") === true) {
                allArtistItems.removeClass("selected");
                allSongItems.removeClass("selected");
                $(this).removeClass("selected");
                selectedArtist = "";
                selectedSong = "";
                artistDisplay.text("Select an Artist");
                songDisplay.text("Select a Song");
                allSongItems.hide();
                resultDisplay.text("Pending song selection...");
                resultDisplay.removeClass("result-display-winner result-display-loser");
                songPreview.addClass("song-preview-inactive");
                songPreview.removeClass("song-preview-active");
                predictButton.addClass("predict-button-inactive");
                predictButton.removeClass("predict-button-active");
            }
            // Non-selected artist is selected
            else {
                allArtistItems.removeClass("selected");
                allSongItems.removeClass("selected");
                $(this).addClass("selected");
                selectedArtist = $(this).text();
                selectedSong = "";
                songDisplay.text("Select a Song");
                artistDisplay.text(selectedArtist);
                allSongItems.hide();
                $(`#song-list li[artist="${$(this).text()}"]`).show();
                resultDisplay.text("Pending song selection...");
                resultDisplay.removeClass("result-display-winner result-display-loser");
                songPreview.addClass("song-preview-inactive");
                songPreview.removeClass("song-preview-active");
                predictButton.addClass("predict-button-inactive");
                predictButton.removeClass("predict-button-active");
            }
        });

        songList.on("click", "li", function() {
            allSongItems.removeClass("selected");
            $(this).addClass("selected");
            selectedSong = $(this).text();
            songDisplay.text(selectedSong);
            selectedArtist = $(this).attr("artist");
            artistDisplay.text(selectedArtist);
            allArtistItems.removeClass("selected");
            $(`#artist-list li[artist="${selectedArtist}"]`).toggleClass("selected");
            resultDisplay.text("Click PREDICT");
            resultDisplay.removeClass("result-display-winner result-display-loser");
            songPreview.addClass("song-preview-active");
            songPreview.removeClass("song-preview-inactive");
            predictButton.addClass("predict-button-active");
            predictButton.removeClass("predict-button-inactive");
        });





        predictButton.on("click", function() {
            $.getJSON(`/predict?title=${selectedSong}&artist=${selectedArtist}`, function(data) {
                $.each(data, function(key, value) {
                    if (key === "prediction") {
                        resultDisplay.text(value);

                        if (value === "Winner") {
                            resultDisplay.addClass("result-display-winner");
                        }
                        else {
                            resultDisplay.addClass("result-display-loser");
                        }
                    }
                });
            });
        });


    });

});