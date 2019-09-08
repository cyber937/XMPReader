var service = {
  checkChildren: checkChildren,
  createTreelist: createTreelist,
  ctreatTextlist: ctreatTextlist,
  createTreelistFromJSONObj: createTreelistFromJSONObj,
  createFontlist: createFontlist
};

module.exports = service;

function checkChildren(a, item) {
  if (a.hasChildren()) {
    a.children().forEach(function(node) {
      var child;
      if (node.hasChildren()) {
        child = {
          name: node.get("name"),
          children: []
        };
      } else {
        child = {
          name: node.get("name")
        };
      }

      item.children.push(child);
      checkChildren(node, child);
    });
  }
}

function createTreelistFromJSONObj(a) {
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
          createTreelistFromJSONObj(node) +
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

function createTreelist(a) {
  var item = "";
  if (a.hasChildren()) {
    a.children().forEach(function(node) {
      if (node.hasChildren()) {
        item =
          item +
          '<li><span class="fa-li"><i class="fas fa-folder"></i></span>' +
          node.get("name") +
          '<ul class="fa-ul">' +
          createTreelist(node) +
          "</ul></li>";
      } else {
        item =
          item +
          '<li><span class="fa-li"><i class="far fa-file"></i></span>' +
          node.get("name") +
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

function ctreatTextlist(a) {
  var type,
    fonts = [],
    fontlist = "";
  a.descendants().forEach(function(node) {
    type = node.get("typeTool");
    if (!type) return;
    fonts = fonts.concat(type.fonts()[0]);
  });
  fonts.forEach(function(node) {
    fontlist = fontlist + "<li>" + node + "</li>";
  });

  if (fontlist != "") {
    "<ul>" + fontlist + "</ul>";
  } else {
    fontlist = "---";
  }

  return fontlist;
}
