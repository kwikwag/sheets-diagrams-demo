/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Code based on Google code available at
 * https://github.com/googleworkspace/apps-script-samples/blob/main/wasm/image-add-on
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createAddonMenu()
      .addItem('Insert Venn diagram', 'insertVennDiagram')
      .addToUi();
}

const DIAGRAM_TYPES = {
  "venn": generateVennImage_
};

async function insertVennDiagram() {
  installTrigger();
  const range = SpreadsheetApp.getActiveRange();
  return addBoundDiagram_(range, "venn");
}

/**
 * @param {SpreadsheetApp.Range} range
 */
async function addBoundDiagram_(range, diagramType) {
  const sheet = range.getSheet();
  const uniqueId = (new Date()).valueOf();
  const alt = `bound-diagram#${diagramType}#${uniqueId}#${sheet.getSheetId()}#${range.getA1Notation()}`;
  const image = await DIAGRAM_TYPES[diagramType](range, alt);
  const overGridImage = sheet.insertImage(image, range.getLastColumn() + 1, range.getRow());
  imageUpdateWorkaround_();

  const cache = CacheService.getDocumentCache();
  cache.remove(DATABASE_CACHE_KEY);

  overGridImage.setAltTextDescription(image.getName());
  return overGridImage;
}

/**
 * Thanks to https://stackoverflow.com/a/67916559
 * @param {{startRow: number, startColumn: number, endRow: number, endColumn: number}} e1
 * @param {{startRow: number, startColumn: number, endRow: number, endColumn: number}} e2
 **/
function rangesIntersect_(e1, e2) {
  // if (r1.getSheet().getIndex() != r2.getSheet().getIndex()) return false;
  const [sr1, sc1, er1, ec1] = e1;
  const [sr2, sc2, er2, ec2] = e2;
  if (er1 < sr2) return false;
  if (er2 < sr1) return false;
  if (ec1 < sc2) return false;
  if (ec2 < sc1) return false;
  return true;
}

function rangeToRangeExtent_(range) {
  return [range.getRow(), range.getColumn(), range.getLastRow(), range.getLastColumn()];
}

/**
 * @param {String} a1Notation
 **/
function a1NotationToRangeExtent_(a1Notation) {
  const colToNum = col => col.split('').reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);

  const match = a1Notation.match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
  if (!match) throw new Error('Invalid A1 notation');

  const [, startCol, startRow, endCol, endRow] = match;

  return [parseInt(startRow), colToNum(startCol), parseInt(endRow || startRow), colToNum(endCol || startCol)];
}

const DATABASE_CACHE_KEY = 'database';

/**
 * The event handler triggered when editing the spreadsheet.
 * @param {Event} e The onEdit event.
 * @see https://developers.google.com/apps-script/guides/triggers#onedite
 */
async function onEdit(e) {
  const sheet = e.range.getSheet();

  let boundDiagrams;
  let boundDiagramMap;

  const needBoundDiagrams = () => {
    if (boundDiagrams !== undefined) { return; }
    const spreadsheet = sheet.getParent();
    boundDiagrams = getBoundDiagrams_(spreadsheet);
    boundDiagramMap = Object.fromEntries(boundDiagrams.map((o) => [o.alt, o]));
  };

  const cache = CacheService.getDocumentCache();
  const cachedDatabase = cache.get(DATABASE_CACHE_KEY);
  let database;
  if (cachedDatabase) {
    console.log("Using cache");
    database = JSON.parse(cachedDatabase);
  }
  else {
    needBoundDiagrams();
    database = boundDiagrams.map(({alt, a1Notation, sheetId}) => {
      const rangeExtent = a1NotationToRangeExtent_(a1Notation);
      return {alt, sheetId, rangeExtent};
    });
    cache.put('database', JSON.stringify(database));
  }

  const editRangeExtent = rangeToRangeExtent_(e.range);
  const editSheetId = sheet.getSheetId();
  const matches = database.filter(({rangeExtent, sheetId}) => {
    if (sheetId !== editSheetId) { return false; }
    return rangesIntersect_(editRangeExtent, rangeExtent);
  });
  if (matches.length === 0) {
    console.log("No matches");
    return;
  }

  needBoundDiagrams();

  const relevantBoundDiagrams = matches.map((match) => boundDiagramMap[match.alt]).filter((o) => o !== undefined);

  console.log(`Updating ${relevantBoundDiagrams.length} images`);
  const updates = await Promise.all(relevantBoundDiagrams.map(async ({overGridImage, diagramType, alt, a1Notation}) => {
    const range = sheet.getRange(a1Notation);
    const newImageBlob = await DIAGRAM_TYPES[diagramType](range, alt);
    const width = overGridImage.getWidth();
    const height = overGridImage.getHeight();
    return {overGridImage, alt, newImageBlob, width, height};
  }));
  console.log("Done with preparing images, applying updates...");
  for (const {overGridImage, newImageBlob} of updates) {
    overGridImage.replace(newImageBlob);
  }
  imageUpdateWorkaround_();

  for (const {overGridImage, alt, width, height} of updates) {
    overGridImage.setAltTextDescription(alt);
    overGridImage.setWidth(width);
    overGridImage.setHeight(height);
  }
}


