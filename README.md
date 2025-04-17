# Venn diagram add-on for Google Sheets

This is a proof-of-concept for a Google Sheets add-on that interactively generates
[Venn diagrams](https://en.wikipedia.org/wiki/Venn_diagram).

It includes these non-trivial features:

  - `svgToPng_` function, that uses the Rust [resvg][resvg] SVG renderer compiled to WASM.
  - Renders Venn diagrams based on SVG templates (originating from [pyvenn][pyvenn]).
  - Auto-update of an image (diagram) when any cell in the range of data it relies on gets
    modified.
  - Installs a Google Sheets `onEdit` trigger from a standalone script.
  - Partial workaround for `OverGridImage.replace(...).setXXX(...)` bug causing images
    to arbitrarily disappear. 

### Credits

The code was based on Google's Justin Poehnelt's excellent [example on using Rust and WASM on Google Apps Script][wasm-image-add-on].
The SVG templates were adapted from [pyvenn][pyvenn].

## Usage

The add-on reads a range of two columns. The first column is expected to be the item
identifiers, and the second the names of the sets those items belong to. It produces a Venn
diagram showing of the counts of items in each intersection of each of the sets.

After you set up the add on, select a consecutive two-column range and choose 'Extensions' >
'Title of your add-on' > 'Insert Venn diagram'. 

[![screencast](https://github.com/user-attachments/assets/cff5070e-2007-4aa4-9889-4555de1e6284)](https://github.com/user-attachments/assets/ce0f37f1-c05d-4ddb-8eff-908504c45c43)


## Set up

### Initialize

  1. `npm i`
  1. [Follow the Clasp guide to create a Google Cloud project](https://github.com/google/clasp?tab=readme-ov-file#bring-your-own-projectcredentials).
     Though, you don't need to enable any API beyond the Apps Script API.
     Also, you can use `npx clasp login ...` if you'd like to avoid installing Clasp globally.
  1. `npx clasp create --title "Title of your add-on"`

### Build and deploy

`npm run deploy`, or `npm run deploy --watch` for continous deployment.

Then, create a deployment for your add-on. If you use Clasp to do this, you might need to enable
those extra APIs they mention. I used an Test Deployment as an Editor Add-on, with 'Config' set
to 'Installed for current user' (`AuthMode.None`).

## To do

  - Proper error handling.
  - Split components into subpackages (e.g. create a `venn-svg` package).
  - UI: user guide, add settings for data source and diagram appearence.
  - Interacting with Pivot tables, too.
  - Add an option for a universal set.
  - Submit bug report regarding the `OverGridImage.replace()` issue.
    There are actually some bugs around this in the Sheets web UI as well.
    and perhaps even adding some more types of diagrams.


## Which scopes are used and why

All scopes are prefixed with `https://www.googleapis.com/auth/`.

| Scope | Reason |
|  ---  |  ---  |
| `spreadsheets.currentonly` | Read the data and add the diagram  |
| `script.scriptapp` | Install the `onEdit` trigger* |
| `script.container.ui` | Install the `onEdit` trigger** |


&ast; This is because (AFAIK) an `onEdit` 'Simple Trigger` doesn't work for standalone scripts.
So we need to install an installable trigger.
** This is because the trigger can only be installed properly from the UI. I am not sure why,
but Google keeps triggers created by the script disabled. This is automated when the first
diagram is inserted. Anyway, any UI will need this scope.



[resvg]: https://github.com/linebender/resvg
[wasm-image-add-on]: https://github.com/googleworkspace/apps-script-samples/blob/main/wasm/image-add-on
[pyvenn]: https://github.com/tctianchi/pyvenn
