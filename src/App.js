import React, { useState, useRef } from "react";
import { Layout, Typography, Button, Space, Input, Tabs, Row, Col } from "antd";

import MyAceEditor from "./components/MyAceEditorFunc";
import RuleList from "./components/RuleList";
import DSDList from "./components/DSDList";

import Constsnts from "./constants/networking";

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [logText, setLogText] = useState("ERROR: This is a test.");
  const [currentTabKey, setCurrentTabKey] = useState("0");

  const [editorText, setEditorText] = useState("");
  const [editorCurPos, setEditorCurPos] = useState({ ln: 1, col: 1 });

  const [selectedDSD, setSelectedDSD] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);

  const myEditorRef = useRef();
  const dsdsList = useRef();
  const rulesList = useRef();

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

  const create = (uri, content) => {
    return fetch(uri, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: content,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("Create resp:");
        console.log(responseJson);
        return responseJson;
      })
      .catch((error) => {
        console.error("Error: " + error);
      });
  };

  const update = (uri, content) => {
    return fetch(uri, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: content,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("Update resp:");
        console.log(responseJson);
        return responseJson;
      })
      .catch((error) => {
        console.error("Error: " + error);
      });
  };

  const deletee = (uri, content) => {
    return fetch(uri, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).catch((error) => {
      console.error("Error: " + error);
    });
  };

  const handleCreateButtonClick = () => {
    if (currentTabKey === "dsds") {
      const uri = `${Constsnts.API_BASE}/dsds`;
      create(uri, editorText).then(() => dsdsList.current.reLoad());
    } else if (currentTabKey === "rules") {
      const uri = `${Constsnts.API_BASE}/rules`;
      create(uri, editorText).then(() => rulesList.current.reLoad());
    }
  };

  const handleUpdateButtonClick = () => {
    if (currentTabKey === "dsds" && selectedDSD != null) {
      const uri = `${Constsnts.API_BASE}/dsds/` + selectedDSD["model-name"];
      update(uri, editorText).then(() => dsdsList.current.reLoad());
    } else if (currentTabKey === "rules" && selectedRule != null) {
      const uri = `${Constsnts.API_BASE}/rules/` + selectedRule["rule-name"];
      update(uri, editorText).then(() => rulesList.current.reLoad());
    }
  };

  const handleDeleteButtonClick = () => {
    if (currentTabKey === "dsds" && selectedDSD != null) {
      const uri = `${Constsnts.API_BASE}/dsds/` + selectedDSD["model-name"];
      deletee(uri, editorText).then(() => dsdsList.current.reLoad());
    } else if (currentTabKey === "rules" && selectedRule != null) {
      const uri = `${Constsnts.API_BASE}/rules/` + selectedRule["rule-name"];
      deletee(uri, editorText).then(() => rulesList.current.reLoad());
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
                <Button type="link">View transpiled code</Button>
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
              />
            </TabPane>
            <TabPane tab="Rules" key="rules">
              <RuleList
                ref={rulesList}
                onSelectionChange={handleRuleSelectionChange}
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
            <div
              style={{
                width: "100%",
                backgroundColor: "#ededed",
                paddingRight: 50,
                textAlign: "right",
              }}
            >
              <Text style={{ color: "black", fontSize: 14 }}>
                Ln {editorCurPos.ln}, Col {editorCurPos.col}
              </Text>
            </div>
            <Footer style={{ padding: 0, margin: 0 }}>
              <TextArea
                autoSize={{ minRows: 5 }}
                style={{
                  width: "100%",
                  backgroundColor: "#ededed",
                }}
                value={logText}
              />
            </Footer>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
