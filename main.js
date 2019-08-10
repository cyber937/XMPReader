const { app, BrowserWindow } = require("electron");
const { ipcMain, dialog } = require("electron");
const dom = require("xmldom").DOMParser;
const serializer = require("xmldom").XMLSerializer;
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
      filters: [{ name: "Images", extensions: ["psd", "ai"] }],
      properties: ["openFile", "openDirectory"]
    },
    files => {
      if (files) {
        event.sender.send("selected-directory", files);
        const filepath = files[0];

        // Get XMP Data from xmpaddon.
        const xmpString = xmpaddon.xmpRead(filepath);

        // Parse from XMP String
        const doc = new dom().parseFromString(xmpString);

        // Extract "rdf:RDF" node
        const rdfElement = doc.getElementsByTagName("rdf:RDF")[0];
        const result = new serializer().serializeToString(rdfElement);

        // Convert JSON String from XML
        const jsonObj = convert.xml2js(result, {
          compact: true,
          spaces: 4
        });
        const metaObj = jsonObj["rdf:RDF"]["rdf:Description"];

        // Find Creator Tool Informaiton
        const creatorToolInfo = metaObj["xmp:CreatorTool"]["_text"];

        console.log(creatorToolInfo);

        var propertyDic = {};

        // Name
        var filename = filepath.replace(/^.*[\\\/]/, "");
        propertyDic["name"] = filename;

        // Find Photoshop file or Illustrator file

        if (creatorToolInfo.includes("Photoshop")) {
          console.log("This is Photoshop File.");

          // Color Profile

          if ("photoshop:ICCProfile" in metaObj) {
            propertyDic["colorProfile"] =
              metaObj["photoshop:ICCProfile"]["_text"];
          } else {
            propertyDic["colorProfile"] = "---";
          }

          // Document Width

          if ("exif:PixelXDimension" in metaObj) {
            propertyDic["width"] =
              metaObj["exif:PixelXDimension"]["_text"] + " px";
          } else {
            propertyDic["width"] = "---";
          }

          // Document Height

          if ("exif:PixelYDimension" in metaObj) {
            propertyDic["height"] =
              metaObj["exif:PixelYDimension"]["_text"] + " px";
          } else {
            propertyDic["height"] = "---";
          }

          // DPI

          if ("tiff:XResolution" in metaObj) {
            const resolution = metaObj["tiff:XResolution"]["_text"];
            const resolutionArr = resolution.split("/");
            const resolutionNumFloat = parseFloat(resolutionArr[0]);
            const resolutionDenFloat = parseFloat(resolutionArr[1]);
            const dpiFloat = resolutionNumFloat / resolutionDenFloat;
            propertyDic["dpi"] = dpiFloat.toString();
          } else {
            propertyDic["dpi"] = "---";
          }

          // Layers

          var psd = PSD.fromFile(filepath);
          psd.parse();

          var treelist =
            '<ul class="fa-ul">' +
            psdparse.createTreelist(psd.tree()) +
            "</ul>";
          propertyDic["layer"] = treelist;

          // Fonts
          propertyDic["fonts"] = psdparse.ctreatTextlist(psd.tree());
        } else if (creatorToolInfo.includes("Illustrator")) {
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
