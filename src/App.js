import React, { useState } from "react";
import { Layout, Typography, Button, Space, Input, Tabs } from "antd";

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
        console.log(responseJson);
        return responseJson;
      })
      .catch((error) => {
        console.error("Error: " + error);
      });
  };

  const handleCreateButtonClick = () => {
    if (currentTabKey === "rules") {
      const uri = `${Constsnts.API_BASE}/rules`;
      create(uri, editorText);
    } else if (currentTabKey === "dsds") {
      const uri = `${Constsnts.API_BASE}/dsds`;
      create(uri, editorText);
    }
  };

  const data = [
    "Racing car sprays burning fuel into crowd.",
    "Japanese princess to wed commoner.",
    "Australian walks 100km after outback crash.",
    "Man charged over missing wedding girl.",
    "Los Angeles battles huge wildfires.",
  ];

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
        <Space size={259}>
          <div>
            <Text style={{ color: "#fa541c", fontSize: 33 }}>akashic</Text>
            <Text style={{ color: "#fa541c", fontSize: 14 }}> webclient</Text>
          </div>
          <Space size={"small"}>
            <Button type="link">View transpiled code</Button>
            <Button type="link">Assist me</Button>
            <Button type="link" onClick={handleCreateButtonClick}>
              Create
            </Button>
            <Button type="link">Save</Button>
            <Button type="link" danger>
              Delete
            </Button>
          </Space>
        </Space>
      </Header>
      <Layout>
        <Sider width={500} className="site-layout-background" theme="light">
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
            <TabPane tab="Rules" key="rules">
              <RuleList />
            </TabPane>
            <TabPane tab="DSDs" key="dsds">
              <DSDList />
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
            {/* <Editor
              onTextChange={handleEditorTextChange}
              style={{ height: "70vh", width: "100%" }}
            /> */}
            <MyAceEditor
              onTextChange={handleOnEditorTextChange}
              onCursorPosChange={handleOnEditorCursorChange}
              style={{ height: "65vh", width: "100%" }}
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
