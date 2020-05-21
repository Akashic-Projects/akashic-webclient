import React, {
  useEffect,
  useRef,
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

const AceEditor = forwardRef((props, ref) => {
  let editorEl = useRef(null);

  let node = useRef(null);
  let editor = useRef(null);
  let markerIDs = useRef([]);

  useImperativeHandle(ref, () => ({
    setEditorText: (text) => {
      editor.current.setValue(text, 1);
    },
  }));

  const handleOnClick = (e) => {
    let pos = editor.current.getCursorPosition();
    let token = editor.current.session.getTokenAt(pos.row, pos.column);

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
    markerIDs.current.forEach((el) => {
      editor.current.session.removeMarker(el);
    });
    markerIDs.current = [];
  };

  const handleOnChange = (e) => {
    props.onTextChange(editor.current.getValue());

    if (
      editor.current.getValue()[editor.current.getValue().length - 1] !== "?"
    ) {
      return;
    }

    // Start new search
    let searchRegex = /\?{2,}/g;
    editor.current.findAll(searchRegex, {
      backwards: false,
      wrap: false,
      caseSensitive: true,
      wholeWord: true,
      regExp: true,
      preventScroll: false,
    });

    let ranges = editor.current.getSelection().getAllRanges();

    editor.current.getSelection().clearSelection();
    editor.current.selection.moveCursorToPosition(e.start);

    let allMarekrs = editor.current.session.getMarkers(false);
    console.log("Markeri: ");
    console.log(allMarekrs);

    // Reset marker list
    resetMarkerList();

    // Add merkers to the editor
    ranges.forEach((el) => {
      if (Math.abs(el.start.column - el.end.column) >= 2) {
        // Add marker to editor
        let markerID = editor.current.session.addMarker(el, "ace_step", "text");
        // let markerID = editor.current.session.addMarker(el, "ace_bracket", "text");

        // Add marker ID to marker list
        markerIDs.current = [...markerIDs.current, markerID];

        console.log("Rejndzevi: ");
        console.log(ranges);
      }
    });
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
