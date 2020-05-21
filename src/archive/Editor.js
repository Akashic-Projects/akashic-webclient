import React /*, { useEffect }*/ from "react";

import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-chrome";

const Editor = (props) => {
  let editor = null;
  let markerIDs = [];

  /*const noRerender = useEffect(() => {
    console.log("editor rerendered");
  }, []);*/

  const resetMarkerList = (editor) => {
    markerIDs.forEach((el) => {
      editor.session.removeMarker(el);
    });
    markerIDs = [];
  };

  const editorClickHandler = function (e) {
    let editor = e.editor;
    let pos = editor.getCursorPosition();
    let token = editor.session.getTokenAt(pos.row, pos.column);

    if (token) {
      console.log("Clicked on: " + token.value);
    }

    // if (/\bkeyword\b/.test(token.type))
    //   console.log(token.value, "is a keyword");

    // // add highlight for the clicked token
    // let range = new Range(
    //   pos.row,
    //   token.start,
    //   pos.row,
    //   token.start + token.value.length
    // );
  };

  const handleOnEditorLoad = (newEditor) => {
    editor = newEditor;
    editor.on("click", editorClickHandler);
  };

  const handleOnChange = (value, e) => {
    console.log("Change event objekat: ");
    console.log(e);

    // Start new search
    let searchRegex = /\?{2,}/g;
    editor.findAll(searchRegex, {
      backwards: false,
      wrap: false,
      caseSensitive: true,
      wholeWord: true,
      regExp: true,
      preventScroll: false,
    });

    let ranges = editor.getSelection().getAllRanges();

    editor.getSelection().clearSelection();
    editor.selection.moveCursorToPosition(e.start);

    let allMarekrs = editor.session.getMarkers(false);
    console.log("Markeri: ");
    console.log(allMarekrs);

    // Reset marker list
    resetMarkerList(editor);

    // Add merkers to the editor
    ranges.forEach((el) => {
      if (Math.abs(el.start.column - el.end.column) >= 2) {
        // Add marker to editor
        let markerID = editor.session.addMarker(el, "ace_step", "text");
        // let markerID = editor.session.addMarker(el, "ace_bracket", "text");

        // Add marker ID to marker list
        markerIDs = [...markerIDs, markerID];

        console.log("Rejndzevi: ");
        console.log(ranges);
      }
    });
  };

  return (
    <AceEditor
      mode="json"
      theme="chrome"
      name="UNIQUE_ID_OF_DIV"
      editorProps={{ $blockScrolling: true }}
      onLoad={handleOnEditorLoad}
      onChange={handleOnChange}
      style={props.style}
    />
  );
};

export default Editor;
