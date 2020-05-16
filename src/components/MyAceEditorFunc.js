import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import "ace-builds/src-noconflict/ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-chrome";

const getAceInstance = () => {
  let ace;
  // Fallback for ace.require when vanilla ACE is hosted over a CDN
  if (window.ace) {
    ace = window.ace;
    ace.acequire = window.ace.require || window.ace.acequire;
  } else {
    ace = require("ace-builds");
  }
  return ace;
};
const ace = getAceInstance();

const MyAceEditor = (props) => {
  let editorEl = useRef(null);

  let node = null;
  let editor = null;
  let markerIDs = [];

  const handleOnClick = (e) => {
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

  const resetMarkerList = () => {
    markerIDs.forEach((el) => {
      editor.session.removeMarker(el);
    });
    markerIDs = [];
  };

  const handleOnChange = (e) => {
    props.onTextChange(editor.getValue());

    if (editor.getValue()[editor.getValue().length - 1] !== "?") {
      return;
    }

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
    resetMarkerList();

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

  useEffect(() => {
    node = ReactDOM.findDOMNode(editorEl.current);
    editor = ace.edit(node);
    editor.setTheme("ace/theme/clouds");
    editor.getSession().setMode("ace/mode/json");
    editor.setShowPrintMargin(false);
    editor.setOption("autoScrollEditorIntoView", true);
    editor.on("click", handleOnClick);
    editor.on("change", handleOnChange);
    editor.selection.on("changeCursor", (e) => {
      const pos = editor.getCursorPosition();
      props.onCursorPosChange({ ln: pos.row + 1, col: pos.column + 1 });
    });
  }, []);

  const style = {
    fontSize: "14px !important",
    border: "1px solid lightgray",
  };

  return (
    <div ref={editorEl} style={{ ...style, ...props.style }}>
      {props.code}
    </div>
  );
};

MyAceEditor.propTypes = {
  mode: PropTypes.string,
  content: PropTypes.string,
};

MyAceEditor.defaultProps = {
  mode: "json",
  code: '{\n  "rule-name": "Example rule",\n  "salience": 140\n}',
};

export default MyAceEditor;
