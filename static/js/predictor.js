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
    // Artist and Song selection panels
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





    // List selectors
    var artistInput = $("#artist-input");
    var artistList = $("#artist-list");
    var allArtistItems = $("#artist-list li");
    var artistDisplay = $(".artist-display");

    var songInput = $("#song-input");
    var songList = $("#song-list");
    var allSongItems = $("#song-list li")
    var songDisplay = $(".song-display");


    // =====================================
    // Input events
    // =====================================
    artistInput.on("input", function() {
        allArtistItems.hide();
        $(`#artist-list li:caseInsensitiveContains("${artistInput.val()}")`).show();
    });

    songInput.on("input", function() {
        allSongItems.hide();
        $(`#song-list li:caseInsensitiveContains("${songInput.val()}")`).show();
    });



    // List selectors
    artistList.on("click", "li", function() {
        // Check to see if the artist is already selected.
        // If yes, clear the selection.  If no, select new artist.
        if ($(this).hasClass("selected") === true) {
            allArtistItems.removeClass("selected");
            allSongItems.removeClass("selected");
            $(this).removeClass("selected");
            selectedArtist = "";
            selectedSong = "";
            artistDisplay.text("Select an Artist");
            songDisplay.text("Select a Song");
            allSongItems.show();
        }
        else {
            allArtistItems.removeClass("selected");
            allSongItems.removeClass("selected");
            $(this).toggleClass("selected");
            selectedArtist = $(this).text();
            selectedSong = "";
            songDisplay.text("Select a Song");
            artistDisplay.text(selectedArtist);
            allSongItems.hide();
            $(`#song-list li[artist="${$(this).text()}"]`).show();
        }
    });

    songList.on("click", "li", function() {
        allSongItems.removeClass("selected");
        $(this).toggleClass("selected");
        selectedSong = $(this).text();
        songDisplay.text(selectedSong);
        selectedArtist = $(this).attr("artist");
        artistDisplay.text(selectedArtist);
        allArtistItems.removeClass("selected");
        $(`#artist-list li[artist="${selectedArtist}"]`).toggleClass("selected");
    });




});