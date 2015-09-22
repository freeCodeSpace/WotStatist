/*
 * (1)  Маршрутизатор страницы на jQ:
 * В начале загрузки страницы вызывается {Роутер страницы}
 * В зависимости от значения #value в url вызывается соотв. действие в {Действия Роутера}
 * Маршрут index.html#mainPage и index.html вызывают одно и тоже действие
 * Маршрут index.html#other (не существующий) "перенаправляет" на действие index.html с очисткой url
 * Основной функционал: Маршруты вызываются с помощью кнопок в {Функционал вызова действий}
 * которые устанавливают #route в url и вызывают соответствующую ф-ию которая реализует
 * соответствующий код для конкретной страницы.
 * Все изменения контента осуществляются в специальном блоке <div>.
 * (2)  Зачитывание данных из json файла на диске и его вывод.
 * Схема работы (когда выполняется с HDD, тут изменено под www):
    1) Каждый раз проверяется {if ($.browser.mozilla)} тип браузера:
        если mozilla то выполн. дальше, иначе выводится сообщение.
    2) Каждый раз проверяется {getDataFromFile()} есть ли данные по сессии (в файле), если есть - то выводится меню
        и заполняется объект с данными, иначе выводится сообщение об отсутствии данных.
    3) Обработка действий (если выполняются пункты 1 и 2)
        3.1) При вызове через URL вызывается routePage() - вызывается соотв. ф-ия для страницы
        3.2) При вызове через п.Меню - вызывается соотв. ф-ия для страницы (аналогичная как и в п.3.1)
        3.3) При нажатии на кнопку обновить в п.Меню вызывается п.3.1 (обновляется для текущего действия)
    4) Вывод данных для конкретного действия {mainPage(),..mapsPage()} осущ. с помощью передачи параметра в
        ф-ию {getDataFromFile(action)} которая вызовет соотв. ф-ию вывода данных.
        Например: Вызывается ссылка <li id="tabProfit"> :
         -> проверится подходящий браузер {$.browser.mozilla}, проверится есть ли данные {getDataFromFile()}
         -> вызовется {routePage()} который вызовет {profitPage()} а он 
            вызовет {getDataFromFile('profit')} который вызовет {executeProfit(data)}
         -> метод {executeProfit(data)} обработает и выведет соотв. данные из полученного объекта.
         -> т.е. цепочка: 
            $.browser.mozilla->getDataFromFile()->routePage()->profitPage()->getDataFromFile('profit')->executeProfit(data);
    5) В метод getDataFromFile() помещен switch для того, что бы не дублировать данный метод в коде, для проверки 
        есть ли данные в объекте и для вызова конкретным методом/действием данного метода (который вернет необх. объект) 
**/

