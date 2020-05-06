import React, { useState } from "react";
import { Modal, Button, Layout } from "antd";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";

const { Content } = Layout;

const Editor = (props) => {
  const [modalVisible, setModalVisible] = useState(false);

  let editor = null;
  let markerIDs = [];

  let resetMarkerList = () => {
    markerIDs.forEach((el) => {
      editor.session.removeMarker(el);
    });
    markerIDs = [];
  };

  const showModal = () => {
    setModalVisible(true);
  };

  let handleOnEditorLoad = (newEditor) => {
    editor = newEditor;

    // Handle clicks on highlighted words
    let clickHandler = function (e) {
      let editor = e.editor;
      console.log(e);
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

    // Set onClick handler function
    editor.on("click", clickHandler);
  };

  let handleOnChange = (value, e) => {
    let searchRegex = /\?{2,}/g;
    editor.findAll(searchRegex, {
      backwards: false,
      wrap: false,
      caseSensitive: true,
      wholeWord: true,
      regExp: true,
      preventScroll: false,
    });

    console.log(e);
    let ranges = editor.getSelection().getAllRanges();

    editor.getSelection().clearSelection();
    editor.selection.moveCursorToPosition(e.start);

    // Reset marker list
    resetMarkerList();

    let allMarekrs = editor.session.getMarkers(false);
    console.log(allMarekrs);

    // Add merkers to the editor
    ranges.forEach((el) => {
      if (Math.abs(el.start.column - el.end.column) >= 2) {
        // Add marker to editor
        // let markerID = editor.session.addMarker(el, "ace_step", "text");
        let markerID = editor.session.addMarker(el, "ace_bracket", "text");

        // Add marker ID to marker list
        markerIDs = [...markerIDs, markerID];

        console.log(ranges);
      }
    });
  };

  return (
    <Content
      className="site-layout-background"
      style={{
        margin: 0,
        height: "100%",
      }}
    >
      <AceEditor
        mode="json"
        theme="monokai"
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
        onLoad={handleOnEditorLoad}
        onChange={handleOnChange}
        style={{ height: 400, width: "100%" }}
      />
      <Modal
        title="Basic Modal"
        visible={modalVisible}
        onOk={() => {
          setModalVisible(false);
        }}
        onCancel={() => {
          setModalVisible(false);
        }}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
    </Content>
  );
};

export default Editor;
