// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Code based on Google code available at
// https://github.com/googleworkspace/apps-script-samples/blob/main/wasm/image-add-on

use wasm_bindgen::prelude::*;
use js_sys::Uint8Array;
use resvg::{render, tiny_skia::{Pixmap, Transform}, usvg::{Options, Tree, fontdb}};

#[wasm_bindgen]
pub fn svg_to_png(svg: &str) -> JsValue {
  match svg_to_png_internal(svg) {
    Ok(bytes) => Uint8Array::from(&bytes[..]).into(),
    Err(e) => JsValue::from_str(&e.to_string()),
  }
}

#[derive(Debug)]
struct PixmapCreateError;
impl std::error::Error for PixmapCreateError {}
impl std::fmt::Display for PixmapCreateError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Error creating Pixmap")
    }
}

pub fn svg_to_png_internal(svg: &str) -> std::result::Result<Vec<u8>, Box<dyn std::error::Error>> {
    // TODO : only do this if we need to render text
    let mut db = fontdb::Database::new();
    db.load_font_data(include_bytes!("../assets/NotoSans-Regular.ttf").to_vec());

    // Load SVG parsing options
    let mut opt = Options::default();
    opt.fontdb = db.into();

    // Parse the SVG string into a tree
    let tree = Tree::from_str(svg, &opt)?;

    // Calculate the output size in pixels
    let size = tree.size().to_int_size();
    let width = size.width();
    let height = size.height();

    // Create an empty pixmap (canvas) to draw on
    let mut pixmap = Pixmap::new(width, height).ok_or(PixmapCreateError)?;

    // Render the SVG to the pixmap using default transform (no scaling)
    render(&tree, Transform::default(), &mut pixmap.as_mut());

    // Encode the pixmap as PNG
    Ok(pixmap.encode_png()?)
}
