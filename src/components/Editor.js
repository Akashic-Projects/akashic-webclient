import React, { useState } from "react";
import { Modal, Button, Layout } from "antd";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";

const { Content } = Layout;

const Editor = (props) => {
  const [editor, setEditor] = useState(undefined);
  const [modalVisible, setModalVisible] = useState(false);

  // const showModal = () => {
  //   setModalVisible(true);
  // };

  let handleOnEditorLoad = (newEditor) => {
    setEditor(newEditor);
  };

  let handleOnChange = (value, e) => {
    let searchRegex = /\?{2,}/g;
    editor.findAll(searchRegex, {
      backwards: false,
      wrap: true,
      caseSensitive: true,
      wholeWord: true,
      regExp: true,
      preventScroll: false,
    });

    var ranges = editor.getSelection().getAllRanges();
    console.log(ranges);

    editor.getSelection().clearSelection();
    editor.selection.moveCursorToPosition(e.end);

    //////////////////////////////////////
    // ranges.forEach((el) => {
    //   if (Math.abs(el.start.column - el.end.column) >= 2) {
    //     // Add marker
    //     // editor.session.addDynamicMarker(highlight1);

    //     console.log(ranges);
    //   }
    // });
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
      <Button type="primary" onClick={handleOnChange}>
        Open Modal
      </Button>
    </Content>
  );
};

export default Editor;
