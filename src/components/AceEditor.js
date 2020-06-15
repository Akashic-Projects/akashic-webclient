import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
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
var Range = ace.require("ace/range").Range;

const AceEditor = forwardRef((props, ref) => {
  let editorEl = useRef(null);

  let node = useRef(null);
  let editor = useRef(null);
  let markerIDs = useRef([]);

  useImperativeHandle(ref, () => ({
    setEditorText: (text) => {
      editor.current.setValue(text, 1);
    },
    addMarkers: addMarkers,
    replaceMarker: replaceMarker,
    resetMarkerList: resetMarkerList,
  }));

  const replaceMarker = (result) => {
    console.log("RESULT IN ACE: ");
    console.log(result);

    console.log("MARKERS IN ACE: ");
    let allMarekrs = editor.current.session.getMarkers(false);
    Object.values(allMarekrs).forEach((marker) => {
      if (
        marker.hasOwnProperty("range") &&
        marker.range.hasOwnProperty("hash") &&
        marker.range.hash === result.hash
      ) {
        console.log(marker);
        console.log(marker.range.hash);
        console.log("--------------");
        editor.current.session.removeMarker(marker.id);
        editor.current.session.replace(marker.range, String(result.value));
      }
    });
  };

  const handleOnClick = (e) => {
    let pos = editor.current.getCursorPosition();
    //let token = editor.current.session.getTokenAt(pos.row, pos.column);
    props.onClick(pos);
  };

  const resetMarkerList = () => {
    markerIDs.current.forEach((el) => {
      editor.current.session.removeMarker(el);
    });
    markerIDs.current = [];
  };

  const handleOnChange = (e) => {
    props.onTextChange(editor.current.getValue());
  };

  const addMarkers = (ranges_new) => {
    resetMarkerList();

    ranges_new = ranges_new.map((item) => {
      let startRow = item["data"]["line_start"] - 1;
      let startColumn = item["data"]["col_start"] - 1;
      let endRow = item["data"]["line_end"] - 1;
      let endColumn = item["data"]["col_end"] - 1;
      let aceRange = new Range(startRow, startColumn, endRow, endColumn);
      aceRange["hash"] = item["hash"];
      return aceRange;
    });
    // console.log("Genrisani Rejndzevi: ");
    // console.log(ranges_new);

    ranges_new.forEach((el) => {
      // Add marker to editor
      let markerID = editor.current.session.addMarker(el, "ace_step", "text");

      // Add marker ID to marker list
      markerIDs.current = [...markerIDs.current, markerID];
    });

    // let allMarekrs = editor.current.session.getMarkers(false);
    // console.log("Markeri: ");
    // console.log(allMarekrs);
  };

  useEffect(() => {
    node.current = ReactDOM.findDOMNode(editorEl.current);
    editor.current = ace.edit(node.current);
    editor.current.setTheme("ace/theme/clouds");
    editor.current.getSession().setMode("ace/mode/json");
    editor.current.setShowPrintMargin(false);
    editor.current.setOption("autoScrollEditorIntoView", true);
    editor.current.on("click", handleOnClick);
    editor.current.on("change", handleOnChange);
    editor.current.selection.on("changeCursor", (e) => {
      const pos = editor.current.getCursorPosition();
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
});

AceEditor.propTypes = {
  mode: PropTypes.string,
  content: PropTypes.string,
};

AceEditor.defaultProps = {
  mode: "json",
  code: '{\n  "rule-name": "Example rule",\n  "salience": 140\n}',
};

export default AceEditor;
