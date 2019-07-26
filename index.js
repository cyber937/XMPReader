const { ipcRenderer } = require("electron");
const selectDirBtn = document.getElementById("select-directory");

const attributeTable = document.getElementById("attribute-table");

selectDirBtn.addEventListener("click", event => {
  ipcRenderer.send("open-file-dialog");
});

ipcRenderer.on("selected-directory", (event, path) => {
  document.getElementById("selected-file").innerHTML = `You selected: ${path}`;
});

ipcRenderer.on("attribute-table", (event, propertyDic) => {
  document.getElementById("attribute-table").rows[0].cells[1].innerHTML = `${
    propertyDic["height"]
  }`;
  document.getElementById("attribute-table").rows[1].cells[1].innerHTML = `${
    propertyDic["width"]
  }`;
  document.getElementById("attribute-table").rows[2].cells[1].innerHTML = `${
    propertyDic["colorProfile"]
  }`;
});
