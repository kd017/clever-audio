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
    // List selector variables
    // =====================================
    var artistInput = $("#artist-input");
    var artistList = $("#artist-list");
    // var allArtistItems = $("#artist-list li");
    var artistDisplay = $(".artist-display");

    var songInput = $("#song-input");
    var songList = $("#song-list");
    // var allSongItems = $("#song-list li");
    var songDisplay = $(".song-display");

    var songImage = $("#song-image");
    var resultDisplay = $("#result-display");
    var songPreview = $("#song-preview");

    var predictButton = $("#predict-button");

    // =====================================
    // Functions
    // =====================================
    // Artist only search
    function searchArtists(artist) {
        $("#artist-list li").remove();
        $.getJSON(`/searchartists?artist=${artist}`, function(artistArray) {
            artistArray.map(artistName => {
                artistList.append(`<li artist="${artistName}">${artistName}</li>`);
            });
        });
    }

    // Songs by artist (will update songs list once an artists is selected)
    function searchSongsByArtist(artist) {
        $("#song-list li").remove();
        $.getJSON(`/searchtracks?artist=${artist}`, function(songObjects) {
            $.each(songObjects, function(key, value) {
                var artist = ""
                var image = ""
                var preview = ""
                $.each(value, function(key, value) {
                    if (key === "Artist") {
                        artist = value;
                    }
                    if (key === "Image") {
                        image = value;
                    }
                    if (key === "Preview") {
                        preview = value;
                    }
                    if (key === "Title") {
                        songList.append(`<li artist="${artist}" image="${image}" preview="${preview}">${value}</li>`);
                    };
                });
            });
        });
    }

    // Song only search
    function searchSongsBySong(song) {
        console.log(songInput.val());
        $("#song-list li").remove();
        $.getJSON(`/searchtracks?title=${song}`, function(songObjects) {
            $.each(songObjects, function(key, value) {
                var artist = ""
                var image = ""
                var preview = ""
                $.each(value, function(key, value) {
                    if (key === "Artist") {
                        artist = value;
                    }
                    if (key === "Image") {
                        image = value;
                    }
                    if (key === "Preview") {
                        preview = value;
                    }
                    if (key === "Title") {
                        songList.append(`<li artist="${artist}" image="${image}" preview="${preview}">${value}</li>`);
                    };
                });
            });
        });
    }

    // Songs by artist search
    function searchSongsbyArtistAndSong(artist, song) {
        $("#song-list li").remove();
        $.getJSON(`/searchtracks?artist=${artist}&title=${song}`, function(songObjects) {
            $.each(songObjects, function(key, value) {
                var artist = ""
                var image = ""
                var preview = ""
                $.each(value, function(key, value) {
                    if (key === "Artist") {
                        artist = value;
                    }
                    if (key === "Image") {
                        image = value;
                    }
                    if (key === "Preview") {
                        preview = value;
                    }
                    if (key === "Title") {
                        songList.append(`<li artist="${artist}" image="${image}" preview="${preview}">${value}</li>`);
                    };
                });
            });
        });
    }


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



    resultDisplay.text("Search for a song...");


    // =====================================
    // Input events
    // =====================================
    var artistInputForm = $("#artist-input-form");
    artistInputForm.submit(function(event) {
        event.preventDefault();
        if (artistInput.val() > "") {
            searchArtists(artistInput.val());
        }
        else {
            // Define variables within the function so that they are usable.
            var allArtistItems = $("#artist-list li");
            var allSongItems = $("#song-list li");
            $("#artist-list li").remove();
            allArtistItems.removeClass("selected");
            allSongItems.removeClass("selected");
            selectedArtist = "";
            selectedSong = "";
            artistDisplay.text("Select an Artist");
            songDisplay.text("Select a Song");
            resultDisplay.text("Pending song selection...");
            resultDisplay.removeClass("result-display-winner result-display-loser");
            songPreview.removeClass("song-preview-play");
            songPreview.removeClass("song-preview-pause");
            songPreview.addClass("song-preview-inactive");
            predictButton.addClass("predict-button-inactive");
            predictButton.removeClass("predict-button-active");

            if (songPreviewAudio > "") {
                songPreviewAudio.pause();
                songPreviewAudio = "";
            }
            
            songImage.attr("src", "");
        }
    });

    var songInputForm = $("#song-input-form");
    songInputForm.submit(function(event) {
        event.preventDefault();

        if (selectedArtist > "") {
            if (songInput.val() > "") {
                searchSongsbyArtistAndSong(selectedArtist, songInput.val());
            }
            else {
                searchSongsByArtist(selectedArtist);
            }
        }
        else {
            if (songInput.val() > "") {
                searchSongsBySong(songInput.val());
            }
            else {
                $("#song-list li").remove();
            }
        }

    });


    // =====================================
    // List selectors
    // =====================================
    artistList.on("click", "li", function() {
        // These variables are defined here so that they can be referenced properly.
        // Defining them outside of this function leaves them without the necessary
        // information.
        var allArtistItems = $("#artist-list li");
        var allSongItems = $("#song-list li");


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
            resultDisplay.text("Pending song selection...");
            resultDisplay.removeClass("result-display-winner result-display-loser");
            songPreview.removeClass("song-preview-play");
            songPreview.removeClass("song-preview-pause");
            songPreview.addClass("song-preview-inactive");
            predictButton.addClass("predict-button-inactive");
            predictButton.removeClass("predict-button-active");
            
            if (songPreviewAudio > "") {
                songPreviewAudio.pause();
                songPreviewAudio = "";
            }
            
            songImage.attr("src", "");
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
            resultDisplay.text("Pending song selection...");
            resultDisplay.removeClass("result-display-winner result-display-loser");
            songPreview.removeClass("song-preview-play");
            songPreview.removeClass("song-preview-pause");
            songPreview.addClass("song-preview-inactive");
            predictButton.addClass("predict-button-inactive");
            predictButton.removeClass("predict-button-active");
            searchSongsByArtist(selectedArtist);

            if (songPreviewAudio > "") {
                songPreviewAudio.pause();
                songPreviewAudio = "";
            }
            
            songImage.attr("src", "");
        }
    });



    var songPreviewAudio = "";

    songList.on("click", "li", function() {
        // Define variables within this function again.
        var allArtistItems = $("#artist-list li");
        var allSongItems = $("#song-list li");
        allSongItems.removeClass("selected");
        $(this).addClass("selected");
        selectedSong = $(this).text();
        songDisplay.text(selectedSong);
        selectedArtist = $(this).attr("artist");
        artistDisplay.text(selectedArtist);
        allArtistItems.removeClass("selected");
        $(`#artist-list li[artist="${selectedArtist}"]`).addClass("selected");
        resultDisplay.text("Click PREDICT");
        resultDisplay.removeClass("result-display-winner result-display-loser");
        songPreview.removeClass("song-preview-inactive");
        songPreview.removeClass("song-preview-play");
        songPreview.addClass("song-preview-pause");
        predictButton.addClass("predict-button-active");
        predictButton.removeClass("predict-button-inactive");

        if (songPreviewAudio > "") {
            songPreviewAudio.pause();
            songPreviewAudio = "";
        }

        // Prevent play button from activating if preview is null.
        if ($(this).attr("preview") !== "null") {
            songPreviewAudio = new Audio($(this).attr("preview"));
        }
        else {
            songPreview.removeClass("song-preview-pause");
            songPreview.addClass("song-preview-inactive");
        }

        songImage.attr("src", "");
        songImage.attr("src", $(this).attr("image"));

    });

    songPreview.on("click", function() {
        if (songPreview.hasClass("song-preview-pause")) {
            songPreview.removeClass("song-preview-pause");
            songPreview.addClass("song-preview-play");
            songPreviewAudio.play();
        }
        else if (songPreview.hasClass("song-preview-play")) {
            songPreview.removeClass("song-preview-play");
            songPreview.addClass("song-preview-pause");
            songPreviewAudio.pause();
        }
    })




    predictButton.on("click", function() {
        $.getJSON(`/predict?title=${selectedSong}&artist=${selectedArtist}`, function(data) {
            $.each(data, function(key, value) {
                if (key === "prediction") {

                    if (value === "Winner") {
                        resultDisplay.addClass("result-display-winner");
                        resultDisplay.text(value);
                    }
                    else if (value === "Non-Winner") {
                        resultDisplay.addClass("result-display-loser");
                        resultDisplay.text(value);
                    }
                    else {
                        resultDisplay.text("Song not found...")
                    }
                }
            });
        });
    });



});