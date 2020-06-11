import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
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
  Menu,
  Dropdown,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { DownOutlined } from "@ant-design/icons";

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

  const addLogEntry = (response, include_data = false) => {
    console.log(response);
    if (
      !response.hasOwnProperty("data") ||
      !response.data.hasOwnProperty("meta")
    ) {
      message.error("----Unexpected error. Malformed JSON probably.");
      return;
    }
    setLogEntries([response.data.meta, ...logEntries]);

    if (include_data) {
      setLogEntries([
        JSON.stringify(response.data.data, null, "\t"),
        ...logEntries,
      ]);
    }
  };

  const errorRespHandler = (err, customMessage) => {
    console.log("ERR");
    console.log(err);
    console.log(customMessage);
    if (
      !err.hasOwnProperty("response") ||
      !err.response.hasOwnProperty("data")
    ) {
      message.error("Unexpected error. Malformed JSON probably.");
      message.error(err);
      return 0;
    }
    if (typeof err.response !== "undefined" && err.response.status === 400) {
      addLogEntry(err.response);
    } else {
      message.error(customMessage + " Message: " + err.message);
    }
  };

  const run = (url) => {
    return axios({
      url,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        addLogEntry(response, true);
      })
      .catch((err) =>
        errorRespHandler(err, "Internal error while running engine")
      );
  };

  const loadAll = (url) => {
    return axios({
      url,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        addLogEntry(response);
      })
      .catch((err) =>
        errorRespHandler(
          err,
          "Internal error while loading all rules and models in engine."
        )
      );
  };

  const getTemplates = (url) => {
    return axios({
      url,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        addLogEntry(response, true);
      })
      .catch((err) =>
        errorRespHandler(
          err,
          "Internal error while getting all tempalte names."
        )
      );
  };

  const getRules = (url) => {
    return axios({
      url,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        addLogEntry(response, true);
      })
      .catch((err) =>
        errorRespHandler(err, "Internal error while getting all rule names.")
      );
  };

  const responseToMarkers = (response) => {
    if (
      !response.hasOwnProperty("data") ||
      !response.data.hasOwnProperty("meta")
    ) {
      message.error("----Unexpected error. Malformed JSON probably.");
      return;
    }
    myEditorRef.current.addMarkers(response.data.data);
  };

  const assist = (url) => {
    return axios({
      url,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        responseToMarkers(response);
        addLogEntry(response, true);
      })
      .catch((err) => errorRespHandler(err, "Internal error while assisting."));
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
        addLogEntry(response);
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
        addLogEntry(response);
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
        addLogEntry(response);
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

  const handleRunButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/run`;
    run(uri);
  };

  const handleLoadButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/load-all`;
    loadAll(uri);
  };

  const handleGetTempaltesButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/all-template-names`;
    getTemplates(uri);
  };

  const handleGetRulesButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/all-rule-names`;
    getRules(uri);
  };

  const handleAssistButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/assist`;
    assist(uri);
  };

  const handleViewTranspiledCodeButtonClick = () => {
    if (currentTabKey === "dsds" && selectedDSD != null) {
      setLogEntries([selectedDSD["clips_code"], ...logEntries]);
    } else if (currentTabKey === "rules" && selectedRule != null) {
      setLogEntries([selectedRule["clips_code"], ...logEntries]);
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
      deletee(uri, dsdsList);
    } else if (currentTabKey === "rules" && selectedRule != null) {
      const uri = `${Constsnts.API_BASE}/rules/` + selectedRule["rule-name"];
      deletee(uri, rulesList);
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
            backgroundColor: "white",
          }}
        >
          <code
            style={{
              marginTop: 10,
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              //backgroundColor: "#ededed",
              //whiteSpace: "wrap",
            }}
          >
            {logEntries.map((item) => (
              <div
                style={{ lineHeight: "1em", display: "block" }}
                key={uuidv4()}
              >
                {item.hasOwnProperty("timestamp") ? (
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
                      ") >> " +
                      item.text}
                  </span>
                ) : (
                  <div>
                    {item.split("\n").map((i, key) => {
                      return (
                        <span key={key} style={{ fontSize: 12 }}>
                          {i.split("\t").map((i, key) => {
                            return (
                              <span key={key} style={{ fontSize: 12 }}>
                                {i} &nbsp;&nbsp;&nbsp;&nbsp;
                              </span>
                            );
                          })}{" "}
                          <br />
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </code>
        </Layout>
      </div>
    </ResizePanel>
  );

  const dropdownMenu = (
    <Menu>
      <Menu.Item>
        <a onClick={handleViewTranspiledCodeButtonClick}>
          View transpiled code
        </a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={handleGetRulesButtonClick}>Get all rules in engine</a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={handleGetTempaltesButtonClick}>
          Get all tempaltes in engine
        </a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={handleLoadButtonClick}>
          Load all tempaltes and rules in engine
        </a>
      </Menu.Item>
    </Menu>
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
                <Button type="link" onClick={handleAssistButtonClick}>
                  Assist me
                </Button>
                <Button type="link" onClick={handleCreateButtonClick}>
                  Create/Define
                </Button>
                <Button type="link" onClick={handleUpdateButtonClick}>
                  Update/Modify
                </Button>
                <Button type="link" onClick={handleDeleteButtonClick} danger>
                  Delete/Undefine
                </Button>
                <Button type="link" onClick={handleRunButtonClick}>
                  Run Engine
                </Button>
                <Dropdown overlay={dropdownMenu}>
                  <a
                    className="ant-dropdown-link"
                    onClick={(e) => e.preventDefault()}
                  >
                    Other <DownOutlined />
                  </a>
                </Dropdown>
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
