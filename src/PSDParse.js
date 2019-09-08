var service = {
  createLayerlist: createLayerlist,
  createFontlist: createFontlist
};

module.exports = service;

function createLayerlist(a) {
  var item = "";

  if (a["children"].length) {
    a["children"].forEach(function(node) {
      if (node["children"].length > 0) {
        //
        item =
          item +
          '<li><span class="fa-li"><i class="fas fa-folder"></i></span>' +
          node["name"] +
          '<ul class="fa-ul">' +
          createLayerlist(node) +
          "</ul></li>";
      } else {
        item =
          item +
          '<li><span class="fa-li"><i class="far fa-file"></i></span>' +
          node["name"] +
          "</li>";
      }
    });
  }
  return item;
}

function createFontlist(a) {
  var fontlist = "";
  if (Array.isArray(a)) {
    if (a.length) {
      a.forEach(function(node) {
        fontlist = fontlist + "<li>" + node + "</li>";
      });
    }
  }

  if (fontlist != "") {
    "<ul>" + fontlist + "</ul>";
  } else {
    fontlist = "---";
  }

  return fontlist;
}
