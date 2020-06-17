import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import {
  Layout,
  Typography,
  Button,
  Space,
  Modal,
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
import AssistanceModal from "./components/AssistanceModal";

import Constsnts from "./constants/networking";

const { Header } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

const cx = classNames.bind(style);

const App = () => {
  const [currentTabKey, setCurrentTabKey] = useState("dsds");

  const [editorText, setEditorText] = useState("");
  const [editorCurPos, setEditorCurPos] = useState({ ln: 1, col: 1 });

  const [selectedDSD, setSelectedDSD] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);

  const [logEntries, setLogEntries] = useState([]);

  const results = useRef([]);
  const resultChoice = useRef(null);
  const [resultsToShow, setResultsToShow] = useState([]);

  const [assModalVisible, setAssModalVisible] = useState(false);

  const myEditorRef = useRef();
  const dsdsList = useRef();
  const rulesList = useRef();
  const logList = useRef();

  const endAssistance = () => {
    results.current = [];
    setResultsToShow([]);
    setAssModalVisible(false);
    myEditorRef.current.resetMarkerList();
  };

  const handleEditorCodeClick = (pos) => {
    let showModal = false;
    let out_results = [];
    results.current.forEach((result) => {
      console.log("RESULTS:");
      console.log(result);
      console.log("POS:");
      console.log(pos);

      if (
        pos.row >= result["data"]["line_start"] - 1 &&
        pos.row <= result["data"]["line_end"] - 1 &&
        pos.column >= result["data"]["col_start"] - 1 &&
        pos.column <= result["data"]["col_end"] - 1
      ) {
        showModal = true;
        out_results = [...out_results, result];
        console.log("ok");
      }
      console.log("-------------");
    });
    setResultsToShow(out_results);
    setAssModalVisible(showModal);
  };

  const handleModalOk = (e) => {
    myEditorRef.current.replaceMarker(resultChoice.current);
    setAssModalVisible(false);
  };

  const handleModalCancel = (e) => {
    setAssModalVisible(false);
  };

  const handleAssModalSelectionChange = (record) => {
    resultChoice.current = record;
    console.log(record);
  };

  const handleOnTabChange = (key) => {
    setCurrentTabKey(key);
    endAssistance();
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
    endAssistance();
  };

  const handleRuleSelectionChange = (record) => {
    setSelectedRule(record);
    myEditorRef.current.setEditorText(JSON.stringify(record.rule, null, "\t"));
    endAssistance();
  };

  const addLogEntry = (response, include_data = false) => {
    if (
      !response ||
      !response.hasOwnProperty("data") ||
      !response.data.hasOwnProperty("meta")
    ) {
      message.error("Unexpected error. Malformed JSON probably.");
      return 1;
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
    if (
      !err ||
      !err.hasOwnProperty("response") ||
      !err.response.hasOwnProperty("data")
    ) {
      message.error("Unexpected error. Malformed JSON probably.");
      message.error(err);
      return 1;
    }
    if (typeof err.response !== "undefined" && err.response.status === 400) {
      addLogEntry(err.response);
      console.log("help");
      console.log(err.response);
      if (
        err.response.data.hasOwnProperty("data") &&
        err.response.data.data != null
      ) {
        myEditorRef.current.setEditorText(
          JSON.stringify(err.response.data.data, null, "\t")
        );
      }
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
      method: "POST",
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

  const getAll = (url, what) => {
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
        errorRespHandler(err, `Internal error while getting all ${what}.`)
      );
  };

  const responseToMarkers = (data) => {
    if (!data.hasOwnProperty("meta")) {
      message.error("Unexpected error. Malformed JSON probably.");
      return;
    }
    // Prepare query results (isolate unique positions)
    let dict = {};
    let adj_results = [];
    data.data["query_results"].forEach((el) => {
      const hash =
        el["data"]["line_start"] +
        "-" +
        el["data"]["col_start"] +
        "-" +
        el["data"]["line_end"] +
        "-" +
        el["data"]["col_end"];

      el["hash"] = hash;
      el["key"] = uuidv4();
      el["value"] = el["data"]["value"];

      dict[hash] = el;
      adj_results = [...adj_results, el];
    });
    myEditorRef.current.addMarkers(Object.values(dict));
    return adj_results;
  };

  //TODO: Make option in other to reset engine
  //TODO: In item of rule list add indicator to show if rule is in engine or not
  const assist = (url, content) => {
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
        return response.data;
      })
      .then((data) => {
        myEditorRef.current.setEditorText(
          JSON.stringify(data.data["rule"], null, "\t")
        );
        let adj_results = responseToMarkers(data);
        results.current = adj_results;
      })
      .catch((err) => errorRespHandler(err, "Internal error while assisting."));
  };

  const create = (url, content, toReLoad, type) => {
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
        myEditorRef.current.setEditorText(
          JSON.stringify(response.data.data[type], null, "\t")
        );
      })
      .then(() => toReLoad.current.reLoad())
      .catch((err) =>
        errorRespHandler(err, `Internal error while creating new ${type}.`)
      );
  };

  const update = (url, content, toReLoad, type) => {
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
        myEditorRef.current.setEditorText(
          JSON.stringify(response.data.data[type], null, "\t")
        );
      })
      .then(() => toReLoad.current.reLoad())
      .catch((err) =>
        errorRespHandler(err, `Internal error while updating ${type}.`)
      );
  };

  const deletee = (url, toReLoad, type) => {
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
        errorRespHandler(err, `Internal error while deleting ${type}.`)
      );
  };

  const handleRunButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/run`;
    run(uri);
  };

  const handleLoadTemplatesButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/load-all-templates`;
    loadAll(uri);
  };

  const handleLoadRulesButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/load-all-rules`;
    loadAll(uri);
  };

  const handleGetTempaltesButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/all-template-names`;
    getAll(uri, "tempalte names");
  };

  const handleGetRulesButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/all-rule-names`;
    getAll(uri, "rule names");
  };

  const handleGetFactsButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/all-facts`;
    getAll(uri, "facts");
  };

  const handleAssistButtonClick = () => {
    if (currentTabKey === "rules" && selectedRule != null) {
      const uri = `${Constsnts.API_BASE}/assist`;
      assist(uri, editorText);
    }
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
      create(uri, editorText, dsdsList, "dsd");
    } else if (currentTabKey === "rules") {
      const uri = `${Constsnts.API_BASE}/rules`;
      create(uri, editorText, rulesList, "rule");
    }
  };

  const handleUpdateButtonClick = () => {
    if (currentTabKey === "dsds" && selectedDSD != null) {
      const uri = `${Constsnts.API_BASE}/dsds/` + selectedDSD["dsd-name"];
      update(uri, editorText, dsdsList, "dsd");
    } else if (currentTabKey === "rules" && selectedRule != null) {
      const uri = `${Constsnts.API_BASE}/rules/` + selectedRule["rule-name"];
      update(uri, editorText, rulesList, "rule");
    }
  };

  const handleDeleteButtonClick = () => {
    if (currentTabKey === "dsds" && selectedDSD != null) {
      const uri = `${Constsnts.API_BASE}/dsds/` + selectedDSD["dsd-name"];
      deletee(uri, dsdsList, "dsd");
    } else if (currentTabKey === "rules" && selectedRule != null) {
      const uri = `${Constsnts.API_BASE}/rules/` + selectedRule["rule-name"];
      deletee(uri, rulesList, "rule");
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

  const typeToColor = (type) => {
    if (type === "SUCCESS") {
      return "green";
    } else if (type === "INFO") {
      return "blue";
    } else if (type === "ERROR") {
      return "red";
    }
  };

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
      <Menu.Item onClick={handleViewTranspiledCodeButtonClick}>
        View transpiled code
      </Menu.Item>
      <Menu.Item onClick={handleGetRulesButtonClick}>Get all rules</Menu.Item>
      <Menu.Item onClick={handleGetTempaltesButtonClick}>
        Get all tempaltes
      </Menu.Item>
      <Menu.Item onClick={handleGetFactsButtonClick}>Get all facts</Menu.Item>
      <Menu.Item onClick={handleLoadTemplatesButtonClick} danger>
        Load all tempaltes into engine
      </Menu.Item>
      <Menu.Item onClick={handleLoadRulesButtonClick} danger={true}>
        Load all rules into engine
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
                <Modal
                  title="Basic Modal"
                  visible={assModalVisible}
                  onOk={handleModalOk}
                  onCancel={handleModalCancel}
                >
                  <AssistanceModal
                    data={resultsToShow}
                    onSelectionChange={handleAssModalSelectionChange}
                  />
                </Modal>
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
                onClick={handleEditorCodeClick}
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
};

export default App;
