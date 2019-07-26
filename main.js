const { app, BrowserWindow } = require("electron");

const { ipcMain, dialog } = require("electron");

const dom = require("xmldom").DOMParser;
const serializer = require("xmldom").XMLSerializer;

const xmpaddon = require("./xmpaddon/build/Release/xmpaddon");

var convert = require("xml-js");

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
  win.webContents.openDevTools();
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
      properties: ["openFile", "openDirectory"]
    },
    files => {
      if (files) {
        //console.log(files);

        event.sender.send("selected-directory", files);

        // Get XMP Data from xmpaddon.
        const xmpString = xmpaddon.xmpRead(files[0]);

        // Parse from XMP String
        const doc = new dom().parseFromString(xmpString);

        // Extract "rdf:RDF" node
        const rdfElement = doc.getElementsByTagName("rdf:RDF")[0];
        const result = new serializer().serializeToString(rdfElement);

        // Convert JSON Data from XML
        const jsonData = convert.xml2json(result, { compact: true, spaces: 4 });

        //console.log(jsonData);

        // Creat JSON Object
        jsonObj = JSON.parse(jsonData);

        // Find Creator Tool Informaiton
        const creatorToolInfo =
          jsonObj["rdf:RDF"]["rdf:Description"]["_attributes"][
            "xmp:CreatorTool"
          ];

        var documentWidth;
        var documentHeight;
        var colorProfile;

        var propertyDic = {};

        if (creatorToolInfo.includes("Photoshop")) {
          //console.log("This is Photoshop File.");

          propertyDic["width"] =
            jsonObj["rdf:RDF"]["rdf:Description"]["_attributes"][
              "exif:PixelXDimension"
            ];
          propertyDic["height"] =
            jsonObj["rdf:RDF"]["rdf:Description"]["_attributes"][
              "exif:PixelYDimension"
            ];
          propertyDic["colorProfile"] =
            jsonObj["rdf:RDF"]["rdf:Description"]["_attributes"][
              "photoshop:ICCProfile"
            ];
          event.sender.send("attribute-table", propertyDic);
        } else if (creatorToolInfo.includes("Illustrator")) {
          console.log("This is Illustrator File.");
        }
      }
    }
  );
});
