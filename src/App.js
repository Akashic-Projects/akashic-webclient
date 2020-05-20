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

import MyAceEditor from "./components/MyAceEditorFunc";
import RuleList from "./components/RuleList";
import DSDList from "./components/DSDList";

import Constsnts from "./constants/networking";

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

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
      message.error(customMessage + "Internal message: " + err.message);
    }
  };

  const create = (url, content) => {
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
        dsdsList.current.reLoad();
        rulesList.current.reLoad();
      })
      .catch((err) =>
        errorRespHandler(err, "Internal error while creating new DSD.")
      );
  };

  const update = (url, content) => {
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
        dsdsList.current.reLoad();
        rulesList.current.reLoad();
      })
      .catch((err) =>
        errorRespHandler(err, "Internal error while updating DSD.")
      );
  };

  const deletee = (url) => {
    return axios({
      url,
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        addLogEntry(response.data.meta);
        dsdsList.current.reLoad();
        rulesList.current.reLoad();
      })
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
      create(uri, editorText);
    } else if (currentTabKey === "rules") {
      const uri = `${Constsnts.API_BASE}/rules`;
      create(uri, editorText);
    }
  };

  const handleUpdateButtonClick = () => {
    if (currentTabKey === "dsds" && selectedDSD != null) {
      const uri = `${Constsnts.API_BASE}/dsds/` + selectedDSD["model-name"];
      update(uri, editorText);
    } else if (currentTabKey === "rules" && selectedRule != null) {
      const uri = `${Constsnts.API_BASE}/rules/` + selectedRule["rule-name"];
      update(uri, editorText);
    }
  };

  const handleDeleteButtonClick = () => {
    if (currentTabKey === "dsds" && selectedDSD != null) {
      const uri = `${Constsnts.API_BASE}/dsds/` + selectedDSD["model-name"];
      deletee(uri, editorText);
    } else if (currentTabKey === "rules" && selectedRule != null) {
      const uri = `${Constsnts.API_BASE}/rules/` + selectedRule["rule-name"];
      deletee(uri, editorText);
    }
  };

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
        <Sider
          width={500}
          className="site-layout-background"
          theme="light"
          collapsible
          collapsedWidth={30}
        >
          <Tabs
            defaultActiveKey="0"
            type="card"
            size="small"
            onChange={handleOnTabChange}
          >
            <TabPane
              tab="Setup"
              key="setup"
              style={{ paddingTop: 10, paddingLeft: 40, paddingRight: 40 }}
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
                  <Button type="primary" danger onClick={handleOnDisconenct}>
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
        </Sider>
        <Layout style={{ padding: 0 }}>
          <Content
            className="site-layout-background"
            style={{
              margin: 0,
            }}
          >
            <MyAceEditor
              ref={myEditorRef}
              onTextChange={handleOnEditorTextChange}
              onCursorPosChange={handleOnEditorCursorChange}
              style={{ height: "65vh", width: "100%" }}
              text={editorText}
            />
            <Layout
              style={{
                width: "100%",
                backgroundColor: "#ededed",
                paddingRight: 50,
                textAlign: "right",
              }}
            >
              <Row>
                <Col span={12}>
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#ededed",
                      paddingRight: 50,
                      textAlign: "left",
                      paddingLeft: 4,
                    }}
                  >
                    <Tooltip
                      placement="top"
                      title="Clear log"
                      mouseEnterDelay={0.5}
                    >
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
                <Col span={12}>
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
            </Layout>
            <Footer style={{ padding: 0, margin: 0 }}>
              <div
                ref={logList}
                style={{
                  width: "100%",
                  height: "20vh",
                  overflowX: "scroll",
                }}
              >
                <code
                  style={{
                    width: "100%",
                    backgroundColor: "#ededed",
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
              </div>
            </Footer>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
