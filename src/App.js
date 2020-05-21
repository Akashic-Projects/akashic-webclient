import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Layout,
  Typography,
  Button,
  Space,
  Input,
  Tabs,
  Row,
  Col,
  Tooltip,
  message,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";

import ResizePanel from "react-resize-panel";
import style from "./App.css";
import classNames from "classnames/bind";

import AceEditor from "./components/AceEditor";
import RuleList from "./components/RuleList";
import DSDList from "./components/DSDList";

import Constsnts from "./constants/networking";

const { Header } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

const cx = classNames.bind(style);

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentTabKey, setCurrentTabKey] = useState("0");

  const [editorText, setEditorText] = useState("");
  const [editorCurPos, setEditorCurPos] = useState({ ln: 1, col: 1 });

  const [selectedDSD, setSelectedDSD] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);

  const [logEntries, setLogEntries] = useState([]);

  const myEditorRef = useRef();
  const dsdsList = useRef();
  const rulesList = useRef();
  const logList = useRef();

  const handleOnConnect = () => {
    setIsConnected(true);
  };

  const handleOnDisconenct = () => {
    setIsConnected(false);
  };

  const handleOnTabChange = (key) => {
    setCurrentTabKey(key);
  };

  const handleOnEditorTextChange = (text) => {
    setEditorText(text);
  };

  const handleOnEditorCursorChange = (curPos) => {
    setEditorCurPos(curPos);
  };

  const handleDSDSelectionChange = (record) => {
    setSelectedDSD(record);
    myEditorRef.current.setEditorText(JSON.stringify(record.dsd, null, "\t"));
  };

  const handleRuleSelectionChange = (record) => {
    setSelectedRule(record);
    myEditorRef.current.setEditorText(JSON.stringify(record.rule, null, "\t"));
  };

  const scrollLogToBottom = () => {
    logList.current.scrollTop = logList.current.offsetHeight;
  };

  const addLogEntry = (entry) => {
    setLogEntries(logEntries.concat([entry]));
    scrollLogToBottom();
  };

  const errorRespHandler = (err, customMessage) => {
    if (typeof err.response !== "undefined" && err.response.status === 400) {
      addLogEntry(err.response.data.meta);
    } else {
      message.error(customMessage + " Message: " + err.message);
    }
  };

  const create = (url, content, toReLoad) => {
    return axios({
      url,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: content,
    })
      .then((response) => {
        addLogEntry(response.data.meta);
      })
      .then(() => toReLoad.current.reLoad())
      .catch((err) =>
        errorRespHandler(err, "Internal error while creating new DSD.")
      );
  };

  const update = (url, content, toReLoad) => {
    return axios({
      url,
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: content,
    })
      .then((response) => {
        addLogEntry(response.data.meta);
      })
      .then(() => toReLoad.current.reLoad())
      .catch((err) =>
        errorRespHandler(err, "Internal error while updating DSD.")
      );
  };

  const deletee = (url, toReLoad) => {
    return axios({
      url,
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        addLogEntry(response.data.meta);
      })
      .then(() => toReLoad.current.reLoad())
      .catch((err) =>
        errorRespHandler(err, "Internal error while deleting DSD.")
      );
  };

  const typeToColor = (type) => {
    if (type === "SUCCESS") {
      return "green";
    } else if (type === "INFO") {
      return "blue";
    } else if (type === "ERROR") {
      return "red";
    }
  };

  const handleCreateButtonClick = () => {
    if (currentTabKey === "dsds") {
      const uri = `${Constsnts.API_BASE}/dsds`;
      create(uri, editorText, dsdsList);
    } else if (currentTabKey === "rules") {
      const uri = `${Constsnts.API_BASE}/rules`;
      create(uri, editorText, rulesList);
    }
  };

  const handleUpdateButtonClick = () => {
    if (currentTabKey === "dsds" && selectedDSD != null) {
      const uri = `${Constsnts.API_BASE}/dsds/` + selectedDSD["model-name"];
      update(uri, editorText, dsdsList);
    } else if (currentTabKey === "rules" && selectedRule != null) {
      const uri = `${Constsnts.API_BASE}/rules/` + selectedRule["rule-name"];
      update(uri, editorText, rulesList);
    }
  };

  const handleDeleteButtonClick = () => {
    if (currentTabKey === "dsds" && selectedDSD != null) {
      const uri = `${Constsnts.API_BASE}/dsds/` + selectedDSD["model-name"];
      deletee(uri, editorText, dsdsList);
    } else if (currentTabKey === "rules" && selectedRule != null) {
      const uri = `${Constsnts.API_BASE}/rules/` + selectedRule["rule-name"];
      deletee(uri, editorText, rulesList);
    }
  };

  const infoLine = (
    <div
      style={{
        width: "100%",
        heigh: "30px",
        backgroundColor: "#ededed",
        paddingRight: 50,
        textAlign: "right",
      }}
    >
      <Row>
        <Col span={11}>
          <div
            style={{
              width: "100%",
              backgroundColor: "#ededed",
              paddingRight: 50,
              textAlign: "left",
              paddingLeft: 4,
            }}
          >
            <Tooltip placement="top" title="Clear log" mouseEnterDelay={0.5}>
              <Button
                type="dashed"
                icon={<CloseOutlined />}
                size="small"
                danger
                onClick={(e) => {
                  setLogEntries([]);
                }}
              ></Button>
            </Tooltip>
          </div>
        </Col>
        <Col span={2} style={{ textAlign: "center" }}>
          <Text
            style={{
              marginLeft: 47,
            }}
          >
            {" "}
            Logs
          </Text>
        </Col>
        <Col span={11}>
          <div
            style={{
              width: "100%",
              backgroundColor: "#ededed",
              paddingRight: 4,
              textAlign: "right",
            }}
          >
            <Text style={{ color: "black", fontSize: 14 }}>
              Ln {editorCurPos.ln}, Col {editorCurPos.col}
            </Text>
          </div>
        </Col>
      </Row>
    </div>
  );

  const logViewer = (
    <ResizePanel
      direction="n"
      style={{ height: "40%", width: "100%", border: "1px solid lightgray" }}
    >
      <div className={cx("footer", "panel")}>
        <Layout
          ref={logList}
          style={{
            width: "100%",
            //height: "100%",
            overflowX: "scroll",
          }}
        >
          <code
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              //backgroundColor: "#ededed",
              //whiteSpace: "wrap",
            }}
          >
            {logEntries.map((item) => (
              <div style={{ lineHeight: "1em" }} key={Math.random()}>
                <span
                  style={{
                    color: typeToColor(item.type),
                    fontSize: 12,
                  }}
                >
                  {"[" +
                    item.timestamp +
                    "] " +
                    item.type +
                    " at (" +
                    item.ln +
                    ", " +
                    item.col +
                    ")" +
                    " >> " +
                    item.text}
                </span>
              </div>
            ))}
          </code>
        </Layout>
      </div>
    </ResizePanel>
  );

  return (
    <Layout style={{ height: "100vh" }}>
      <Header
        className="header"
        style={{
          backgroundColor: "white",
          borderBottom: 10,
          borderBottomColor: "black",
          height: "11vh",
        }}
      >
        <Layout style={{ width: "100%", backgroundColor: "white" }}>
          <Row>
            <Col span={6}>
              <div>
                <Text style={{ color: "#fa541c", fontSize: 33 }}>akashic</Text>
                <Text style={{ color: "#fa541c", fontSize: 14 }}>
                  {" "}
                  webclient
                </Text>
              </div>
            </Col>
            <Col span={15}>
              <Space size={"small"}>
                <Button type="link">View transpiled code + details</Button>
                <Button type="link">Assist me</Button>
                <Button type="link" onClick={handleCreateButtonClick}>
                  Create
                </Button>
                <Button type="link" onClick={handleUpdateButtonClick}>
                  Update
                </Button>
                <Button type="link" onClick={handleDeleteButtonClick} danger>
                  Delete
                </Button>
              </Space>
            </Col>
            <Col span={3}>
              <Button type="link">View Akashic Docs</Button>
            </Col>
          </Row>
        </Layout>
      </Header>
      <Layout>
        <div className={cx("container")}>
          <div className={cx("body")}>
            <ResizePanel direction="e" style={{ flexGrow: "1" }}>
              <div className={cx("sidebar", "panel")}>
                <Tabs
                  defaultActiveKey="0"
                  type="card"
                  size="small"
                  onChange={handleOnTabChange}
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <TabPane
                    tab="Setup"
                    key="setup"
                    style={{
                      paddingTop: 10,
                      paddingLeft: 40,
                      paddingRight: 40,
                    }}
                  >
                    <Space direction="vertical">
                      <Input
                        placeholder="server IP:PORT"
                        allowClear
                        onChange={() => {}}
                      />

                      {!isConnected ? (
                        <Button type="primary" onClick={handleOnConnect}>
                          Connect
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          danger
                          onClick={handleOnDisconenct}
                        >
                          Disconnect
                        </Button>
                      )}
                    </Space>
                  </TabPane>
                  <TabPane tab="DSDs" key="dsds">
                    <DSDList
                      ref={dsdsList}
                      onSelectionChange={handleDSDSelectionChange}
                      onAddLogEntry={addLogEntry}
                    />
                  </TabPane>
                  <TabPane tab="Rules" key="rules">
                    <RuleList
                      ref={rulesList}
                      onSelectionChange={handleRuleSelectionChange}
                      onAddLogEntry={addLogEntry}
                    />
                  </TabPane>
                </Tabs>
              </div>
            </ResizePanel>
            <div
              className={cx("content", "panel")}
              style={{ float: "left", flexFlow: "column nowrap" }}
            >
              <AceEditor
                ref={myEditorRef}
                onTextChange={handleOnEditorTextChange}
                onCursorPosChange={handleOnEditorCursorChange}
                style={{ height: "100%", width: "100%" }}
                text={editorText}
              />
              {infoLine}
              {logViewer}
            </div>
          </div>
        </div>
      </Layout>
    </Layout>
  );
}

export default App;
