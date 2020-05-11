import React, { useState } from "react";
import { Layout, Typography, Button, Space, Checkbox, Input, Tabs } from "antd";

import Editor from "./components/Editor";
import RuleList from "./components/RuleList";

const { Header, Sider } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

function App() {
  const [isPausedServer, setIsPausedServer] = useState(false);

  const handlePauseServer = () => {
    setIsPausedServer(true);
  };

  const handleResumeServer = () => {
    setIsPausedServer(false);
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Layout>
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
              <Button type="link">Create</Button>
              <Button type="link">Save</Button>
              <Button type="link" danger>
                Delete
              </Button>
            </Space>
          </Space>
        </Header>
        <Layout>
          <Sider
            width={500}
            style={{ height: "100%" }}
            className="site-layout-background"
            theme="light"
          >
            <Tabs defaultActiveKey="0" type="card" size="small">
              <TabPane
                tab="Setup"
                key="0"
                style={{ paddingTop: 10, paddingLeft: 40, paddingRight: 40 }}
              >
                <Space direction="vertical">
                  <Input
                    placeholder="server IP:PORT"
                    allowClear
                    onChange={() => {}}
                  />

                  <Button type="primary">Connect</Button>
                  {!isPausedServer ? (
                    <Button type="primary" danger onClick={handlePauseServer}>
                      Pause akashic server
                    </Button>
                  ) : (
                    <Button type="primary" warning onClick={handleResumeServer}>
                      Resume akashic server
                    </Button>
                  )}
                </Space>
              </TabPane>
              <TabPane tab="Rules" key="1">
                <RuleList style={{ height: "100%" }} />
              </TabPane>
              <TabPane tab="Rule groups" key="2">
                Content of card tab 2
              </TabPane>
              <TabPane tab="DSDs" key="3">
                Content of card tab 3
              </TabPane>
              <TabPane tab="DSD groups" key="4">
                Content of card tab 4
              </TabPane>
            </Tabs>
          </Sider>
          <Layout style={{ padding: 0 }}>
            <Editor />
          </Layout>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
