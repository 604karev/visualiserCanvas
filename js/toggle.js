$("#toggle").click(function () {
    var sidebar = $("#sidebar");
    var img = $('#img');
    var w = sidebar.width();
    var pos = sidebar.offset().left;
    img.toggleClass('rotate');
    if (pos === 0) {
        sidebar.animate({"left": -w}, "slow");

    }
    else {
        sidebar.animate({"left": "0"}, "slow");

    }
});