/**
 * @param {SpreadsheetApp.Range} range
 */
async function generateVennImage_(range, alt) {
  // TODO : use something like getDataRegion() to contract the range without going through all cells here
  const table = range.getValues().map((row) => row.slice(0, 2)).filter((row) => row.some((cell) => cell && (cell.length > 0)));
  const {labels, names} = vennLabelsNames_(table);
  if (names.length < 2 || names.length > 6) {
    throw new Error("Can only create Venn diagrams of 2 to 6 sets.");
  }
  const svgString = vennSvg_(labels, names);
  console.log({labels, names, svgString});
  const pngBytes = await svgToPng_(svgString);
  const blob = Utilities.newBlob(pngBytes, 'image/png', alt);
  return blob;
}

/**
 * @param {SpreadsheetApp.Sheet|SpreadsheetApp.Spreadsheet} sheet
 */
function getBoundDiagrams_(sheet) {
  return getBoundOverGridImages_(sheet).map((o) => {
    const {alt} = o;
    return {...o, ...parseOverGridImageAlt_(alt)};
  });
}

/**
 * @param {SpreadsheetApp.Sheet|SpreadsheetApp.Spreadsheet} sheet
 */
function getBoundOverGridImages_(sheet) {
  return sheet.getImages().
    map((overGridImage) => ({overGridImage, alt: overGridImage.getAltTextDescription()})).
    filter(({alt}) => alt && alt.startsWith("bound-diagram#"));
}

/**
 * @param {String} sheet
 */
function parseOverGridImageAlt_(alt) {
  const [prefix, diagramType, index, sheetId, a1Notation] = alt.split('#', 5);
  if (diagramType !== 'venn') {
    return {};
  }
  return {sheetId: parseInt(sheetId), a1Notation, diagramType};
}

function imageUpdateWorkaround_() {
  SpreadsheetApp.flush();
  Utilities.sleep(2500);
}

async function onEditFromTrigger(e) {
  return onEdit(e);
}


function isTriggerInstalled_(spreadsheetId) {
  const triggers = ScriptApp.getProjectTriggers();
  const existingTriggers = triggers.filter((trigger) => (
    trigger.getTriggerSourceId() == spreadsheetId &&
    trigger.getEventType() == ScriptApp.EventType.ON_EDIT
  ));
  return existingTriggers.length != 0;
}

function installTriggerCallback(e) {
  const spreadsheetId = e.parameters.spreadsheetId;
  return installTriggerWithSpreadsheetId_(spreadsheetId);
}

function getInstallTriggerCallbackURL_(spreadsheetId) {
  const baseUrl = `https://script.google.com/macros/d/${ScriptApp.getScriptId()}`;
  const state = ScriptApp.newStateToken()
                        .withMethod("installTriggerCallback")
                        .withTimeout(120)
                        .withArgument("spreadsheetId", spreadsheetId)
                        .createToken();
  const url = `${baseUrl}/usercallback?state=${encodeURIComponent(state)}`;
  return url;
}

function installTriggerWithSpreadsheetId_(spreadsheetId) {
  if (isTriggerInstalled_(spreadsheetId)) {
    return;
  }
  ScriptApp.newTrigger("onEditFromTrigger").forSpreadsheet(spreadsheetId).onEdit().create();
}

function installTrigger() {
  const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  if (isTriggerInstalled_(spreadsheetId)) {
    return;
  }
  const url = getInstallTriggerCallbackURL_(spreadsheetId);
  const htmlOutput = HtmlService.createHtmlOutput(`
    <div>This is the first time the add-on has been run on this document.</div>
    <div>Please wait while the add-on is installing...</div>
    <iframe src="${url}" id="callback" style="visibility: hidden;"></iframe>
    <script>
        document.getElementById('callback').onload = function() {
          google.script.host.close();
        }
    </script>
  `);
  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(htmlOutput, "Installing...");
}
