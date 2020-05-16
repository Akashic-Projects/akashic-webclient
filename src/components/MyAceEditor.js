import React, { Component } from "react";
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

class MyAceEditor extends Component {
  constructor(props) {
    super(props);
    this.state = { editor: undefined };

    this.node = null;
    this.editor = null;
    this.markerIDs = [];

    this.handleOnClick = this.handleOnClick.bind(this);
    this.resetMarkerList = this.resetMarkerList.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  static propTypes = {
    mode: PropTypes.string,
    content: PropTypes.string,
  };

  static defaultProps = {
    mode: "json",
    code: '{\n  "rule-name": "Example rule",\n  "salience": 140\n}',
  };

  handleOnClick(e) {
    let pos = this.editor.getCursorPosition();
    let token = this.editor.session.getTokenAt(pos.row, pos.column);

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
  }

  resetMarkerList(editor) {
    this.markerIDs.forEach((el) => {
      this.editor.session.removeMarker(el);
    });
    this.markerIDs = [];
  }

  handleOnChange(e) {
    this.props.onTextChange(this.editor.getValue());

    // Start new search
    let searchRegex = /\?{2,}/g;
    this.editor.findAll(searchRegex, {
      backwards: false,
      wrap: false,
      caseSensitive: true,
      wholeWord: true,
      regExp: true,
      preventScroll: false,
    });

    let ranges = this.editor.getSelection().getAllRanges();

    this.editor.getSelection().clearSelection();
    this.editor.selection.moveCursorToPosition(e.start);

    let allMarekrs = this.editor.session.getMarkers(false);
    console.log("Markeri: ");
    console.log(allMarekrs);

    // Reset marker list
    this.resetMarkerList(this.editor);

    // Add merkers to the editor
    ranges.forEach((el) => {
      if (Math.abs(el.start.column - el.end.column) >= 2) {
        // Add marker to editor
        let markerID = this.editor.session.addMarker(el, "ace_step", "text");
        // let markerID = editor.session.addMarker(el, "ace_bracket", "text");

        // Add marker ID to marker list
        this.markerIDs = [...this.markerIDs, markerID];

        console.log("Rejndzevi: ");
        console.log(ranges);
      }
    });
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this.refs.editor_root);
    this.editor = ace.edit(this.node);
    this.editor.setTheme("ace/theme/clouds");
    this.editor.getSession().setMode("ace/mode/json");
    this.editor.setShowPrintMargin(false);
    this.editor.setOption("autoScrollEditorIntoView", true);
    this.editor.on("click", this.handleOnClick);
    this.editor.on("change", this.handleOnChange);
  }

  render() {
    const style = {
      fontSize: "14px !important",
      border: "1px solid lightgray",
    };
    return (
      <div ref="editor_root" style={{ ...style, ...this.props.style }}>
        {this.props.code}
      </div>
    );
  }
}

export default MyAceEditor;
