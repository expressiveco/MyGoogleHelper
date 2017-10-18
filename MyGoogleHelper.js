(function(){

function getScript(src, callback) {
  var s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.onreadystatechange = s.onload = function() {
    if (!callback.done && (!s.readyState || /loaded|complete/.test(s.readyState))) {
      callback.done = true;
      callback();
    }
  };
  document.querySelector('head').appendChild(s);
}
function parseQuery(qstr) {
    var query = {};
    var a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
}
function addCSSRule(cssRule)
{
  $('<style>')
    .prop('type', 'text/css')
    .html(cssRule)
    .appendTo('head');
}
var docCookies = {
  getItem: function (sKey) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};

  getScript('https://code.jquery.com/jquery-3.2.1.min.js', init);

  var hilightElem, unHilightElem;
  function initUI()
  {
    $('.sbtc').prepend('<div id="MyGoogleHelper"><label for="MyGoogleHelperInput">URL: </label><input type="text" id="MyGoogleHelperInput" style="width:150px" title="Press <Enter> to search." /> <div class="info"></div></div>');
    addCSSRule('#MyGoogleHelper { margin:5px; float:right; } ' +
               '#MyGoogleHelper .info { margin-top: 4px; }' +
               '.hilight-url { background-color: yellow; }');
  }
  function init()
  {
    initUI();

    var hilightClass = 'hilight-url';
    hilightElem = function($elem)
    {
      $elem.addClass(hilightClass);
    }
    unHilightElem = function($elem)
    {
      $elem.removeClass(hilightClass);
    }

    var $input = $('#MyGoogleHelperInput'), $info = $('#MyGoogleHelper .info');
    loadStoredKeyword($input, $info);

    $input.on('keypress', function(e) {
        if (e.which == 13) {
          showResults($input.val(), $info);
          return false;
        }
    });
  }
  function showResults(keyword, $info)
  {
      updateStoredKeyword(keyword);
      unHiLightUrls();
      var results = findResultContainers(getAllResultContainers(), keyword);
      hiLightUrls(results);
      showResultInfo(results, $info);
  }
  function loadStoredKeyword($input, $info)
  {
    var keyword = $.trim(getStoredKeyword());
    $input.val(keyword);
    if (keyword)
      showResults($input.val(), $info);
  }
/*
#rso .g .rc				      - Result Container
#rso .g .rc > .r 		    - Title
#rso .g .rc > .s 	    	- Body
#rso .g .rc > .s cite 	- Url
#rso .g .rc > .s .st 	  - Description
*/
  function getResultTitle($resultCon)
  {
    return $resultCon.find('> .r');
  }
  function getAllResultContainers()
  {
    return $('#rso .g .rc');
  }
  function getAllResultTitles()
  {
    return getResultTitle(getAllResultContainers());
  }
  function getAllResultUrls()
  {
    return getAllResultContainers().find('> .s cite');
  }
  function getCurrentPageResultCount()
  {
    return getAllResultContainers().length;
  }
  function getParam($elem)
  {
    var param = parseQuery($elem.attr('href') || 'num=');
    // `start` is zero-based. 0-9, 10-19, ...
    return {
      start: parseInt(param.start, 10) || 0,
      num: parseInt(param.num, 10) || 0
    };
  }
  function getResultCountPerPage()
  {
    var cnt, currPage = getCurrentPage();
    var paramNext = getParam($('#pnnext')), paramPrev;
    if (paramNext.start)
    {
      cnt = paramNext.start / currPage;
    }
    else
    {
      paramPrev = getParam($('#pnprev'));
      if (paramPrev.start > 0)
        cnt = paramPrev.start / (currPage - 2);
    }
    return cnt || paramPrev.num || paramNext.num || 10;
  }
  function getCurrentPage()
  {
    var page = $('#navcnt .cur').text();

    return parseInt(page, 10) || 1;
  }
  function unHiLightUrls()
  {
    unHilightElem(getAllResultTitles());
  }
  function hiLightUrls(results)
  {
    $.each(results, function() {
        hilightElem(getResultTitle(this.resultCon));
    });
  }
  function findResultContainers($allResultCons, keyword)
  {
    return $allResultCons.map(function(pos, resultCon) {
      var $resultCon = $(resultCon);
      if ($resultCon.text().indexOf(keyword) != -1) {
        return({resultCon: $resultCon, pos: pos+1});
      }
    });
  }
  function getResultPositionInfo(results, countPerPage, currentPage, currentPageResultCount)
  {
    var posInfo, pageStartPos = countPerPage*(currentPage-1), resultCnt = results.length;
    if (resultCnt == 0)
      return;

    if (resultCnt == currentPageResultCount)
      posInfo = "All positions";
    else
      posInfo = $.map(results, function(result) { return pageStartPos + result.pos; }).join(', ');

    return posInfo;
  }
  function getResultInfo(results)
  {
      var countPerPage = getResultCountPerPage(),
          currentPage = getCurrentPage(), currentPageResultCount = getCurrentPageResultCount(),
          info, posInfo = getResultPositionInfo(results, countPerPage, currentPage, currentPageResultCount);
      if (posInfo)
        info = results.length + ' results. Positions: ' + posInfo;
      else
        info = 'Not found.';
     return info;
  }
  function showResultInfo(results, $info)
  {
    $info.text(getResultInfo(results, $info));
  }
  function getStoredKeyword()
  {
    return docCookies.getItem('MyGoogleHelper');
  }
  function updateStoredKeyword(keyword)
  {
    docCookies.setItem('MyGoogleHelper', keyword);
  }
}());
