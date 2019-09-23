const { app, BrowserWindow } = require("electron");
const { ipcMain, dialog } = require("electron");
const dom = require("xmldom").DOMParser;
const serializer = require("xmldom").XMLSerializer;
const PSDParserAddon = require("./PSDParserAddon/build/Release/PSDParserAddon");
const xmpaddon = require("./xmpaddon/build/Release/xmpaddon");
var convert = require("xml-js");
var PSD = require("psd");
var psdparse = require("./src/PSDParse");

let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  win.loadFile("index.html");

  // Open the DevTools.
  //win.webContents.openDevTools();
  // Emitted when the window is closed.
  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on("open-file-dialog", event => {
  dialog.showOpenDialog(
    {
      filters: [{ name: "Images", extensions: ["psd", "psb", "ai"] }],
      properties: ["openFile", "openDirectory"]
    },
    files => {
      if (files) {
        event.sender.send("selected-directory", files);
        const filepath = files[0];

        const fileExtension = filepath.split(".").pop();

        var propertyDic = {};

        // Name
        var filename = filepath.replace(/^.*[\\\/]/, "");
        propertyDic["name"] = filename;

        // Find Photoshop file or Illustrator file

        if (fileExtension == "psd" || fileExtension == "psb") {
          console.log("This is Photoshop File.");

          const psdJSONString = PSDParserAddon.readPSD(filepath);

          console.log(psdJSONString);

          var obj = JSON.parse(psdJSONString);

          // Color Profile

          if (obj.hasOwnProperty("ICC Profile")) {
            propertyDic["colorProfile"] = obj["ICC Profile"];
          } else {
            propertyDic["colorProfile"] = "---";
          }

          // Document Width

          if (obj.hasOwnProperty("width")) {
            propertyDic["width"] = obj["width"] + " px";
          } else {
            propertyDic["width"] = "---";
          }

          // Document Height

          if (obj.hasOwnProperty("height")) {
            propertyDic["height"] = obj["height"] + " px";
          } else {
            propertyDic["height"] = "---";
          }

          // // DPI

          if (obj.hasOwnProperty("DPI")) {
            propertyDic["dpi"] = obj["DPI"];
          } else {
            propertyDic["dpi"] = "---";
          }

          // Layers

          var layers = obj["layers"];

          var treelistNew =
            '<ul class="fa-ul">' + psdparse.createLayerlist(layers) + "</ul>";

          propertyDic["layer"] = treelistNew;

          // Fonts

          var fonts = obj["fonts"];
          propertyDic["fonts"] = psdparse.createFontlist(fonts);
        } else {
          // Get XMP Data from xmpaddon.
          const xmpString = xmpaddon.xmpRead(filepath);

          //Parse from XMP String
          const doc = new dom().parseFromString(xmpString);

          //Extract "rdf:RDF" node
          const rdfElement = doc.getElementsByTagName("rdf:RDF")[0];
          const result = new serializer().serializeToString(rdfElement);

          //Convert JSON String from XML
          const jsonObj = convert.xml2js(result, {
            compact: true,
            spaces: 4
          });
          const metaObj = jsonObj["rdf:RDF"]["rdf:Description"];

          console.log("This is illustrator File.");

          var unit = "";
          if ("xmpTPg:MaxPageSize" in metaObj) {
            unit = propertyDic["colorProfile"] =
              metaObj["xmpTPg:MaxPageSize"]["stDim:unit"]["_text"];
          }

          if ("xmpTPg:MaxPageSize" in metaObj) {
            propertyDic["width"] =
              metaObj["xmpTPg:MaxPageSize"]["stDim:w"]["_text"] + " " + unit;
          } else {
            propertyDic["width"] = "---";
          }

          if ("xmpTPg:MaxPageSize" in metaObj) {
            propertyDic["height"] =
              metaObj["xmpTPg:MaxPageSize"]["stDim:h"]["_text"] + " " + unit;
          } else {
            propertyDic["height"] = "---";
          }

          propertyDic["colorProfile"] = "---";
          propertyDic["dpi"] = "---";
          propertyDic["layer"] = "---";
          propertyDic["fonts"] = "---";
        }
        event.sender.send("attribute-table", propertyDic);
      }
    }
  );
});
