$("#toggle").click(function () {
    var sidebar = $("#sidebar");
    var img = $('#img');
    var w = sidebar.width();
    var pos = sidebar.offset().left;
    if (pos === 0) {
        sidebar.animate({"left": -w}, "slow");
        img.css({
            'transform': 'rotate (180 deg)'
        })
    }
    else {
        sidebar.animate({"left": "0"}, "slow");

    }
});
