(function () {
    var requestAnimFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var soundPlayer = document.getElementById('audioPlayer');
    var audioCtx = new AudioContext();
    var source = audioCtx.createMediaElementSource(soundPlayer);// передаем наш плеер как новый ресурс Аудио контекста
    var analyser = audioCtx.createAnalyser();// создаем анализотор
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);//создаем массив фиксированной длинный и передает, число бит, которое равно половине, числа спектра частот
    analyser.fftSize = 256;// размер спектра чвастот
    var analyserMethod = "getByteTimeDomainData";// метод анализа данных
    var frequencyCount = analyser.fftSize;
    var canvas = document.getElementById('visualizer');
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    soundPlayer.crossOrigin = "anonymous";// означает, что обмен данными не будет использовать учетных данных
    function start() {
        analyser[analyserMethod](frequencyData);// начинаем анализ данных методом getByteTimeDomainData, это отношение типа волны в момент вермени
        ctx.fillStyle = "rgba(0,0,0,0.03)";// задаем стиль закрашивания
        var hue = Math.sin(analyser.context.currentTime * 0.05) * 360;//привязываем наш угол оттченка в к моменту времени через синус числа
        ctx.strokeStyle = "hsla(" + hue + ", 80%, 50%, 0.8)";// задаем наш динамический цвет
        ctx.lineWidth = 2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);// закрашиваем каждое изменение фрейма четным очень прозрачным фоном
        ctx.beginPath();
        ctx.moveTo(0, Math.round(canvas.height / 2));// перо на 0 по ширине и 0.5 по высоте
        var barWidth = Math.round(canvas.width / analyser.frequencyBinCount); // точка смещения по  X
        for (var i = 0; i < analyser.frequencyBinCount; i++) {// для каждорого элемента полученых данынх
            var percent = frequencyData[i] / frequencyCount;// высчитываем отношение значение/ количество частот
            var barHeight = canvas.height * percent;// и смещаем по Y
            ctx.lineTo((i ) * barWidth, barHeight);
        }
        ctx.lineTo(canvas.width, Math.round(canvas.height / 2));// рсуем кривую каждое изменение фрейма
        ctx.stroke();
        ctx.closePath();
        requestAnimFrame(start);
    }

    var clientParameter = "client_id=1LY3andosanxRfzP83CfGU7JP8rJjKab";// параметры учетки soundcloud
    var trackPermalinkUrl = 'https://soundcloud.com/ndby/05-1';// грузим трек по умолчанию
    $.ajax("https://api.soundcloud.com/resolve.json?url=" + trackPermalinkUrl + "&" + clientParameter, {
            success: function (response) {
                soundPlayer.src = response.stream_url + '?' + clientParameter;// назначаем ссылку потока
            }
        }
    );
    $.ajax('https://api.soundcloud.com/playlists/43184050?' + clientParameter, {//грузим объект плейлист у которого поле tracks это массив из обектов с информацией по треками
        success: function (response) {
            SC.initialize({// инициализируемся в SoundCloud Api
                client_id: '1LY3andosanxRfzP83CfGU7JP8rJjKab'
            });
            var tracks = response.tracks;// наш массив объектов с информацией
            for (var i = 0; i < tracks.length; i++) {
                var playlist = document.querySelector('#playlist ul');// создаем плейлист
                var songLi = document.createElement('li');// создаем для каждно елемента массива элемент списка
                var song = document.createElement('a');// создаем песню
                song.id = tracks[i].id;// задаем id каждой песне
                song.dataset.songLength = tracks[i].duration;// длительност каждой песне
                song.dataset.albumArt = tracks[i].artwork_url; // название альбома
                song.dataset.artist = tracks[i].user.username;// название исполнителя
                song.className = 'song';// присваиваем клас всем песням
                song.innerHTML = tracks[i].title; // вставляем нназвание трека во все элементы song
                songLi.appendChild(song);// a в li
                playlist.appendChild(songLi)// li в ul
            }
            var songs = document.querySelectorAll('.song');
            for (i = 0; i < songs.length; i++) {
                songs[i].addEventListener('click', function (e) {// на каждый трек в нашем списке вешаем обработчик событий  по клику
                    SC.get('/tracks/' + e.target.id + '?enable_api=true').then(function (song) {
                        var songLink = song.stream_url; // назначаем ссылку на песню
                        soundPlayer.src = songLink + '?' + clientParameter; // методами api soundcloud грузим наш трек по клику
                        soundPlayer.play();// воспроизводим трек
                        var allLinks = document.querySelectorAll('.song');// массив ссылок
                        for (var j = 0; j < allLinks.length; j++) {
                            if (allLinks[j].childNodes[1] !== undefined) {// проверяем, если из-за авторских или по другим причинам прав информация о треке отстутствет
                                var childEl = allLinks[j].childNodes[1]; // присваеваем ее переменной
                                childEl.parentNode.removeChild(childEl); // и удаляем из DOM дерева
                            }
                        }
                        e.target.className += ' active'; //добавляем класс active для добавления доп свойств полю с активным треком
                    });
                });
            }
        }
    });
    document.getElementById("oscilloscopeButton").addEventListener("click", function () {// обработчик событий по кнопке
        analyserMethod = "getByteTimeDomainData"; // меняем метод обработки данных на getByteTimeDomainData
        ctx.setLineDash([0, 0]);// сбрасываем параметры линии
    });
    document.getElementById("frequencyBarsButton").addEventListener("click", function () {
        analyserMethod = "getByteFrequencyData";// меняем метод обработки данных на getByteFrequencyData
        ctx.setLineDash([5, 5]); // задаем стль линици
    });
    source.connect(analyser); // подключаем наш анализатор к созданному элементу Media ресурса, Аудио контекста
    analyser.connect(audioCtx.destination);// подключаем анализотор с колонкам
    start();
})();