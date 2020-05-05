import React from "react";
import { Layout, Typography, Button, Space, Checkbox, Input } from "antd";

import Editor from "./components/Editor";
import RuleList from "./components/RuleList";

const { Header, Sider } = Layout;
const { Text } = Typography;

function App() {
  const handleCheckboxChange = (e) => {
    console.log("cBox change..");
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Layout>
        <Header className="header">
          <Space size={50}>
            <div>
              <Text style={{ color: "white", fontSize: 24 }}>akashic</Text>
              <Text style={{ color: "white", fontSize: 14 }}> webclient</Text>
            </div>
            <Input
              placeholder="server IP:PORT"
              allowClear
              onChange={() => {}}
            />
            <Checkbox onChange={handleCheckboxChange}>
              <Text style={{ color: "white", fontSize: 13 }}>
                Pause akashic server
              </Text>
            </Checkbox>
            <Space size={"small"}>
              <Button type="link">Create</Button>
              <Button type="link">Assist me</Button>
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
          >
            <RuleList style={{ height: "100%" }} />
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
