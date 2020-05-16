import React, { useState, useEffect } from "react";

import {
  Table,
  Input,
  Space,
  Button,
  Switch,
  Spin,
  message,
  Typography,
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";

import Constsnts from "../constants/networking";

const { Text } = Typography;

const DSDList = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleLoadRules = (uri) => {
    return fetch(uri, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) =>
        responseJson.map((e) => {
          return { ...e, key: e["model-name"] };
        })
      )
      .catch((error) => {
        console.error("Error: " + error);
        message.error("Error while fetching rules.");
      });
  };

  const loadDSDs = () => {
    const uri = `${Constsnts.API_BASE}/dsds`;

    setLoading(true);
    handleLoadRules(uri).then((res) => {
      setLoading(false);
      setRules(res);
      console.log(res);
    });
  };

  useEffect(() => {
    loadDSDs();
  }, []);

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text, row) =>
      searchedColumn === dataIndex ? (
        <div>
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text.toString()}
          />
          <br />
          <Text style={{ color: "black", fontSize: 12 }}>
            Unique DSD model name: {row["dsd-name"]}
          </Text>
        </div>
      ) : (
        <div>
          <Text>{text}</Text>
          <br />
          <Text style={{ color: "black", fontSize: 12 }}>
            Unique DSD model name: {row["model-name"]}
          </Text>
        </div>
      ),
  });

  const columns = [
    {
      title: "DSD name",
      dataIndex: "dsd-name",
      width: 600,
      ...getColumnSearchProps("dsd-name"),
    },
    {
      title: "Activity",
      dataIndex: "active",
      width: 60,
      render: (value, row) => (
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          checked={value}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    columnWidth: 27,
    onChange: () => {},
    type: "radio",
  };

  return (
    <Spin spinning={loading}>
      <Table
        columns={columns}
        dataSource={rules}
        pagination={{
          position: ["bottomCenter"],
          defaultPageSize: 7,
        }}
        showHeader={true}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRowKeys([record.key]);
          },
        })}
        rowSelection={rowSelection}
      />
    </Spin>
  );
};

export default DSDList;