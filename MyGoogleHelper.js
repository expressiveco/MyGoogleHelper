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
(function(){

  function initUI()
  {
    $('.sbtc').prepend('<div id="MyGoogleHelper"><label for="inputUrl">URL: </label><input type="text" id="inputUrl" style="width:150px" /><span><span></div>');    
    addCSSRule("#MyGoogleHelper { margin:10px;float:right; } " +
               ".hilight-url { background-color: yellow; }");
  }
  function init()
  {
    initUI();

    var $input = $('#inputUrl'), $info = $('#MyGoogleHelper span');
    var keyword = $.trim(getStoredKeyword());
    $input.val(keyword);
    if (keyword)
      showResults($input.val(), $info);

    $input.on('keypress', function(e) {
        if (e.which == 13) {
          showResults($input.val(), $info);
          return false;
        }
    });
  }
  getScript('https://code.jquery.com/jquery-3.2.1.min.js', init);

function showResults(keyword, $info)
  {
      updateStoredKeyword(keyword);

      var results = findResultElems(getResultElems(), keyword);
      unHiLightUrls();
      hiLightUrls(results);

      $info.text(getInfo(results));
  }
function getResultContainers()
{
  return $('.srg .g .r');
}
function getResultElems()
  {
    return $('.srg .g cite');
  }
function findResultElems($elems, keyword)
{
  var pos = 0, results = [];
  $elems.each(function() {
    var $elem = $(this);
    pos++;
    if ($elem.text().indexOf(keyword) != -1) {
      results.push({elem: $elem, pos: pos});
    }
  });
  return results;
}
function unHiLightUrls()
{
  getResultContainers().removeClass('hilight-url');
}
function getResultContainer($elem)
  {
    return $elem.parents('.g').find('.r');
  }
function hiLightUrls(results, keyword)
{
  $.each(results, function() {
      getResultContainer($(this.elem)).addClass('hilight-url');
  });
}
function getInfo(results)
{
  var info;
  if (results.length > 0)
    info = results.length + ' results. Positions: ' + $.map(results, function(result) { return result.pos; }).join(', ');
  else
    info = 'Not found.';
  return info;
}
  
function getStoredKeyword()
  {
    return docCookies.getItem("MyGoogleHelper");
  }
  
function updateStoredKeyword(keyword)
  {
    docCookies.setItem("MyGoogleHelper", keyword);
  }

}());