$(function() {
/* ===================================================================
   > Переменные <
=================================================================== */
var msk = 1; // сдвиг время относительно мск (1 значит: перевести тут на 1 час назад)

/* ===================================================================
   > Выполнение <
=================================================================== */
getDataFromFile(); // проверяется есть ли данные
routePage(); // тогда выполняется маршрутизация приложения

/* Проверка есть ли данные и получение данных из файла в формате JSON */
function getDataFromFile(action) {
    $.getJSON(
      url, //файл с данными ответа (в формате JSON)
        function(data) { //ф-ия выполняемая после получения данных (data-параметр ответа)
            if (data.hasOwnProperty(nick) == false) { // проверить есть ли данные по данному Nick-у (игроку)
                $('body').html(
                    '<h2 id="noDataMsg1"> Отсутствие данных ' +
                    'для игрока <span id="noDataMsg2">' + nick + '</span><br><br>' +
                    '<button id="reloadPage" title="Обновить данные" onclick="javascript:location.reload(true);">☼</button></h2>'
                );
            }
            if ($.isEmptyObject(data[nick]._session)) { // Проверка на существование данных в объекте
                $('body').html( /* Если нет данных - вывести сообщение и кнопку перегрузить страницу */
                    '<h2 id="noDataMsg1">Данные сессии на ' + data[nick].__date +
                    ' для игрока <span id="noDataMsg2">' + nick + '</span> пусты.<br><br>' +
                    '<button id="reloadPage" title="Обновить данные" onclick="javascript:location.reload(true);">☼</button></h2>'
                );
            } else { // если данные есть
                $('#main').css({'display' : 'block'}); // Включается отображение блока меню
                // Вызов соотв. ф-ии с передачей объекта (в зависимости от вызываемого действия)
                switch (action) {
                  // вызывается обработка данных для контента: Главная страница
                    case 'main' :
                        executeMain(data);
                    break;
                  // вызывается обработка данных для контента: Доходность
                    case 'profit' :
                        executeProfit(data); // передается объект
                    break;
                  // вызывается обработка данных для контента: Графики
                    case 'graphics' :
                        executeGraphics(data); // передается объект
                    break;
                  // вызывается обработка данных для контента: Карты
                    case 'maps' :
                        executeMaps(data); // передается объект
                    break;
                  // по умолчанию
                    default :
                    break;
                }
            }
        }
    );
}

/* ===================================================================
   > Роутер страницы <
=================================================================== */
/* Запускается в начале страницы */
function routePage() {
    var hash = $.trim(window.location.hash);
    switch (hash) {
      // если не установлен # или это #tabMain, запускается главная страница
        case '' :
        case '#tabMain' :
            mainPage();
        break;
      // запускается контент Доходность
        case '#tabProfit' :
            profitPage();
        break;
      // запускается контент Графики
        case '#tabGraphics' :
            graphicsPage();
        break;
      // запускается контент Карты
        case '#tabMaps' :
            mapsPage();
        break;
      // любое другое значение, запускается главная страница (аналогично если # нет)
        default :
            mainPage();
            clearHash();
        break;
    }
}

/* ===================================================================
   > Функционал вызова действий <
=================================================================== */
/* Вызывается кликом по блоку меню */
$('#tabMain').click( function() {
    window.location.hash = '#tabMain';
    mainPage();
    $('html, body').scrollTop(0); // Мгновенная прокрутка вверх страницы (при клике по #)
    return false; //ссылка не вернет свой якорь
});

$('#tabProfit').click( function() {
    window.location.hash = '#tabProfit';
    profitPage();
    $('html, body').scrollTop(0); // Мгновенная прокрутка вверх страницы (при клике по #)
    return false; //ссылка не вернет свой якорь
});

$('#tabGraphics').click( function() {
    window.location.hash = '#tabGraphics';
    graphicsPage();
    $('html, body').scrollTop(0); // Мгновенная прокрутка вверх страницы (при клике по #)
    return false; //ссылка не вернет свой якорь
});

$('#tabMaps').click( function() {
    window.location.hash = '#tabMaps';
    mapsPage();
    $('html, body').scrollTop(0); // Мгновенная прокрутка вверх страницы (при клике по #)
    return false; //ссылка не вернет свой якорь
});

/* ===================================================================
   > Действия Роутера <
=================================================================== */
/* Сценарий для Главной страницы */
function mainPage() {
    $('#tabProfit').removeClass('active'); /* Реализация подсветки необ. пункта меню */
    $('#tabMaps').removeClass('active');
    $('#tabGraphics').removeClass('active');
    $('#tabMain').addClass('active');
    getDataFromFile('main'); // Реализация главного вывода контента (для данного действия)
}

/* Сценарий для страницы Доходность */
function profitPage() {
    $('#tabMain').removeClass('active');
    $('#tabMaps').removeClass('active');
    $('#tabGraphics').removeClass('active');
    $('#tabProfit').addClass('active');
    getDataFromFile('profit');
}

/* Сценарий для страницы Графики */
function graphicsPage() {
    $('#tabMain').removeClass('active');
    $('#tabProfit').removeClass('active');
    $('#tabMaps').removeClass('active');
    $('#tabGraphics').addClass('active');
    getDataFromFile('graphics');
}

/* Сценарий для страницы Карты */
function mapsPage() {
    $('#tabMain').removeClass('active');
    $('#tabProfit').removeClass('active');
    $('#tabGraphics').removeClass('active');
    $('#tabMaps').addClass('active');
    getDataFromFile('maps');
}

/* ===================================================================
   > Вспомогательные ф-ии <
=================================================================== */
/* Сценарий для Очистки URL от #val и знака # */
function clearHash() {
    window.location.hash = ''; // очищается val в # (в строке url)
    var url = window.location + '';
    var urlSize = url.length; // запомним длину строки
    if ( url.charAt(urlSize - 1) == '#' ) { // если последний символ #
        // удалим этот символ из строки
        // и присвоим новое, полностью очищенное значение url
        window.location = url.slice(0, urlSize - 1);
    }
}

/*
 * Вывод значения wn8 с соотв. цветом (согласно диапазону качества)
 * Так же вызывается ф-ия форматирования чисел
*/
function prnWn8(val) { // ф-ия прнемает prnWn8(lastObj.wn8)
    return '<td nowrap class="borderCell" style="'+
        'color:' + getWn8Color(Math.round(val)) + ';">' + getNumF(val, 2) + '</td>'; // WN8
}

/* Получение цвета согласно переданному значению wn8 */
function getWn8Color(val) {
    if ( (0<=val)&&(val<=359) ) return '#fe0e01'; // 0 - 359
    if ( (360<=val)&&(val<=824) ) return '#ff7d00'; // 360 - 824
    if ( (825<=val)&&(val<=1384) ) return '#C1B802'; // 825 - 1384 #fdf109 
    if ( (1385<=val)&&(val<=2054) ) return '#489928'; // 1385 - 2054
    if ( (2055<=val)&&(val<=2674) ) return '#00cab3'; // 2055 - 2674
    if ( (2675<=val)&&(val<=9999) ) return '#d93df9'; // 2675 - 9999
    if ( (10000<=val)&&(val<=100000) ) return 'blue'; // 10000+ или #461BF3
}

/* 
 * Вывод значения %побед с соотв. цветом (согласно диапазону качества)
 * Так же вызывается ф-ия форматирования чисел
*/
function prnPercent(val) { // ф-ия принимает Obj.param)
    return '<td class="borderCell" style="'+
        'color:' + getPercentColor(Math.round(val)) + ';">' + getNumF(val, 1) + '</td>'; // % Побед
}

/* Получение цвета согласно переданному значению % */
function getPercentColor(val) {
    if ( (0<=val)&&(val<=46) ) return '#fe0e01'; // 0 - 359
    if ( (47<=val)&&(val<=48) ) return '#ff7d00'; // 360 - 824
    if ( (49<=val)&&(val<=51) ) return '#C1B802'; // 825 - 1384 #fdf109 
    if ( (52<=val)&&(val<=57) ) return '#489928'; // 1385 - 2054
    if ( (58<=val)&&(val<=64) ) return '#00cab3'; // 2055 - 2674
    if ( (65<=val)&&(val<=100) ) return '#d93df9'; // 2675 - 9999
}

/* 
 * Возврат форматированного значения в зависимости от заданного режима (по передаче trig)
 * Использование библиотеки https://plugins.jquery.com/df-number-format
 * Если при делении есть знаки после запятой, вернет их в виде x xx,xx
 * Если деление было целым, вернет число в виде x xx (а не x xx,00)
 * trig=1, используется для вывода чисел в диапазоне 0-10 и 0-100 (фраги за бой и %)
*/
function getNumF(val, trig) {
    if (trig === 1) { // режим обработки фрагов за бой и %побед
        var valR = Math.round(val);
        if ($.number(val, 2) == valR) {
            return valR;
        } else {
            return $.number(val, 2, ',', '&nbsp');
        }
    } else if (trig === 2) { // режим обработки 4-х знач. без необх. вывода знаков после запятой
        return $.number(val, 0, ',', '&nbsp');
    }
}

/*
 * Вывод значения xwn8 (для последнего боя) с соотв. цветом (согласно диапазону качества)
 * Так же вызывается ф-ия форматирования чисел
*/
function prnLastXwn8(val) { // ф-ия принимает prnXwn8(lastObj.xwn8)
    return '<td nowrap style="'+
        'color:' + getXwn8Color(Math.round(val)) + ';">' + Math.round(val) + '</td>'; // xWN8
}
/*
 * Вывод значения (для общей таблицы) xwn8 с соотв. цветом (согласно диапазону качества)
 * Так же вызывается ф-ия форматирования чисел
*/
function prnXwn8(val) { // ф-ия принимает prnXwn8(lastObj.xwn8)
    return '<td nowrap class="borderCell cellLow" style="'+
        'color:' + getXwn8Color(Math.round(val)) + ';">' + Math.round(val) + '</td>'; // xWN8
}

/* Получение цвета согласно переданному значению xwn8 */
function getXwn8Color(val) {
    if ( (0<=val)&&(val<=16) ) return '#fe0e01'; // 0 - 359
    if ( (17<=val)&&(val<=33) ) return '#ff7d00'; // 360 - 824
    if ( (34<=val)&&(val<=52) ) return '#C1B802'; // 825 - 1384 #fdf109 
    if ( (53<=val)&&(val<=75) ) return '#489928'; // 1385 - 2054
    if ( (76<=val)&&(val<=92) ) return '#00cab3'; // 2055 - 2674
    if ( (93<=val)&&(val<=100) ) return '#d93df9'; // 2675 - 9999
}

/*
 * Вывод значения серебра с соотв. цветом (согласно диапазону качества)
 * Так же вызывается ф-ия форматирования чисел
*/
function prnGold(val) {
    return '<td nowrap class="borderCell" style="'+
        // если <= 0 то вывести красным цветом иначе черным, так же форматировать
        'color:' + ( (Math.round(val) <= 0) ? '#fe0e01' : '#333' ) + ';">' + getNumF(val, 2) + '</td>'; // Доход
}

/* Ф-я обрезки секунд в времени (используется в Доходность->Вывод данных) */
function prnTime(val) {
    val = val.toLocaleString(); // будет иметь вид xx:xx:xx и x:xx:xx
    if (val.length == 8) { // учесть по длине
        return val.substr(0, 5); // обрезка для xx:xx:xx
    } else {
        return val.substr(0, 4); // обрезка для x:xx:xx
    }
}

/* Ф-ия которая переводит секунды в часы минуты и секунды (Возвращает строку с временем) */
function convertTimeSec(allSeconds) {
    var allSeconds = parseInt(allSeconds); // отбросить дробную часть (если есть)
    var hoursConvers = allSeconds % 3600; // Остаток от вычисления часов
    var s = hoursConvers % 60; // итоговое значение секунд
    var m = (hoursConvers - s) / 60; // итоговое значение минут
    var h = (allSeconds - hoursConvers) / 3600 ; // итоговое значение часов
    if (h != 0) { // если есть значение часов
        var time = h + "<span class='time'>ч </span>" + m + "<span class='time'>м</span>"; // время с знач: h m
        return time;
    } else {
        var time = m + "<span class='time'>м </span>" + s + "<span class='time'>с</span>"; // время с знач: m s
        return time;
    }
}

/* Ф-ия создания массива заполненного текущими средними значениями для построения 2-го графика (используется в: tabGraphics) 
   Принимает массив знач. из которого вычисл. среднее.
   Вычисление текущего среднего:
   Перебор массива значений урона, на каждой итерации вычисляется среднее, по знач. длины массива и заносится в масс. средних. */
function createAverArrGraph(arrA) {
    var arrSlice = []; // временный массив усечений
    var arrAver = []; // массив средних значений
    for(var m=0, elem_max_val = arrA.length;  m<elem_max_val; m+=1) {
        arrSlice = arrA.slice(0, (m + 1)); // присвоить усеченный массив прохода, вида: [a], [a, b], [a, b, c]...
        var averCur = findAverInArr(arrSlice); // передать усеч. массив что бы в нем вычислить среднее
        arrAver.push(averCur); // добавить получ. среднее знач (выше) в создаваемый массив средних
    }
    return arrAver; // вернуть массив средних значений
}

/* Ф-ия вычисляет среднее значение в массиве (используется в ф-ии createAverArrGraph для: tabGraphics) */
function findAverInArr(arrA) {
    var aver = 0; // переменная средняя
    var arrLen = arrA.length;
    if (arrLen === 0) return 0; // заглушка если пустой массив
    for(var m=0, elem_max_val = arrLen;  m<elem_max_val; m+=1) {
        aver += arrA[m]; // приростить на значение из массива (для вычисл. текущего среднего)
    }
    return Math.round(aver/arrLen); // вернуть среднее знач. в массиве, отбросив дробь
}

/* Ф-ия распечатывает элементы массива (используется в: tabGraphics) */
function prnArrAver(arrA) {
    var len = arrA.length;
    var str = '<b>Средние значения: </b>';
    for(var m=0, elem_max_val = len;  m<elem_max_val; m+=1) {
        str += '<span class="averPoint"><b class="averPointNum">' + (m+1)+ ': </b>' + getNumF(arrA[m], 2) + '</span> &nbsp;';
    }
    return str;
}

/* ===================================================================
   > Реализация Действий <
=================================================================== */

    /* > Вывод контента: Главная страница #tabMain <
    =============================================================== */
function executeMain(data) {
    var lastObj = {}; // Объект для хранения данных о последнем бое
    var game = {}; // Пустой объект для хранения упорядоченных данных
    var propName; // Для хранения названия техники (для заполнения объекта)

    // Обработка данных объекта
    var lastB = data[nick]._session.lastBattleID; // определить ID последнего боя
    for (var key in data[nick].battles) { // переберем все объекты боев

        if( key == lastB ) { // если это последний бой (отдельное заполнение результатов для последнего боя)
            lastObj = { // заполним, сохранив в объекте
                'wn8' : data[nick].battles[key].ratings.wn8,
                'xwn8' : data[nick].battles[key].ratings.xwn8,
                'damage' : data[nick].battles[key].personal.damageDealt,
                'tank' : data[nick].battles[key].vehicle.localShortName,
                'kills' : data[nick].battles[key].personal.kills,
                'origXP' : data[nick].battles[key].accruals.originalXP,
                'gold' : data[nick].battles[key].accruals.pureCredits,
                'armorBlocked' : data[nick].battles[key].personal.damageBlockedByArmor,
                'asistRadio' : data[nick].battles[key].personal.asistRadio,
                'allXP' : data[nick].battles[key].accruals.XP
            }
        }

        // Заполнение данными общего объекта боев новыми значениями:
        propName = data[nick].battles[key].vehicle.localShortName;
        if( game.hasOwnProperty(propName) == false ) { //если еще нет такого свойства

            // Переопределение значения ничьи (с -1 на 0)
            (data[nick].battles[key].battle.result == -1) ?
                result = 0
            :
                result = data[nick].battles[key].battle.result;

            // Заполнение объекта данными
            game[propName] = { //добавим такое свойство объекту и заполним параметрами
                'damage' : data[nick].battles[key].personal.damageDealt,
                'gold' : data[nick].battles[key].accruals.pureCredits,
                'allXP' : data[nick].battles[key].accruals.XP,
                'origXP' : data[nick].battles[key].accruals.originalXP,
                'result' : result,
                'wn8' : data[nick].battles[key].ratings.wn8,
                'count' : 1,
                'freeXP' : data[nick].battles[key].accruals.freeXP,
                'kills' : data[nick].battles[key].personal.kills,
                'armorBlocked' : data[nick].battles[key].personal.damageBlockedByArmor,
                'asistRadio' : data[nick].battles[key].personal.asistRadio,
                'asistTrack' : data[nick].battles[key].personal.asistTrack,
                'xwn8' : data[nick].battles[key].ratings.xwn8,
                'duration' : data[nick].battles[key].battle.duration,
                'lifeTime' : data[nick].battles[key].personal.lifeTime
            };
        } else { // если уже есть такое свойство
            game[propName].damage += data[nick].battles[key].personal.damageDealt; // прибавим значение
            game[propName].gold += data[nick].battles[key].accruals.pureCredits;
            game[propName].allXP += data[nick].battles[key].accruals.XP;
            game[propName].origXP += data[nick].battles[key].accruals.originalXP;

            // Переопределение значения ничьи (с -1 на 0)
            (data[nick].battles[key].battle.result == -1) ?
                result = 0
            :
                result = data[nick].battles[key].battle.result;
            game[propName].result += result;

            game[propName].wn8 += data[nick].battles[key].ratings.wn8;
            game[propName].count += 1; //Повысим значение боев на 1-н
            game[propName].freeXP += data[nick].battles[key].accruals.freeXP;
            game[propName].kills += data[nick].battles[key].personal.kills;
            game[propName].armorBlocked += data[nick].battles[key].personal.damageBlockedByArmor;
            game[propName].asistRadio += data[nick].battles[key].personal.asistRadio;
            game[propName].asistTrack += data[nick].battles[key].personal.asistTrack;
            game[propName].xwn8 += data[nick].battles[key].ratings.xwn8;
            game[propName].duration += data[nick].battles[key].battle.duration;
            game[propName].lifeTime += data[nick].battles[key].personal.lifeTime;
        }
    }

    // Вывод таблицы последнего боя:
    $('#contentBox').html( // шапка таблицы к которой будет добавляться строки таблицы
        '<div class="titleText">Данные на: <b>' + data[nick].__date +
        '</b> для игрока: <span class="titleText0">' + nick + '</span></div>' +
        '<div class="titleText1">Последний результат:</div>' +
        '<table align="center" cellpadding="5" cellspacing="0" class="tableLastBattle">' +
            '<thead>' +
                '<tr>' +
                    '<td class="borderCell cellTank">Техника</td>' + 
                    '<td class="borderCell">WN8</td>' + 
                    '<td class="borderCell">Урон</td>' + 
                    '<td class="borderCell">Фраги</td>' + 
                    '<td class="borderCell">Доход</td>' + 
                    '<td class="borderCell">Опыт</td>' + 
                    '<td class="borderCell">Σ Опыта</td>' + 
                    '<td class="borderCell">Blocked</td>' + 
                    '<td class="borderCell">Засвет</td>' + 
                    '<td>xWN8</td>' + 
                '</tr>' +
            '</thead>' +
            '<tbody>' +
                '<tr>' +
                    '<td nowrap class="borderCell cellTank">' + lastObj.tank + '</td>' + // Техника
                    prnWn8(lastObj.wn8) + // WN8, вызов ф-ии которая вернет ячейку с значением с соотв. цветом
                    '<td nowrap class="borderCell">' + getNumF(lastObj.damage, 2) + '</td>' + // Урон
                    '<td nowrap class="borderCell">' + lastObj.kills + '</td>' + // Фраги
                    prnGold(lastObj.gold) + 
                    '<td nowrap class="borderCell">' + getNumF(lastObj.origXP, 2) + '</td>' + // Опыт
                    '<td nowrap class="borderCell">' + getNumF(lastObj.allXP, 2) + '</td>' + //Σ Опыта
                    '<td nowrap class="borderCell">' + getNumF(lastObj.armorBlocked, 2) + '</td>' +  // Blocked
                    '<td nowrap class="borderCell">' + getNumF(lastObj.asistRadio, 2) + '</td>' +  // Засвет
                    prnLastXwn8(lastObj.xwn8) + // xWN8
                '</tr>' +
            '</tbody>' +
        '</table>' +
        '<div style="clear: both;">'
    );

    // Вывод таблицы данных по танкам:
    $('#contentBox').append( // шапка таблицы к которой будет добавляться строки таблицы
        '<div class="titleText2">Данные по танкам:</div>' +
        '<table align="center" cellpadding="5" cellspacing="0" id="tankDataTable">' +
            '<thead>' +
                '<tr>' +
                    '<td class="borderCell cellTank">Техника</td>' +
                    '<td class="borderCell">mWN8</td>' +
                    '<td class="borderCell">Ср. Урон</td>' +
                    '<td class="borderCell">%-побед</td>' + 
                    '<td class="borderCell">Дохода за бой</td>' +
                    '<td class="borderCell cellXp">Ср. Опыт</td>' +
                    '<td class="borderCell">Σ Дохода</td>' +
                    '<td class="borderCell cellAllxp"> Σ Общего Опыта</td>' +
                    '<td class="borderCell cellLow">Своб. опыта</td>' +
                    '<td class="borderCell cellLow">Фраги</td>' +
                    '<td class="borderCell cellLow">Фрагов за бой</td>' +
                    '<td class="borderCell">Blocked за бой</td>' +
                    '<td class="borderCell">Засвет за бой</td>' +
                    '<td class="borderCell">Asist за бой</td>' +
                    // '<td class="borderCell">Σ Урона</td>' +
                    '<td class="borderCell">Ср. t боя</td>' +
                    '<td class="borderCell">Ср. t игры</td>' +
                    '<td class="borderCell">∆t</td>' +
                    // '<td class="borderCell cellLow">mxWn8</td>' +
                    '<td class="cellLow">Боев</td>' +
                '</tr>' +
            '</thead>' +
            '<tbody></tbody>' +
        '</table>'
    );
    // Вывод значений из объекта:
    for(var ob in game) { // Вывод строк таблицы с форматированием из библиотеки как $.number(val1, 2, '.', '&nbsp');
        $('#tankDataTable tbody').append( // вставим после <tbody>
            '<tr>' +
                '<td class="borderCell cellTank">' + ob + '</td>' + // Техника
                prnWn8(game[ob].wn8/game[ob].count) + // WN8
                '<td class="borderCell">' + getNumF(game[ob].damage/game[ob].count, 2) + '</td>' + // Средний Урон
                prnPercent(100 * game[ob].result / game[ob].count) + // %-побед
                prnGold(game[ob].gold/game[ob].count) + // Дохода за бой
                '<td class="borderCell cellXp">' + getNumF(game[ob].origXP/game[ob].count, 2) + '</td>' + // Средний Боевой Опыт
                prnGold(game[ob].gold) + // Всего Дохода
                '<td class="borderCell">' + getNumF(game[ob].allXP, 2) + '</td>' + // Всего Общего Опыта
                '<td class="borderCell cellLow">' + getNumF(game[ob].freeXP, 2) + '</td>' + // Своб. опыта
                '<td class="borderCell cellLow">' + game[ob].kills + '</td>' + // Фраги
                '<td class="borderCell cellLow">' + getNumF(game[ob].kills/game[ob].count, 1) + '</td>' + // Фрагов за бой 
                '<td class="borderCell">' + getNumF(game[ob].armorBlocked/game[ob].count, 2) + '</td>' + // Blocked за бой
                '<td class="borderCell">' + getNumF(game[ob].asistRadio/game[ob].count, 2) + '</td>' + // Засвет за бой
                '<td class="borderCell">' + getNumF((game[ob].asistTrack+game[ob].asistRadio)/game[ob].count, 2) + '</td>' + // Asist
                // '<td class="borderCell">' + getNumF(game[ob].damage, 2) + '</td>' + // Σ Урона
                '<td class="borderCell">' + convertTimeSec(game[ob].duration/game[ob].count) + '</td>' + // Ср. t боя
                '<td class="borderCell">' + convertTimeSec(game[ob].lifeTime/game[ob].count) + '</td>' + // Ср. t игры
                '<td class="borderCell">' + convertTimeSec( ((game[ob].duration - game[ob].lifeTime)/game[ob].count) ) + '</td>' + // ∆t
                // prnXwn8(game[ob].xwn8/game[ob].count) + // mxWn8
                '<td class="cellLow">' + game[ob].count + '</td>' + // Боев
            '</tr>'
        );
    }

    // Обработка данных по итоговым данным:
    var wn8All = 0; var xwn8All = 0; var AllCount = 0;
    var allBattle = 0; var allGold = 0; var allXP = 0;
    var allXpFree = 0; var allDamage = 0; var allKills = 0;
    for(var ob in game) {
        wn8All += game[ob].wn8;
        xwn8All += game[ob].xwn8;
        AllCount += game[ob].count;
        allBattle += game[ob].result;
        allGold += game[ob].gold;
        allXP += game[ob].allXP;
        allXpFree += game[ob].freeXP;
        allDamage += game[ob].damage;
        allKills += game[ob].kills;
    }
    // Вывод таблицы общих результатов:
    $('#contentBox').append(
        '<div class="titleText3">Итог:</div>' +
        '<table align="center" cellpadding="5" cellspacing="0" class="tableItog">' +
            '<thead>' +
                '<tr>' +
                    '<td nowrap class="borderCell">WN8</td>' + 
                    '<td nowrap class="borderCell">xWN8</td>' + 
                    '<td class="borderCell">%-побед</td>' + 
                    '<td nowrap class="borderCell">Σ Дохода</td>' +
                    '<td nowrap class="borderCell cellBig">Σ Общего Опыта</td>' +
                    '<td nowrap class="borderCell cellBig">Σ Своб. Опыта</td>' +
                    '<td nowrap class="borderCell">Σ Урона</td>' +
                    '<td nowrap class="borderCell">Σ Фрагов</td>' +
                    '<td class="borderCell">mWN8</td>' + 
                    '<td class="borderCell">mxWn8</td>' + 
                    '<td>Боев</td>' + 
                '</tr>' +
            '</thead>' +
            '<tbody>' +
                '<tr>' +
                    prnWn8(data[nick]._session.wn8) + // WN8 PMOD
                    prnXwn8(data[nick]._session.xwn8) + // xWN8 PMOD
                    prnPercent(100 * allBattle / AllCount) + // %-побед
                    prnGold(allGold) + // Всего Дохода
                    '<td class="borderCell cellBig">' + getNumF(allXP, 2) + '</td>' + // Всего Общего Опыта
                    '<td class="borderCell cellBig">' + getNumF(allXpFree, 2) + '</td>' + // Всего Свободн. Опыта
                    '<td class="borderCell">' + getNumF(allDamage, 2) + '</td>' + // Всего Урона
                    '<td class="borderCell">' + allKills + '</td>' + // Всего Фрагов
                    prnWn8(wn8All/AllCount) + // mWN8
                    prnXwn8(xwn8All/AllCount) + // mxWN8
                    '<td>' + AllCount + '</td>' + // Боев
                '</tr>' +
            '</tbody>' +
        '</table>'
    );

    // Вывод итогов по времени:
    $('#contentBox').append(
        '<br><br><div class="titleText1">Итоги по времени:</div>' +
        '<table align="center" cellpadding="5" cellspacing="0" class="tableLastBattle tableAllTime">' +
            '<thead>' +
                '<tr>' +
                    '<td nowrap class="borderCell">Σ t боев</td>' +
                    '<td nowrap class="borderCell">Σ t игр</td>' +
                    '<td nowrap class="borderCell">Σ ∆t</td>' +
                    '<td nowrap class="borderCell">Ср. t боя</td>' +
                    '<td nowrap class="borderCell">Ср. t игры</td>' +
                    '<td nowrap>∆t</td>' +
                '</tr>' +
            '</thead>' +
            '<tbody>' +
                '<tr>' +
                    '<td nowrap class="borderCell">' + convertTimeSec(data[nick]._session.duration) + '</td>' +
                    '<td nowrap class="borderCell">' + convertTimeSec(data[nick]._session.lifeTime) + '</td>' +
                    '<td nowrap class="borderCell">' + convertTimeSec((data[nick]._session.duration - data[nick]._session.lifeTime)) + '</td>' +
                    '<td nowrap class="borderCell">' + convertTimeSec((data[nick]._session.duration / data[nick]._session.battles)) + '</td>' +
                    '<td nowrap class="borderCell">' + convertTimeSec((data[nick]._session.lifeTime / data[nick]._session.battles)) + '</td>' +
                    '<td nowrap>' + convertTimeSec( ((data[nick]._session.duration - data[nick]._session.lifeTime) / data[nick]._session.battles) ) + '</td>' +
                '</tr>' +
            '</tbody>' +
        '</table>' +
        '<div style="clear: both;">'
    );
}

    /* > Вывод контента страницы: Доходность #tabProfit <
    =============================================================== */
var valArr = ''; // глобальная переменная - строка в которой будет хранится строка табл. для печати
function executeProfit(data) {
    // Обработать данные доходности по танкам
    var game = {}; // Пустой объект для хранения упорядоченных данных
    var propName; // Для хранения названия техники (для заполнения объекта)
    var createTime; // Для хранения знач. timestamp

    // Обход объекта data
    for (var key in data[nick].battles) { // переберем все объекты боев
        propName = data[nick].battles[key].vehicle.localShortName; // имя танка
        createTime = parseInt(data[nick].battles[key].battle.createTime); // метка времени (доп. приведена к Int)
        // Переопределение значения ничьи (с -1 на 0)
        (data[nick].battles[key].battle.result == -1) ?
            result = 0
        :
            result = data[nick].battles[key].battle.result;

        // Заполнение объекта данными из объекта data
        if( game.hasOwnProperty(propName) == false ) { //если еще нет такого свойства

            game[propName] = {}; // важно создать пустой объект
            // в начале создаться структура 'tankName' : { 'timeStamp' : { 'clearCredits' : val, ... } }
            game[propName][createTime] = { // занести новый объект (в объект) имя-значение метки времени
                'clearCredits' : data[nick].battles[key].accruals.pureCredits, // чистый доход
                'repeir' : data[nick].battles[key].accruals.repeirCost, // стоимость ремонта
                'allCredits' : data[nick].battles[key].accruals.credits, // всего начисленно
                'ammo' : data[nick].battles[key].accruals.ammoCost, // стоимость боекомплекта
                'damage' : data[nick].battles[key].personal.damageDealt, // урон
                'asist' : data[nick].battles[key].personal.asistRadio + data[nick].battles[key].personal.asistTrack, // asist
                'result' : result, // победа/поражение
                'allXp' : data[nick].battles[key].accruals.XP, // Всего опыта
                'armorBlocked' : data[nick].battles[key].personal.damageBlockedByArmor, // Blocked
                'wn8' : data[nick].battles[key].ratings.wn8, // wn8
            };
            game[propName].keyOrder = [createTime]; // добавим элемент timeStamp в массив
            // Заполнение объекта allResult:
            game[propName].allResult = {}; // важно создать пустой объект
            // важно, заполнение по пути (что бы не затереть данные выше через создание структурой)
            game[propName].allResult.itogClearCredits = data[nick].battles[key].accruals.pureCredits;
            game[propName].allResult.itogRepeir = data[nick].battles[key].accruals.repeirCost;
            game[propName].allResult.itogAllCredits = data[nick].battles[key].accruals.credits;
            game[propName].allResult.itogAmmo = data[nick].battles[key].accruals.ammoCost;
            game[propName].allResult.count = 1;

        } else { // если уже есть такое свойство (имя танка)
            game[propName][createTime] = { // занести новый объект (в объект) имя-значение метки времени
                'clearCredits' : data[nick].battles[key].accruals.pureCredits, // чистый доход
                'repeir' : data[nick].battles[key].accruals.repeirCost, // стоимость ремонта
                'allCredits' : data[nick].battles[key].accruals.credits, // всего начисленно
                'ammo' : data[nick].battles[key].accruals.ammoCost, // стоимость боекомплекта
                'damage' : data[nick].battles[key].personal.damageDealt, // урон
                'asist' : data[nick].battles[key].personal.asistRadio + data[nick].battles[key].personal.asistTrack, // asist
                'result' : result, // победа/поражение
                'allXp' : data[nick].battles[key].accruals.XP, // Всего опыта
                'armorBlocked' : data[nick].battles[key].personal.damageBlockedByArmor, // Blocked
                'wn8' : data[nick].battles[key].ratings.wn8, // wn8
            };
            game[propName].keyOrder.push(createTime); // добавим элемент timeStamp в массив
            // Заполнение объекта allResult:
            game[propName].allResult.itogClearCredits += data[nick].battles[key].accruals.pureCredits;
            game[propName].allResult.itogRepeir += data[nick].battles[key].accruals.repeirCost;
            game[propName].allResult.itogAllCredits += data[nick].battles[key].accruals.credits;
            game[propName].allResult.itogAmmo += data[nick].battles[key].accruals.ammoCost;
            game[propName].allResult.count += 1;
        }

    }

    // Осуществим сортировку массива ключей (для будущего сортированного вывода)
    for(var ob in game) {
        game[ob].keyOrder = game[ob].keyOrder.sort(); // отсортировать массивы ключей и переприсвоить
    }

    // Вывод данных:
    $('#contentBox').html(''); // Предварительная очистка блока
    for(var ob in game) { // Вывести обработанные данные доходности по танкам
    cellTabCred = ''; // очистить ячейку перед занесением данных
        $('#contentBox').append('<div class="titleTabCred">' + ob + '</div>'); // имя танка
        // Осуществим вывод данных из объекта game, согласно порядку следования ключей в массиве game.keyOrder
        // Организуем обход массива ключей (меток времени) game.keyOrder
        AR = game[ob].keyOrder; // Обозначим короткое имя массиву
        for(var i=0, elem_max_val = AR.length;  i<elem_max_val; i+=1) {
            var timeStamp = AR[i]; // обозначим временную метку
            // Вывод данных из объекта game:
            // Будем выводить из объекта данные согласно знач. из данного упорядоч. массива
            // Строки таблицы будут пристыковаться к прошлым строкам, а затем вставляются в prnTabCred() при печ. табл.
            cellTabCred +=
                '<tr>' +
                    prnGold(game[ob][timeStamp].clearCredits) + // Доход
                    '<td class="borderCell cellAllCred cellBorderCred">' + getNumF(game[ob][timeStamp].allCredits, 2) + '</td>' + // всего начисленно
                    '<td class="borderCell">' + getNumF(game[ob][timeStamp].ammo, 2) + '</td>' + // стоимость боекомплекта
                    '<td class="borderCell cellNoBorderCred">' + getNumF(game[ob][timeStamp].repeir, 2) + '</td>' + // Ремонт
                    '<td class="borderCell cellBorderCred">' + getNumF(game[ob][timeStamp].damage, 2) + '</td>' + // Урон
                    '<td class="borderCell">' + getNumF(game[ob][timeStamp].asist, 2) + '</td>' + // Asist
                    '<td class="borderCell">' + getNumF(game[ob][timeStamp].allXp, 2) + '</td>' + // Всего Опыта
                    '<td class="borderCell">' + getNumF(game[ob][timeStamp].armorBlocked, 2) + '</td>' + // Blocked
                    prnWn8(game[ob][timeStamp].wn8) + // WN8
                    '<td class="borderCell">' + getNumF(game[ob][timeStamp].result, 2) + '</td>' + // Результат
                    '<td class="сellTime">' + prnTime(new Date(timeStamp*1000 - msk*60*60*1000).toLocaleTimeString()) + '</td>' + // Время боя
                '</tr>';
        }
        prnTabCred(); // Распечатать таблицу

        // Вывести общие данные для текущего (ранее запомненного) объекта
        $('#contentBox').append(
            '<table align="center" cellpadding="5" cellspacing="0" class="tableItog credItog" style="display: none;">' +
            '<thead>' +
                '<tr>' +
                    '<td nowrap class="borderCell сellItogHead">Боев: ' +
                        game[ob].allResult.count +
                    '</td>' +
                    '<td nowrap class="borderCell">Доход</td>' +
                    '<td nowrap class="borderCell">Начисленно</td>' +
                    '<td nowrap class="borderCell">Боекомплект</td>' +
                    '<td nowrap>Ремонт</td>' + 
                '</tr>' +
            '</thead>' +
                '<tbody>' +
                    '<tr>' +
                        '<td class="borderCell"> Σ </td>' +
                        prnGold(game[ob].allResult.itogClearCredits) +
                        '<td class="borderCell">' +
                            getNumF(game[ob].allResult.itogAllCredits, 2) +
                        '</td>' +
                        '<td class="borderCell">' +
                            getNumF(game[ob].allResult.itogAmmo, 2) +
                        '</td>' +
                        '<td>' +
                            getNumF(game[ob].allResult.itogRepeir, 2) +
                        '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td class="borderCell">Среднее</td>' +
                        prnGold(game[ob].allResult.itogClearCredits/game[ob].allResult.count) +
                        '<td class="borderCell">' +
                            getNumF((game[ob].allResult.itogAllCredits/game[ob].allResult.count), 2) +
                        '</td>' +
                        '<td class="borderCell">' +
                            getNumF((game[ob].allResult.itogAmmo/game[ob].allResult.count), 2) +
                        '</td>' +
                        '<td>' +
                            getNumF((game[ob].allResult.itogRepeir/game[ob].allResult.count), 2) +
                        '</td>' +
                    '</tr>' +
                '</tbody>' +
            '</table><div class="closedTab">▲</div><div class="tabCredLine"></div>'
        );
    }

    /* Обработчик отображения таблиц по конкретному танку (изначально таблицы скрыты) */
    $('.titleTabCred').click( function() {
        var elem1 = $(this).next(); // Запомним таблицу 1
        var elem2 = $(this).next().next(); // Запомним таблицу 2
        var elem3 = $(this).next().next().next(); // Запомним кнопку свернуть
        if (elem1.is(':hidden')) { // (достаточно 1-го элем.) проверить не отображен элемент
            elem1.fadeIn(500); // показать
            elem2.fadeIn(500);
            elem3.fadeIn(500); elem3.css({'display' : 'inline-block'}); // показать и изменить св. display
            $(this).css({ // Сделать изменения для блока заголовка (блок по которому совершается клик)
                'border-bottom' : 'none',
                'background-color' : '#F0FFF0',
                'color' : 'brown'
            });
        } else { // если таблицы отображены
            elem1.fadeOut(200);
            elem2.fadeOut(200);
            elem3.fadeOut(200);
            $(this).css({
                'border-bottom' : '1px solid #EBEBEB',
                'background-color' : '#FDFFFD',
                'color' : '#333'
            });
        }
    });
    /* Функционал Свернуть */
    $('.closedTab').click( function() {
        var elem1 = $(this).prev(); // Запомним таблицу 2
        var elem2 = $(this).prev().prev(); // Запомним таблицу 1
        var elem3 = $(this).prev().prev().prev(); // Запомним заголовок (элем. .titleTabCred)
        elem1.fadeOut(200); // спрятать
        elem2.fadeOut(200);
        elem3.css({ // вернуть свойства
            'border-bottom' : '1px solid #EBEBEB',
            'background-color' : '#FDFFFD',
            'color' : '#333'
        });
        $(this).hide(); // спрятаться самому (тот блок по которому совершен клик)
    });

} // закрытие F: executeProfit()

/*
 * Ф-я печати таблицы Доходности по каждому танку.
 * Строки таблицы подставляются из переменной.
*/
var cellTabCred;
function prnTabCred() {
    $('#contentBox').append(
        '<table align="center" cellpadding="5" cellspacing="0" class="tabCred" style="display: none;">' +
            '<thead>' +
                '<tr>' +
                    '<td nowrap class="borderCell">Доход</td>' +
                    '<td nowrap class="borderCell">Начисленно</td>' +
                    '<td nowrap class="borderCell">Боекомплект</td>' +
                    '<td nowrap class="borderCell">Ремонт</td>' + 
                    '<td nowrap class="borderCell">Урон</td>' +
                    '<td nowrap class="borderCell">Asist</td>' +
                    '<td nowrap class="borderCell">Σ Опыта</td>' +
                    '<td nowrap class="borderCell">Blocked</td>' +
                    '<td nowrap class="borderCell">wn8</td>' +
                    '<td nowrap class="borderCell">Результат</td>' +
                    '<td>Время</td>' + 
                '</tr>' +
            '</thead>' +
            '<tbody>' +
                cellTabCred +
            '</tbody>' +
        '</table>'
    );
}

    /* > Вывод контента страницы: Графики #tabGraphics <
    =============================================================== */
function executeGraphics(data) {
    $('#contentBox').html(''); // Предварительная очистка блока
    //--> Добавление данных для построения графиков
    //--------------------------------------------------------------
    // Обработать данные доходности по танкам
    var game = {}; // Пустой объект для хранения упорядоченных данных
    var propName; // Для хранения названия техники (для заполнения объекта)
    var createTime; // Для хранения знач. timestamp

    // Обход объекта data
    for (var key in data[nick].battles) { // переберем все объекты боев
        propName = data[nick].battles[key].vehicle.localShortName; // имя танка
        createTime = parseInt(data[nick].battles[key].battle.createTime); // метка времени (доп. приведена к Int)

        // Заполнение объекта данными из объекта data
        if( game.hasOwnProperty(propName) == false ) { //если еще нет такого свойства
            game[propName] = {}; // важно создать пустой объект
            // в начале создаться структура 'tankName' : { 'timeStamp' : { 'damage' : val, ... } }
            game[propName][createTime] = { // занести новый объект (в объект) имя-значение метки времени
                'damage' : data[nick].battles[key].personal.damageDealt, // урон
                'gold' : data[nick].battles[key].accruals.pureCredits, // серебро
            };
            game[propName].keyOrder = [createTime]; // добавим элемент timeStamp в массив
        } else { // если уже есть такое свойство (имя танка)
            game[propName][createTime] = { // занести новый объект (в объект) имя-значение метки времени
                'damage' : data[nick].battles[key].personal.damageDealt, // урон
                'gold' : data[nick].battles[key].accruals.pureCredits, // серебро
            };
            game[propName].keyOrder.push(createTime); // добавим элемент timeStamp в массив
        }
    }
    //-> Формирование объекта по танкам с организацией массивов (знач. осей, для графика):
    // Осуществим сортировку массива ключей (для будущего сортированного вывода)
    for(var ob in game) {
        game[ob].keyOrder = game[ob].keyOrder.sort(); // отсортировать массивы ключей и переприсвоить
    }
    // объект который будет хранить упоряд. даные с массивами значений для построения графика
    // формат obj { 'tank_name' : { 'osX': arr[], 'osY': arr[] }, ... }
    var graphObj = {};
    for(var ob in game) {
        // Осуществим заполнение объекта graphObj из объекта game, согласно порядку следования ключей в массиве game.keyOrder
        // Организуем обход массива ключей (меток времени) game.keyOrder
        AR = game[ob].keyOrder; // Обозначим короткое имя массиву
        for(var i=0, elem_max_val = AR.length;  i<elem_max_val; i+=1) {
            var timeStamp = AR[i]; // обозначим временную метку
            // Заполнение объекта graphObj:
            if( graphObj.hasOwnProperty(ob) == false ) { //если еще нет такого свойства (назв. танка в объекте graphObj)
                //-> Добавление массивов значений:
                var n = i + 1; // Учет с первого боя ( а не с значения 0)
                // Шкала X: Счетчик
                var arrCountX = []; // массив значений для оси X (счетчик шагов)
                arrCountX.push(n); // добавим значение в массив
                // Шкала Y: Damage
                var arrDamageY = []; // массив значений для оси Y (значения для построения)
                arrDamageY.push(game[ob][timeStamp].damage); // добавим значение damage в массив
                // Шкала X: Счетчик+Время
                var arrCountTimeX = []; // массив значений для оси X (счетчик шагов+время)
                var strCountTimeX = n + ') ' + prnTime(new Date(timeStamp*1000 - msk*60*60*1000).toLocaleTimeString());
                arrCountTimeX.push(strCountTimeX); // добавим значение в массив
                // Шкала Y: Gold
                var arrGoldY = []; // массив значений для оси Y (значения для построения)
                arrGoldY.push(game[ob][timeStamp].gold); // добавим значение gold в массив
                //-> Заполнение объекта массивами:
                graphObj[ob] = { //добавим такое свойство объекту и заполним параметрами
                    'graphArrCountX' : arrCountX, // положим массив в объект (значение итераций)
                    'graphArrDamageY' : arrDamageY, // значение Damage
                    'graphArrCountTimeY' : arrCountTimeX, // значение Счетчик+Время
                    'graphArrGoldY' : arrGoldY, // значение Серебро
                };
            } else { // если уже есть такое свойство
                var n = i + 1;
                // Шкала X: Счетчик
                var arrCountX = graphObj[ob].graphArrCountX; // извлечем хранимый массив в graphObj и запомним в переменной
                arrCountX.push(n);
                graphObj[ob].graphArrCountX = arrCountX; // сохраним в объекте, значение добавленное в массив
                // Шкала Y: Damage
                var arrDamageY = graphObj[ob].graphArrDamageY;
                arrDamageY.push(game[ob][timeStamp].damage);
                graphObj[ob].graphArrDamageY = arrDamageY;
                // Шкала X: Счетчик+Время
                var arrCountTimeX = graphObj[ob].graphArrCountTimeY;
                var strCountTimeX = n + ') ' + prnTime(new Date(timeStamp*1000 - msk*60*60*1000).toLocaleTimeString());
                arrCountTimeX.push(strCountTimeX);
                graphObj[ob].graphArrCountTimeY = arrCountTimeX;
                // Шкала Y: Gold
                var arrGoldY = graphObj[ob].graphArrGoldY;
                arrGoldY.push(game[ob][timeStamp].gold);
                graphObj[ob].graphArrGoldY = arrGoldY;
            }
        }
    }
    //--> Вычисления для графика Урон и наложение прямой - средний урон
    //--------------------------------------------------------------
    var countCanvas = 1;
    var noGraph = true; // метка цикла для учета случая непостроения графиков
    for(var obj in graphObj) { // Вывести обработанные данные доходности по танкам
        if( graphObj[obj].graphArrCountX.length >= 5 ) { // не строить графики если боев меньше 5
            //-> (1) Вычислиение среднего значений для графика - прямой (средний урон)
            graphArrAverDamageY = [];
            graphArrAverDamageY = createAverArrGraph(graphObj[obj].graphArrDamageY);
            //-> (2) Вычислиение среднего значений для графика - прямой (средний доход)
            graphArrAverGoldY = [];
            graphArrAverGoldY = createAverArrGraph(graphObj[obj].graphArrGoldY);
            //-> Добавление блоков html canvas
            noGraph = false; // теперь сообщение 'нет графиков...' выведенно не будет (т.к. уже хотя бы 1-н будет)
            var canvasDamageId = "canvasDamageId" + countCanvas;
            var canvasGoldId = "canvasMoneyId" + countCanvas;
            countCanvas++;
            // Массивы для осей:
            var dataArr1 = graphObj[obj].graphArrCountTimeY;
            var dataArr2 = graphObj[obj].graphArrDamageY;
            var dataArr3 = graphArrAverDamageY; // ось х соотв. с dataArr1
            var dataArr4 = graphObj[obj].graphArrGoldY; // для 2-го графика - gold, ось х соотв. с dataArr1
            var dataArr5 = graphArrAverGoldY; // ось х соотв. с dataArr1
            // Печать шапки
            $('#contentBox').append(
                '<div class="graphTitleBox">' +
                    '<span class="graphTitleText1">' +
                        '<span class="graphTitleColor1"></span>' +
                        'Урон' +
                        '<span class="graphTitleColor2"></span>' +
                        'Средний урон' +
                    '</span>' +
                    '<span class="graphTitleText2">' +
                        '<span class="graphTitleColor3"></span>' +
                        'Доход' +
                        '<span class="graphTitleColor2"></span>' +
                        'Средний доход' +
                    '</span>' +
                '</div>'
            );
            // Печать графиков
            $('#contentBox').append(
                '<div class="graphBox">' +
                    '<div class="graphBox1">' +
                        '<canvas id="' + canvasDamageId + '"></canvas>' +
                        '<div class="graphArr1">' +
                            prnArrAver(dataArr3) +
                        '</div>' +
                    '</div>' +
                    '<div class="graphBox2">' +
                        '<canvas id="' + canvasGoldId + '"></canvas>' +
                        '<div class="graphArr1">' +
                            prnArrAver(dataArr5) +
                        '</div>' +
                    '</div><div style="clear: both;"></div>' +
                    '<div class="titleText5">' +
                        obj +
                    '</div><br>' +
                '</div>'
            );
            // График1: Задание опций для компонента Chart:
            var lineChartData1 = {
                // (ось X) значения из массива:
                labels : dataArr1,
                datasets : [
                    {
                        label: "-",
                        fillColor : "rgba(151,187,205,0.2)",
                        strokeColor : "rgba(151,187,205,1)",
                        pointColor : "rgba(151,187,205,1)",
                        pointStrokeColor : "#fff",
                        pointHighlightFill : "#fff",
                        pointHighlightStroke : "rgba(151,187,205,1)",
                        // (ось Y) значения из массива:
                        data : dataArr2,
                    },
                    {
                        label: "-",
                        fillColor : "rgba(151,187,205,0.2)",
                        strokeColor : "#FFDFDF", // цвет линии
                        pointColor : "#FFDFDF", // цвет точек
                        pointStrokeColor : "#fff",
                        pointHighlightFill : "#fff", // цвет внутри точки при наведении курсора
                        pointHighlightStroke : "#FFDFDF", // цвет ободка точки при наведении курсора
                        // (ось Y) значения из массива:
                        data : dataArr3
                    }
                ]
            };
            // Построение графиков
            var ctx1 = document.getElementById(canvasDamageId).getContext("2d");
            window.myLine = new Chart(ctx1).Line(lineChartData1, {
                responsive: true,
                datasetFill : false, //  не заполнять цветом ниже графика кривой
            });
            // График1: Задание опций для компонента Chart:
            var lineChartData2 = {
                // (ось X) значения из массива:
                labels : dataArr1,
                datasets : [
                    {
                        label: "-",
                        fillColor : "rgba(151,187,205,0.2)",
                        strokeColor : "#ABF8AB", // #89B843
                        pointColor : "#ABF8AB",
                        pointStrokeColor : "#fff",
                        pointHighlightFill : "#fff",
                        pointHighlightStroke : "#ABF8AB",
                        // (ось Y) значения из массива:
                        data : dataArr4,
                    },
                    {
                        label: "-",
                        fillColor : "rgba(151,187,205,0.2)",
                        strokeColor : "#FFDFDF", // цвет линии
                        pointColor : "#FFDFDF", // цвет точек
                        pointStrokeColor : "#fff",
                        pointHighlightFill : "#fff", // цвет внутри точки при наведении курсора
                        pointHighlightStroke : "#FFDFDF", // цвет ободка точки при наведении курсора
                        // (ось Y) значения из массива:
                        data : dataArr5
                    }
                ]
            };
            // Построение графиков
            var ctx2 = document.getElementById(canvasGoldId).getContext("2d");
            window.myLine = new Chart(ctx2).Line(lineChartData2, {
                responsive: true,
                datasetFill : false, //  не заполнять цветом ниже графика кривой
            });
        }
    }
    if(noGraph == true) { // Вывести сообщение если нет боев для построения
        $('#contentBox').append(
            'Нет боев для построения, для графика необходимо более 5ти боев на танк.'
        );
    }
} // закрытие F: executeGraphics()

    /* > Вывод контента страницы: Карты #tabMaps <
    =============================================================== */
function executeMaps(data) {
    // Обработка данных по картам
    var mapObj = {}; // Объект для заполнения картами
    for (var key in data[nick].battles) { // переберем все объекты боев
        // Заполним объект карт:
        propMapName = data[nick].battles[key].battle.mapName
        if( mapObj.hasOwnProperty(propMapName) == false ) { // если нет такого свойства
            mapObj[propMapName] = 1; // добавить новое свойство-карта объекта карт
        } else { // если уже есть такое свойство
            mapObj[propMapName] += 1; // увеличить счетчик карты
        }
    }
    // Распечатка Объекта содержащий карты
    $('#contentBox').html( // шапка таблицы к которой будет добавлятся строки таблицы
        '<table width="350px" align="center" cellpadding="5" cellspacing="0" class="tableMaps">' +
            '<thead>' +
                '<tr>' +
                    '<td class="borderCell">№</td>' + 
                    '<td class="borderCell">Карта</td>' + 
                    '<td>Боев</td>' + 
                '</tr>' +
            '</thead>' +
            '<tbody></tbody>' +
        '</table>'
    );
    var objMapCount = 1;
    for(var ob in mapObj) { // Вывод строк таблицы
        $('#contentBox table tbody').append( // вставим после <tbody>
            '<tr>' +
                '<td class="borderCell">' + objMapCount + '</td>' + // №
                '<td class="borderCell">' + ob + '</td>' + // Карта
                '<td>' + mapObj[ob] + '</td>' + // Боев
            '</tr>'
        );
        objMapCount++;
    }
}


});
/*
-----------------------------
Пример. Структуры данных для таблицы Общих данных:
    game = {
        'T-34' : {
            'damage' : 1250,
            ...
            'wn8' : 2300,
            'count' : 1,
        },
        'KB-1' : {
            'damage' : 1950,
            ...
            'wn8' : 1100,
            'count' : 2,
        },
        ...
    };
}
Пример. Структуры данных для таблицы Доходности (вариант 1):
    game = {

        'T-34' : {
            'goldClear' : [data.pureCredits1, ..., data.pureCreditsN],
            'repeir' : [data.repeirCost1, ..., data.repeirCostN],
            ...
        },

        'KB-1' : {

        },
        ...

    };

    Название танка:
    - № Боя
    - Чистая прибыль за бой
    - Стоимость ремонта
    - Трата на БК
    - Всего начисленно

Пример. Структуры данных для таблицы Доходности (вариант 2):
    game = {

        'T-34' : {
                'data.createTime' : {
                    'goldClear' : 'data.pureCredits',
                    'goldRepeir' : 'data.repeirCost',
                    ...
                }
                'data.createTime' : {
                    'goldClear' : 'data.pureCredits',
                    'goldRepeir' : 'data.repeirCost',
                    ...
                }
            ...
        },

        'KB-1' : {

        },
        ...

    };

*/