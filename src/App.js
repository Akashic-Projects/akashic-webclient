import React, { useState } from "react";
import { Layout, Typography, Button, Space, Checkbox, Input, Tabs } from "antd";

import Editor from "./components/Editor";
import RuleList from "./components/RuleList";

import Constsnts from "./constants/networking";

const { Header, Sider } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

function App() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleDisconenct = () => {
    setIsConnected(false);
  };

  const createRule = (uri) => {
    return fetch(uri, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "rule-name": "Test count rule",
        salience: 100,
        when: [
          { "?broj": "count(User.id > 1 and Course.name == 'Analiza 1')" },
          { assert: "test[?broj > User.age]" },
        ],
        then: [{ read: "Some value" }],
      }),
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

  const handleRuleCreateButtonClick = () => {
    const uri = `${Constsnts.API_BASE}/rules`;
    createRule(uri);
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
              <Button type="link" onClick={handleRuleCreateButtonClick}>
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

                  {!isConnected ? (
                    <Button type="primary" onClick={handleConnect}>
                      Connect
                    </Button>
                  ) : (
                    <Button type="primary" danger onClick={handleDisconenct}>
                      Disconnect
                    </Button>
                  )}
                </Space>
              </TabPane>
              <TabPane tab="Rules" key="1">
                <RuleList style={{ height: "100%" }} />
              </TabPane>
              <TabPane tab="DSDs" key="3">
                Content of card tab 3
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
